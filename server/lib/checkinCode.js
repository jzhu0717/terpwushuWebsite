const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("./dynamo");

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomCode() {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  }
  return code;
}


async function generateUniqueCheckinCode() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { Items } = await doc.send(
      new ScanCommand({
        TableName: TABLES.registrations,
        FilterExpression: "checkin_code = :code",
        ExpressionAttributeValues: { ":code": code },
      })
    );
    if (!Items || Items.length === 0) return code;
  }
  throw new Error("Could not generate a unique check-in code");
}

async function findRegistrationByCode(code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return null;
  const { Items } = await doc.send(
    new ScanCommand({
      TableName: TABLES.registrations,
      FilterExpression: "checkin_code = :code",
      ExpressionAttributeValues: { ":code": normalized },
    })
  );
  return Items?.[0] || null;
}

module.exports = { generateUniqueCheckinCode, findRegistrationByCode };
