const express = require("express");
const { GetCommand, PutCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("../lib/dynamo");
const { sendEmailJs } = require("../lib/emailjs");

const router = express.Router();

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

router.post("/send-code", async (req, res) => {
  try {
    const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.endsWith(".edu")) {
      return res.status(400).json({ error: "A valid .edu email address is required" });
    }

    const { Item: existing } = await doc.send(
      new GetCommand({ TableName: TABLES.emailVerifications, Key: { email: normalizedEmail } })
    );
    if (existing && Date.now() - new Date(existing.created_at).getTime() < RESEND_COOLDOWN_MS) {
      return res.status(429).json({ error: "Please wait a moment before requesting another code." });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const now = Date.now();
    const expiresAt = new Date(now + CODE_TTL_MS).toISOString();

    await doc.send(
      new PutCommand({
        TableName: TABLES.emailVerifications,
        Item: {
          email: normalizedEmail,
          code,
          expires_at: expiresAt,
          verified: false,
          attempts: 0,
          created_at: new Date(now).toISOString(),
          ttl: Math.floor(now / 1000) + 24 * 60 * 60,
        },
      })
    );

    await sendEmailJs(process.env.EMAILJS_VERIFICATION_TEMPLATE_ID, { to_email: normalizedEmail, code });
    res.json({ success: true });
  } catch (err) {
    console.error("send-code error:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
});

router.post("/check-code", async (req, res) => {
  try {
    const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
    const submittedCode = String(req.body?.code || "").trim();
    if (!normalizedEmail || !submittedCode) {
      return res.status(400).json({ error: "email and code are required" });
    }

    const { Item: row } = await doc.send(
      new GetCommand({ TableName: TABLES.emailVerifications, Key: { email: normalizedEmail } })
    );

    if (!row) {
      return res.status(400).json({ verified: false, error: "No verification code found for this email. Please request a new one." });
    }
    if (row.verified) {
      return res.json({ verified: true });
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ verified: false, error: "This code has expired. Please request a new one." });
    }
    if (row.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ verified: false, error: "Too many attempts. Please request a new code." });
    }

    if (row.code !== submittedCode) {
      await doc.send(
        new UpdateCommand({
          TableName: TABLES.emailVerifications,
          Key: { email: normalizedEmail },
          UpdateExpression: "SET attempts = attempts + :one",
          ExpressionAttributeValues: { ":one": 1 },
        })
      );
      return res.status(400).json({ verified: false, error: "Incorrect code. Please try again." });
    }

    await doc.send(
      new UpdateCommand({
        TableName: TABLES.emailVerifications,
        Key: { email: normalizedEmail },
        UpdateExpression: "SET verified = :true",
        ExpressionAttributeValues: { ":true": true },
      })
    );

    res.json({ verified: true });
  } catch (err) {
    console.error("check-code error:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
});

module.exports = router;
