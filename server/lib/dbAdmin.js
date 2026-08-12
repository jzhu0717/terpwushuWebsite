const { ScanCommand, BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("./dynamo");

// The set of tables that reset between tournaments — shared by the export, import, and
// delete-tables routes so all three always agree on the exact same scope. Deliberately does
// NOT include anything else (Officers, Announcements, Practices, Admin logins, the Events
// *catalog*, Tournament Archives, Tournament Info settings) — those persist across years and
// are never touched by this page.
const TOURNAMENT_TABLES = {
  registrations: { tableName: () => TABLES.registrations, keyAttrs: ["id"] },
  registration_events: { tableName: () => TABLES.registrationEvents, keyAttrs: ["registration_id", "event_id"] },
  event_order: { tableName: () => TABLES.eventOrder, keyAttrs: ["pk"] },
};

// DynamoDB has no "truncate table" operation — Scan the whole table, then delete every item
// found, in batches of 25 (BatchWriteCommand's per-request limit).
async function scanAndDeleteAll(tableName, keyAttrs) {
  const { Items } = await doc.send(new ScanCommand({ TableName: tableName }));
  const items = Items || [];
  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25);
    const deleteRequests = batch.map((item) => ({
      DeleteRequest: { Key: Object.fromEntries(keyAttrs.map((k) => [k, item[k]])) },
    }));
    await doc.send(new BatchWriteCommand({ RequestItems: { [tableName]: deleteRequests } }));
  }
  return items.length;
}

// Re-inserts every item from a snapshot array, in batches of 25.
async function batchPutAll(tableName, items) {
  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25);
    const putRequests = batch.map((item) => ({ PutRequest: { Item: item } }));
    await doc.send(new BatchWriteCommand({ RequestItems: { [tableName]: putRequests } }));
  }
  return items.length;
}

module.exports = { TOURNAMENT_TABLES, scanAndDeleteAll, batchPutAll };
