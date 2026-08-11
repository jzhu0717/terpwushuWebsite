const express = require("express");
const bcrypt = require("bcryptjs");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("../lib/dynamo");
const { signSession, setSessionCookie, clearSessionCookie, readSession, requireAdmin } = require("../lib/auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const { Item: user } = await doc.send(
    new GetCommand({ TableName: TABLES.adminUsers, Key: { username } })
  );

  const valid = user && (await bcrypt.compare(password, user.password_hash));
  if (!valid) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  setSessionCookie(res, signSession(username));
  res.json({ success: true });
});

router.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ success: true });
});

router.get("/session", (req, res) => {
  const session = readSession(req);
  res.json({ loggedIn: !!session, username: session?.username || null });
});

module.exports = { router, requireAdmin };
