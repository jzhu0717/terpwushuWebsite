const express = require("express");
const cookieParser = require("cookie-parser");

const { router: authRouter } = require("./routes/auth");
const announcementsRouter = require("./routes/announcements");
const officersRouter = require("./routes/officers");
const practicesRouter = require("./routes/practices");
const tournamentWebpageRouter = require("./routes/tournamentWebpage");
const tournamentArchivesRouter = require("./routes/tournamentArchives");
const eventsRouter = require("./routes/events");
const registrationsRouter = require("./routes/registrations");
const verifyRouter = require("./routes/verify");
const uploadsRouter = require("./routes/uploads");
const { router: eventOrderRouter } = require("./routes/eventOrder");
const liveScoringRouter = require("./routes/liveScoring");
const paypalRouter = require("./routes/paypal");
const dbAdminRouter = require("./routes/dbAdmin");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/announcements", announcementsRouter);
app.use("/api/officers", officersRouter);
app.use("/api/practices", practicesRouter);
app.use("/api/tournament-webpage", tournamentWebpageRouter);
app.use("/api/tournament-archives", tournamentArchivesRouter);
app.use("/api/events", eventsRouter);
app.use("/api/registrations", registrationsRouter);
app.use("/api/verify", verifyRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/event-order", eventOrderRouter);
app.use("/api/live-scoring", liveScoringRouter);
app.use("/api/paypal", paypalRouter);
app.use("/api/db-admin", dbAdminRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
