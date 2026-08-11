const express = require("express");
const ExcelJS = require("exceljs");
const { ScanCommand, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("../lib/dynamo");
const { requireAdmin } = require("../lib/auth");
const { bucketInfo } = require("../lib/heatSheet");
const { refreshRingScores, applyRingScores } = require("../lib/liveScoring");

const router = express.Router();

const SESSIONS = ["morning", "afternoon"];
const RINGS = ["ring1", "ring2"];
const EMPTY_SESSIONS = () => ({
  morning: { ring1: [], ring2: [] },
  afternoon: { ring1: [], ring2: [] },
});

// Computes every current event "bucket" (age group + experience + event + gender) from live
// registration data. this is always the source of truth for *who's* in each bucket; the
// saved EVENT_ORDER item only records *where* (session/ring/order) each bucket has been
// manually placed.
async function computeBuckets() {
  const [{ Items: registrations }, { Items: links }, { Items: events }] = await Promise.all([
    doc.send(new ScanCommand({ TableName: TABLES.registrations })),
    doc.send(new ScanCommand({ TableName: TABLES.registrationEvents })),
    doc.send(new ScanCommand({ TableName: TABLES.events })),
  ]);
  const eventById = Object.fromEntries((events || []).map((e) => [e.id, e]));
  const registrationById = Object.fromEntries((registrations || []).map((r) => [r.id, r]));

  const buckets = new Map();
  for (const link of links || []) {
    const registration = registrationById[link.registration_id];
    const event = eventById[link.event_id];
    if (!registration || !event) continue;

    const { key, displayLabel, defaultSession } = bucketInfo(registration, event);
    if (!buckets.has(key)) {
      buckets.set(key, { key, displayLabel, defaultSession, competitorIds: [] });
    }
    buckets.get(key).competitorIds.push(registration.id);
  }

  return { buckets, registrationById };
}

async function loadSavedOrder() {
  const { Item } = await doc.send(new GetCommand({ TableName: TABLES.eventOrder, Key: { pk: "EVENT_ORDER" } }));
  return Item || { sessions: EMPTY_SESSIONS(), competitorOrder: {}, ignoreHighlightNames: [] };
}

// Merges live buckets with the saved manual arrangement: existing bucket placements/order
// are preserved, brand-new buckets get auto-placed by defaultSession (always Ring 1), and
// buckets with no competitors left (e.g. after a registration edit/delete) are dropped.
function mergeOrder(buckets, saved) {
  const savedSessions = saved.sessions || EMPTY_SESSIONS();
  const savedCompetitorOrder = saved.competitorOrder || {};
  const placedKeys = new Set();
  const result = EMPTY_SESSIONS();

  for (const session of SESSIONS) {
    for (const ring of RINGS) {
      const keys = savedSessions[session]?.[ring] || [];
      for (const key of keys) {
        const bucket = buckets.get(key);
        if (!bucket) continue; // stale — no competitors registered for it anymore
        placedKeys.add(key);
        const savedIds = savedCompetitorOrder[key] || [];
        const orderedIds = [
          ...savedIds.filter((id) => bucket.competitorIds.includes(id)),
          ...bucket.competitorIds.filter((id) => !savedIds.includes(id)),
        ];
        result[session][ring].push({ key, displayLabel: bucket.displayLabel, competitorIds: orderedIds });
      }
    }
  }

  // Anything not already placed (new buckets) gets auto-placed at the end of its default session, Ring 1.
  for (const bucket of buckets.values()) {
    if (placedKeys.has(bucket.key)) continue;
    result[bucket.defaultSession].ring1.push({
      key: bucket.key,
      displayLabel: bucket.displayLabel,
      competitorIds: bucket.competitorIds,
    });
  }

  return result;
}

function ringBlocksWithNames(merged, registrationById, ring) {
  const blocks = [];
  for (const session of SESSIONS) {
    for (const block of merged[session][ring]) {
      blocks.push({
        key: block.key,
        displayLabel: block.displayLabel,
        competitors: block.competitorIds
          .map((id) => registrationById[id])
          .filter(Boolean)
          .map((r) => ({ id: r.id, name: `${r.first_name} ${r.last_name}`, institution: r.institution })),
      });
    }
  }
  return blocks;
}

router.get("/", requireAdmin, async (_req, res) => {
  const [{ buckets, registrationById }, saved] = await Promise.all([computeBuckets(), loadSavedOrder()]);
  const merged = mergeOrder(buckets, saved);

  const withNames = {};
  for (const session of SESSIONS) {
    withNames[session] = {};
    for (const ring of RINGS) {
      withNames[session][ring] = merged[session][ring].map((block) => ({
        key: block.key,
        displayLabel: block.displayLabel,
        competitors: block.competitorIds
          .map((id) => registrationById[id])
          .filter(Boolean)
          .map((r) => ({ id: r.id, name: `${r.first_name} ${r.last_name}` })),
      }));
    }
  }

  res.json({ sessions: withNames, ignoreHighlightNames: saved.ignoreHighlightNames || [] });
});

router.put("/", requireAdmin, async (req, res) => {
  const { sessions, ignoreHighlightNames } = req.body || {};
  if (!sessions) return res.status(400).json({ error: "sessions is required" });

  const cleanSessions = EMPTY_SESSIONS();
  const competitorOrder = {};
  for (const session of SESSIONS) {
    for (const ring of RINGS) {
      const blocks = Array.isArray(sessions[session]?.[ring]) ? sessions[session][ring] : [];
      cleanSessions[session][ring] = blocks.map((b) => b.key);
      for (const b of blocks) {
        competitorOrder[b.key] = (b.competitors || []).map((c) => c.id);
      }
    }
  }

  await doc.send(
    new PutCommand({
      TableName: TABLES.eventOrder,
      Item: {
        pk: "EVENT_ORDER",
        sessions: cleanSessions,
        competitorOrder,
        ignoreHighlightNames: Array.isArray(ignoreHighlightNames) ? ignoreHighlightNames : [],
        updated_at: new Date().toISOString(),
      },
    })
  );

  res.json({ success: true });
});

function sanitizeSheetName(name, used) {
  let clean = String(name).replace(/[:\\/?*[\]]/g, "").slice(0, 31) || "Event";
  let candidate = clean;
  let i = 2;
  while (used.has(candidate)) {
    candidate = `${clean.slice(0, 28)} ${i}`;
    i += 1;
  }
  used.add(candidate);
  return candidate;
}

router.get("/export", requireAdmin, async (req, res) => {
  const ring = req.query.ring === "2" ? "ring2" : "ring1";
  const [{ buckets, registrationById }, saved, { Item: settings }] = await Promise.all([
    computeBuckets(),
    loadSavedOrder(),
    doc.send(new GetCommand({ TableName: TABLES.tournamentWebpage, Key: { pk: "SETTINGS" } })),
  ]);
  const merged = mergeOrder(buckets, saved);
  const blocks = ringBlocksWithNames(merged, registrationById, ring);

  const sheetUrl = ring === "ring2" ? settings?.live_scoring_ring2_url : settings?.live_scoring_ring1_url;
  const columns = {
    name: settings?.live_scoring_name_column,
    score: settings?.live_scoring_score_column,
  };
  const scoresByBlockKey = await refreshRingScores(ring, sheetUrl, columns, blocks);
  const withScores = applyRingScores(blocks, scoresByBlockKey);

  const workbook = new ExcelJS.Workbook();
  const usedNames = new Set();

  for (const block of withScores) {
    const sheet = workbook.addWorksheet(sanitizeSheetName(block.displayLabel, usedNames));
    sheet.columns = [
      { header: "Name", key: "name", width: 28 },
      { header: "School", key: "school", width: 32 },
      { header: "Final Score", key: "score", width: 14 },
    ];
    for (const c of block.competitors) {
      sheet.addRow({ name: c.name, school: c.institution, score: c.score ?? "" });
    }
  }

  if (workbook.worksheets.length === 0) {
    workbook.addWorksheet("No Events").addRow(["No events currently scheduled for this ring."]);
  }

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=${ring}-event-order.xlsx`);
  await workbook.xlsx.write(res);
  res.end();
});

module.exports = { router, computeBuckets, loadSavedOrder, mergeOrder, ringBlocksWithNames };
