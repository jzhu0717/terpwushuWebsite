const { ScanCommand, BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("./dynamo");

const TOURNAMENT_TABLES = {
  registrations: { tableName: () => TABLES.registrations, keyAttrs: ["id"] },
  registration_events: { tableName: () => TABLES.registrationEvents, keyAttrs: ["registration_id", "event_id"] },
  event_order: { tableName: () => TABLES.eventOrder, keyAttrs: ["pk"] },
};


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

async function batchPutAll(tableName, items) {
  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25);
    const putRequests = batch.map((item) => ({ PutRequest: { Item: item } }));
    await doc.send(new BatchWriteCommand({ RequestItems: { [tableName]: putRequests } }));
  }
  return items.length;
}

module.exports = { TOURNAMENT_TABLES, scanAndDeleteAll, batchPutAll };
