const express = require("express");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("../lib/dynamo");
const { refreshRingScores, applyRingScores } = require("../lib/liveScoring");
const { computeBuckets, loadSavedOrder, mergeOrder, ringBlocksWithNames } = require("./eventOrder");

const router = express.Router();

async function buildRingStatus(ring, blocks, sheetUrl, columns) {
  if (!sheetUrl) return { configured: false, events: [] };

  const scoresByBlockKey = await refreshRingScores(ring, sheetUrl, columns, blocks);
  const withScores = applyRingScores(blocks, scoresByBlockKey);

  const events = withScores.map((block) => {
    const competitors = block.competitors.map((c) => ({ id: c.id, name: c.name, score: c.score, rank: c.rank }));
    const scoredCount = competitors.filter((c) => c.score !== null && c.score !== undefined).length;
    const status =
      competitors.length === 0 || scoredCount === 0
        ? "upcoming"
        : scoredCount === competitors.length
        ? "completed"
        : "in_progress";
    return { key: block.key, displayLabel: block.displayLabel, status, competitors };
  });

  return { configured: true, events };
}

// Public (no auth)
router.get("/", async (_req, res) => {
  const { Item: settings } = await doc.send(
    new GetCommand({ TableName: TABLES.tournamentWebpage, Key: { pk: "SETTINGS" } })
  );
  const ring1Url = settings?.live_scoring_ring1_url;
  const ring2Url = settings?.live_scoring_ring2_url;

  if (!ring1Url && !ring2Url) {
    return res.json({ configured: false, ring1: null, ring2: null });
  }

  const columns = {
    name: settings?.live_scoring_name_column,
    score: settings?.live_scoring_score_column,
  };

  const { buckets, registrationById } = await computeBuckets();
  const saved = await loadSavedOrder();
  const merged = mergeOrder(buckets, saved);

  const [ring1, ring2] = await Promise.all([
    buildRingStatus("ring1", ringBlocksWithNames(merged, registrationById, "ring1"), ring1Url, columns),
    buildRingStatus("ring2", ringBlocksWithNames(merged, registrationById, "ring2"), ring2Url, columns),
  ]);

  res.json({ configured: true, ring1, ring2 });
});

module.exports = router;
