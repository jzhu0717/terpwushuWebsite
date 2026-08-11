const express = require("express");
const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("../lib/dynamo");
const { requireAdmin } = require("../lib/auth");

const router = express.Router();

const SETTINGS_KEY = { pk: "SETTINGS" };

router.get("/", async (_req, res) => {
  const { Item } = await doc.send(new GetCommand({ TableName: TABLES.tournamentWebpage, Key: SETTINGS_KEY }));
  res.json(Item || null);
});

router.put("/", requireAdmin, async (req, res) => {
  const item = { ...req.body, pk: "SETTINGS" };
  await doc.send(new PutCommand({ TableName: TABLES.tournamentWebpage, Item: item }));
  res.json(item);
});

module.exports = router;
