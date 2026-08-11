const express = require("express");
const { requireAdmin } = require("../lib/auth");
const { presignUpload } = require("../lib/s3");

const router = express.Router();

const safeExt = (extension) => String(extension || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";

router.post("/officers/presign", requireAdmin, async (req, res) => {
  const { year, position, contentType, extension } = req.body || {};
  if (!year || !position) return res.status(400).json({ error: "year and position are required" });

  const key = `${year}/${position}.${safeExt(extension)}`.replace(/\s+/g, "-");
  const result = await presignUpload(process.env.BUCKET_OFFICERS, key, contentType || "image/jpeg");
  res.json(result);
});

router.post("/archives/presign", requireAdmin, async (req, res) => {
  const { edition, contentType, extension } = req.body || {};
  if (!edition) return res.status(400).json({ error: "edition is required" });

  const key = `${edition}/scores.${safeExt(extension)}`.replace(/\s+/g, "-");
  const result = await presignUpload(process.env.BUCKET_ARCHIVES, key, contentType || "application/octet-stream");
  res.json(result);
});

module.exports = router;
