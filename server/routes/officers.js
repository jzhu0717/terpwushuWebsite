const express = require("express");
const { ScanCommand, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("../lib/dynamo");
const { requireAdmin } = require("../lib/auth");

const router = express.Router();

const officerKey = (year, position) => `${year}#${position}`;

router.get("/", async (_req, res) => {
  const { Items } = await doc.send(new ScanCommand({ TableName: TABLES.officers }));
  const items = (Items || []).sort((a, b) => a.sort_order - b.sort_order);
  res.json(items);
});

router.get("/:year/:position", requireAdmin, async (req, res) => {
  const { year, position } = req.params;
  const { Item } = await doc.send(
    new GetCommand({ TableName: TABLES.officers, Key: { id: officerKey(year, position) } })
  );
  res.json(Item || null);
});

router.put("/:year/:position", requireAdmin, async (req, res) => {
  const { year, position } = req.params;
  const { name, image_url, sort_order } = req.body || {};
  if (!name || !image_url || sort_order === undefined) {
    return res.status(400).json({ error: "name, image_url, and sort_order are required" });
  }

  const item = {
    id: officerKey(year, position),
    year,
    position,
    name,
    image_url,
    sort_order,
    created_at: new Date().toISOString(),
  };
  await doc.send(new PutCommand({ TableName: TABLES.officers, Item: item }));
  res.json(item);
});

module.exports = router;
