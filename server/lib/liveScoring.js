const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const ExcelJS = require("exceljs");
const { doc, TABLES } = require("./dynamo");

function normalizeName(name) {
  return String(name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeTokens(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
}

function normalizeLabel(text) {
  return String(text || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function matchTabToBlock(tabName, blocks) {
  const normalizedTab = normalizeLabel(tabName);
  const exact = blocks.find((b) => normalizeLabel(b.displayLabel) === normalizedTab);
  if (exact) return exact;

  const tabTokens = normalizeTokens(tabName);
  let best = null;
  for (const block of blocks) {
    const labelTokens = normalizeTokens(block.displayLabel);
    if (labelTokens.length === 0) continue;
    const allPresent = labelTokens.every((token) => tabTokens.includes(token));
    if (allPresent && (!best || labelTokens.length > best.labelTokens.length)) {
      best = { block, labelTokens };
    }
  }
  return best?.block || null;
}

function rankByScore(scored) {
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  let rank = 0;
  let lastScore = null;
  return sorted.map((c, i) => {
    if (c.score !== lastScore) {
      rank = i + 1;
      lastScore = c.score;
    }
    return { ...c, rank };
  });
}

function pkForRing(ring) {
  return ring === "ring2" ? "LIVE_SCORES_RING2" : "LIVE_SCORES_RING1";
}

async function loadPersistedScores(ring) {
  const { Item } = await doc.send(new GetCommand({ TableName: TABLES.eventOrder, Key: { pk: pkForRing(ring) } }));
  return Item?.scores || {};
}

function toXlsxExportUrl(shareUrl) {
  const match = String(shareUrl || "").match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) return null;
  return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=xlsx`;
}


function cellText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if ("result" in value) return String(value.result ?? "");
    if (Array.isArray(value.richText)) return value.richText.map((t) => t.text).join("");
    if ("text" in value) return String(value.text ?? "");
    return "";
  }
  return String(value).trim();
}

function worksheetToObjects(worksheet) {
  const headers = [];
  worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber] = cellText(cell.value).toLowerCase();
  });

  const rows = [];
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    const obj = {};
    let hasValue = false;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber];
      if (!header) return;
      const text = cellText(cell.value);
      if (text) hasValue = true;
      obj[header] = text;
    });
    if (hasValue) rows.push(obj);
  }
  return rows;
}

async function refreshRingScores(ring, sheetUrl, columns, blocks) {
  const persisted = await loadPersistedScores(ring);
  if (!sheetUrl) return persisted;

  const exportUrl = toXlsxExportUrl(sheetUrl);
  if (!exportUrl) {
    console.error(`live-scoring: could not parse a spreadsheet ID out of the ${ring} URL`);
    return persisted;
  }

  const nameKey = (columns?.name || "name").trim().toLowerCase();
  const scoreKey = (columns?.score || "final score").trim().toLowerCase();

  let workbook;
  try {
    const sheetRes = await fetch(exportUrl);
    if (!sheetRes.ok) throw new Error(`Sheet fetch failed (${sheetRes.status})`);
    const buffer = Buffer.from(await sheetRes.arrayBuffer());
    workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
  } catch (err) {
    console.error(`live-scoring: could not refresh ${ring}:`, err);
    return persisted;
  }

  const merged = { ...persisted };
  let foundAny = false;

  for (const worksheet of workbook.worksheets) {
    const block = matchTabToBlock(worksheet.name, blocks);
    if (!block) continue;

    const competitorsByName = new Map(block.competitors.map((c) => [normalizeName(c.name), c]));
    const rows = worksheetToObjects(worksheet);
    for (const row of rows) {
      const name = normalizeName(row[nameKey]);
      if (!name) continue;
      const scoreRaw = (row[scoreKey] || "").trim();
      if (scoreRaw === "") continue;
      const score = Number(scoreRaw);
      if (!Number.isFinite(score)) continue;

      const competitor = competitorsByName.get(name);
      if (!competitor) continue;

      merged[block.key] = { ...(merged[block.key] || {}), [competitor.id]: score };
      foundAny = true;
    }
  }

  if (foundAny) {
    await doc.send(
      new PutCommand({
        TableName: TABLES.eventOrder,
        Item: { pk: pkForRing(ring), scores: merged, updated_at: new Date().toISOString() },
      })
    );
  }
  return merged;
}

function applyRingScores(blocks, scoresByBlockKey) {
  return blocks.map((block) => {
    const blockScores = scoresByBlockKey[block.key] || {};
    const withScores = block.competitors.map((c) => ({ ...c, score: blockScores[c.id] ?? null }));
    const scored = withScores.filter((c) => c.score !== null && c.score !== undefined);
    const unscored = withScores.filter((c) => c.score === null || c.score === undefined);
    return { ...block, competitors: [...rankByScore(scored), ...unscored.map((c) => ({ ...c, rank: null }))] };
  });
}

module.exports = { refreshRingScores, applyRingScores, matchTabToBlock, rankByScore, worksheetToObjects, toXlsxExportUrl };
