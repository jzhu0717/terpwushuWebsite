const express = require("express");
const { ScanCommand, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("../lib/dynamo");
const { requireAdmin } = require("../lib/auth");

const router = express.Router();

router.get("/", async (_req, res) => {
  const { Items } = await doc.send(new ScanCommand({ TableName: TABLES.tournamentArchives }));
  const items = (Items || []).sort((a, b) => b.event_number - a.event_number);
  res.json(items);
});

// Used by the admin form to suggest the next event_number.
router.get("/latest-event-number", requireAdmin, async (_req, res) => {
  const { Items } = await doc.send(new ScanCommand({ TableName: TABLES.tournamentArchives }));
  const max = (Items || []).reduce((m, i) => Math.max(m, i.event_number || 0), 0);
  res.json({ latest: max });
});

router.get("/:edition", requireAdmin, async (req, res) => {
  const { Item } = await doc.send(
    new GetCommand({ TableName: TABLES.tournamentArchives, Key: { edition: req.params.edition } })
  );
  res.json(Item || null);
});

router.put("/:edition", requireAdmin, async (req, res) => {
  const { event_date, event_number, scores_url, videos_url, photos_urls, notes } = req.body || {};
  if (!event_date || !event_number) {
    return res.status(400).json({ error: "event_date and event_number are required" });
  }

  const { Item: existing } = await doc.send(
    new GetCommand({ TableName: TABLES.tournamentArchives, Key: { edition: req.params.edition } })
  );

  const item = {
    edition: req.params.edition,
    event_date,
    event_number,
    scores_url: scores_url || null,
    videos_url: videos_url || null,
    photos_urls: photos_urls || [],
    notes: notes || null,
    created_at: existing?.created_at || new Date().toISOString(),
  };
  await doc.send(new PutCommand({ TableName: TABLES.tournamentArchives, Item: item }));
  res.json(item);
});

module.exports = router;
