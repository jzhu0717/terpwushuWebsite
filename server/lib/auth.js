const jwt = require("jsonwebtoken");

const COOKIE_NAME = "tw_session";
const TOKEN_TTL = "12h";

function signSession(username) {
  return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE !== "false",
    sameSite: "lax",
    maxAge: 12 * 60 * 60 * 1000,
    path: "/",
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

function readSession(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function requireAdmin(req, res, next) {
  const session = readSession(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  req.admin = session;
  next();
}

module.exports = { COOKIE_NAME, signSession, setSessionCookie, clearSessionCookie, readSession, requireAdmin };
