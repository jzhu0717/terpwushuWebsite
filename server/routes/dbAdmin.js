const express = require("express");
const archiver = require("archiver");
const { requireAdmin } = require("../lib/auth");
const { uploadObject, presignDownload, listObjects, getObject, deleteObjects } = require("../lib/s3");
const { TOURNAMENT_TABLES, scanAndDeleteAll, batchPutAll } = require("../lib/dbAdmin");
const { doc, TABLES } = require("../lib/dynamo");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");

const router = express.Router();
router.use(requireAdmin); 

const SNAPSHOT_PREFIX = "db-snapshots/";
const WAIVER_ZIP_PREFIX = "waiver-exports/";

function sanitizeFileName(name) {
  const base = String(name || "").trim().replace(/[^a-zA-Z0-9-_ ]/g, "").slice(0, 100);
  return base || `uwg_export_${new Date().toISOString().replace(/[:.]/g, "-")}`;
}

router.post("/export", async (req, res) => {
  try {
    const fileName = `${sanitizeFileName(req.body?.fileName)}.json`;
    const key = SNAPSHOT_PREFIX + fileName;

    const tables = {};
    for (const [name, { tableName }] of Object.entries(TOURNAMENT_TABLES)) {
      const { Items } = await doc.send(new ScanCommand({ TableName: tableName() }));
      tables[name] = Items || [];
    }

    const snapshot = { exported_at: new Date().toISOString(), tables };
    await uploadObject(process.env.BUCKET_BACKUPS, key, Buffer.from(JSON.stringify(snapshot, null, 2)), "application/json");

    res.json({ success: true, fileName, key });
  } catch (err) {
    console.error("db-admin export failed:", err);
    res.status(500).json({ error: "Export failed. See server logs for details." });
  }
});

// Lists previously exported snapshots, for the Import Database dropdown.
router.get("/backups", async (_req, res) => {
  try {
    const objects = await listObjects(process.env.BUCKET_BACKUPS, SNAPSHOT_PREFIX);
    const backups = objects
      .map((o) => ({
        key: o.Key,
        fileName: o.Key.slice(SNAPSHOT_PREFIX.length),
        lastModified: o.LastModified,
        size: o.Size,
      }))
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    res.json(backups);
  } catch (err) {
    console.error("db-admin list backups failed:", err);
    res.status(500).json({ error: "Could not list backups." });
  }
});

router.get("/backups/:key/download", async (req, res) => {
  try {
    const key = SNAPSHOT_PREFIX + req.params.key;
    const url = await presignDownload(process.env.BUCKET_BACKUPS, key, req.params.key);
    res.json({ url });
  } catch (err) {
    console.error("db-admin backup download failed:", err);
    res.status(500).json({ error: "Could not generate a download link." });
  }
});

router.post("/import", async (req, res) => {
  try {
    const fileName = req.body?.fileName;
    if (!fileName) return res.status(400).json({ error: "fileName is required" });

    const key = SNAPSHOT_PREFIX + fileName;
    const raw = await getObject(process.env.BUCKET_BACKUPS, key);
    const snapshot = JSON.parse(raw.toString("utf-8"));
    if (!snapshot?.tables) return res.status(400).json({ error: "That backup file doesn't look like a valid snapshot." });

    const results = {};
    for (const [name, { tableName, keyAttrs }] of Object.entries(TOURNAMENT_TABLES)) {
      const deleted = await scanAndDeleteAll(tableName(), keyAttrs);
      const restored = await batchPutAll(tableName(), snapshot.tables[name] || []);
      results[name] = { deleted, restored };
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error("db-admin import failed:", err);
    res.status(500).json({ error: "Import failed partway through. See server logs — some tables may be in a mixed state." });
  }
});

router.post("/export-waivers", async (req, res) => {
  try {
    const objects = await listObjects(process.env.BUCKET_WAIVERS, "");
    if (objects.length === 0) {
      return res.status(400).json({ error: "There are no waiver files to export." });
    }

    const archive = archiver("zip");
    const chunks = [];
    archive.on("data", (chunk) => chunks.push(chunk));
    const archiveDone = new Promise((resolve, reject) => {
      archive.on("end", resolve);
      archive.on("error", reject);
    });

    for (const obj of objects) {
      const fileBuffer = await getObject(process.env.BUCKET_WAIVERS, obj.Key);
      archive.append(fileBuffer, { name: obj.Key });
    }
    archive.finalize();
    await archiveDone;

    const zipKey = `${WAIVER_ZIP_PREFIX}waivers_${new Date().toISOString().replace(/[:.]/g, "-")}.zip`;
    await uploadObject(process.env.BUCKET_BACKUPS, zipKey, Buffer.concat(chunks), "application/zip");
    const url = await presignDownload(process.env.BUCKET_BACKUPS, zipKey, "waivers.zip");

    res.json({ success: true, url, fileCount: objects.length });
  } catch (err) {
    console.error("db-admin export-waivers failed:", err);
    res.status(500).json({ error: "Could not export waivers. See server logs for details." });
  }
});

router.post("/delete-tables", async (req, res) => {
  try {
    const selected = Array.isArray(req.body?.tables) ? req.body.tables : [];
    const results = {};

    if (selected.includes("athletes_events")) {
      results.registrations = await scanAndDeleteAll(
        TOURNAMENT_TABLES.registrations.tableName(),
        TOURNAMENT_TABLES.registrations.keyAttrs
      );
      results.registration_events = await scanAndDeleteAll(
        TOURNAMENT_TABLES.registration_events.tableName(),
        TOURNAMENT_TABLES.registration_events.keyAttrs
      );
    }
    if (selected.includes("event_order")) {
      results.event_order = await scanAndDeleteAll(
        TOURNAMENT_TABLES.event_order.tableName(),
        TOURNAMENT_TABLES.event_order.keyAttrs
      );
    }
    if (selected.includes("waivers")) {
      const objects = await listObjects(process.env.BUCKET_WAIVERS, "");
      if (objects.length > 0) {
        await deleteObjects(process.env.BUCKET_WAIVERS, objects.map((o) => o.Key));
      }
      results.waivers = objects.length;
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error("db-admin delete-tables failed:", err);
    res.status(500).json({ error: "Deletion failed partway through. See server logs — some tables may be in a mixed state." });
  }
});

module.exports = router;
