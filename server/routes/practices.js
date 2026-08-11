const express = require("express");
const { randomUUID } = require("crypto");
const { ScanCommand, BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("../lib/dynamo");
const { requireAdmin } = require("../lib/auth");

const router = express.Router();

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

router.get("/", async (_req, res) => {
  const { Items } = await doc.send(new ScanCommand({ TableName: TABLES.practices }));
  res.json(Items || []);
});

router.put("/", requireAdmin, async (req, res) => {
  const rows = Array.isArray(req.body?.practices) ? req.body.practices : [];
  for (const row of rows) {
    if (!row.day || !row.time_range || !row.location) {
      return res.status(400).json({ error: "day, time_range, and location are required for every row" });
    }
  }

  const { Items: existing } = await doc.send(new ScanCommand({ TableName: TABLES.practices }));

  const deleteRequests = (existing || []).map((item) => ({ DeleteRequest: { Key: { id: item.id } } }));
  const newItems = rows.map((row) => ({
    id: randomUUID(),
    day: row.day,
    time_range: row.time_range,
    location: row.location,
    created_at: new Date().toISOString(),
  }));
  const putRequests = newItems.map((item) => ({ PutRequest: { Item: item } }));

  for (const batch of chunk([...deleteRequests, ...putRequests], 25)) {
    await doc.send(new BatchWriteCommand({ RequestItems: { [TABLES.practices]: batch } }));
  }

  res.json(newItems);
});

module.exports = router;
