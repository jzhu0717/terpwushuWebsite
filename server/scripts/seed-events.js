// One-time setup: seeds the club's real event catalog into the events table.
// Usage: node scripts/seed-events.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { randomUUID } = require("crypto");
const { ScanCommand, PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("../lib/dynamo");

// Grouped the same way Contemporary events are, so each Group A/B/C Compulsory section
// can be sub-divided into Barehand / Short Weapon / Long Weapon under one category heading.
const COMPULSORY_EVENTS = [
  { name: "ChangQuan (Longfist)", subcategory: "Barehand" },
  { name: "NanQuan (Southern Fist)", subcategory: "Barehand" },
  { name: "JianShu (Straightsword)", subcategory: "Short Weapon" },
  { name: "DaoShu (Broadsword)", subcategory: "Short Weapon" },
  { name: "NanDao (Southern Broadsword)", subcategory: "Short Weapon" },
  { name: "GunShu (Staff)", subcategory: "Long Weapon" },
  { name: "QiangShu (Spear)", subcategory: "Long Weapon" },
  { name: "NanGun (Southern Staff)", subcategory: "Long Weapon" },
];

function compulsoryBlock(category, startOrder) {
  return COMPULSORY_EVENTS.map((ev, i) => ({
    name: ev.name,
    category,
    subcategory: ev.subcategory,
    sort_order: startOrder + i,
  }));
}

const EVENTS = [
  ...compulsoryBlock("Group A Compulsory", 10),
  ...compulsoryBlock("Group B Compulsory", 20),
  ...compulsoryBlock("Group C Compulsory", 30),

  { name: "ChangQuan (Longfist)", category: "Contemporary Barehand", sort_order: 40 },
  { name: "NanQuan (Southern Fist)", category: "Contemporary Barehand", sort_order: 41 },

  { name: "JianShu (Straightsword)", category: "Contemporary Short Weapon", sort_order: 50 },
  { name: "DaoShu (Broadsword)", category: "Contemporary Short Weapon", sort_order: 51 },
  { name: "NanDao (Southern Broadsword)", category: "Contemporary Short Weapon", sort_order: 52 },

  { name: "GunShu (Staff)", category: "Contemporary Long Weapon", sort_order: 60 },
  { name: "QiangShu (Spear)", category: "Contemporary Long Weapon", sort_order: 61 },
  { name: "NanGun (Southern Staff)", category: "Contemporary Long Weapon", sort_order: 62 },

  { name: "Trad/Other Barehand", category: "Traditional & Other Styles", sort_order: 70 },
  { name: "Trad/Other Weapon", category: "Traditional & Other Styles", sort_order: 71 },

  { name: "Taiji Barehand", category: "Contemporary Internal Styles", sort_order: 80 },
  { name: "Taiji 24-Form", category: "Contemporary Internal Styles", sort_order: 81 },
  { name: "Taiji Weapon", category: "Contemporary Internal Styles", sort_order: 82 },

  { name: "ChangQuan w/ Nandu", category: "Nandu Events", sort_order: 90 },
  { name: "NanQuan w/ Nandu", category: "Nandu Events", sort_order: 91 },
  { name: "Taiji Barehand w/ Nandu", category: "Nandu Events", sort_order: 92 },
];

async function main() {
  const { Items: existing } = await doc.send(new ScanCommand({ TableName: TABLES.events }));
  for (const ev of existing || []) {
    await doc.send(new DeleteCommand({ TableName: TABLES.events, Key: { id: ev.id } }));
  }
  if (existing?.length) console.log(`Cleared ${existing.length} existing event row(s).`);

  for (const ev of EVENTS) {
    const item = {
      id: randomUUID(),
      name: ev.name,
      category: ev.category,
      subcategory: ev.subcategory || null,
      sort_order: ev.sort_order,
      active: true,
      created_at: new Date().toISOString(),
    };
    await doc.send(new PutCommand({ TableName: TABLES.events, Item: item }));
  }
  console.log(`Seeded ${EVENTS.length} events into ${TABLES.events}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
