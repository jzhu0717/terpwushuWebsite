const express = require("express");
const { randomUUID } = require("crypto");
const { ScanCommand, GetCommand, PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("../lib/dynamo");
const { requireAdmin } = require("../lib/auth");

const router = express.Router();

router.get("/", async (_req, res) => {
  const { Items } = await doc.send(new ScanCommand({ TableName: TABLES.announcements }));
  const items = (Items || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(items);
});

router.post("/", requireAdmin, async (req, res) => {
  const { title, author, content } = req.body || {};
  if (!title || !author || !content) {
    return res.status(400).json({ error: "title, author, and content are required" });
  }

  const item = { id: randomUUID(), title, author, content, created_at: new Date().toISOString() };
  await doc.send(new PutCommand({ TableName: TABLES.announcements, Item: item }));
  res.status(201).json(item);
});

router.put("/:id", requireAdmin, async (req, res) => {
  const { title, author, content } = req.body || {};
  if (!title || !author || !content) {
    return res.status(400).json({ error: "title, author, and content are required" });
  }

  const { Item: existing } = await doc.send(
    new GetCommand({ TableName: TABLES.announcements, Key: { id: req.params.id } })
  );
  if (!existing) return res.status(404).json({ error: "Not found" });

  const item = { ...existing, title, author, content };
  await doc.send(new PutCommand({ TableName: TABLES.announcements, Item: item }));
  res.json(item);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await doc.send(new DeleteCommand({ TableName: TABLES.announcements, Key: { id: req.params.id } }));
  res.json({ success: true });
});

module.exports = router;
