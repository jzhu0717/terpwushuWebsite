const express = require("express");
const { randomUUID } = require("crypto");
const { ScanCommand, GetCommand, PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("../lib/dynamo");
const { requireAdmin } = require("../lib/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  const { Items } = await doc.send(new ScanCommand({ TableName: TABLES.events }));
  let items = Items || [];
  if (req.query.active === "true") items = items.filter((i) => i.active);
  items.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  res.json(items);
});

router.post("/", requireAdmin, async (req, res) => {
  const { name, category, sort_order, active } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });

  const item = {
    id: randomUUID(),
    name,
    category: category || null,
    sort_order: sort_order ?? 0,
    active: active !== false,
    created_at: new Date().toISOString(),
  };
  await doc.send(new PutCommand({ TableName: TABLES.events, Item: item }));
  res.status(201).json(item);
});

router.put("/:id", requireAdmin, async (req, res) => {
  const { Item: existing } = await doc.send(new GetCommand({ TableName: TABLES.events, Key: { id: req.params.id } }));
  if (!existing) return res.status(404).json({ error: "Not found" });

  const { name, category, sort_order, active } = req.body || {};
  const item = {
    ...existing,
    name: name ?? existing.name,
    category: category ?? existing.category,
    sort_order: sort_order ?? existing.sort_order,
    active: active ?? existing.active,
  };
  await doc.send(new PutCommand({ TableName: TABLES.events, Item: item }));
  res.json(item);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await doc.send(new DeleteCommand({ TableName: TABLES.events, Key: { id: req.params.id } }));
  res.json({ success: true });
});

module.exports = router;
