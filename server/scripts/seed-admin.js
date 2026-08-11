// One-time setup: creates (or resets) the single admin login.
// Usage: node scripts/seed-admin.js <username> <password>
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const bcrypt = require("bcryptjs");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("../lib/dynamo");

async function main() {
  const [username, password] = process.argv.slice(2);
  if (!username || !password) {
    console.error("Usage: node scripts/seed-admin.js <username> <password>");
    process.exit(1);
  }

  const password_hash = await bcrypt.hash(password, 10);
  await doc.send(new PutCommand({ TableName: TABLES.adminUsers, Item: { username, password_hash } }));
  console.log(`Admin user "${username}" created/updated in ${TABLES.adminUsers}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
