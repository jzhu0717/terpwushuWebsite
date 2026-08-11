const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const doc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLES = {
  announcements: process.env.TABLE_ANNOUNCEMENTS || "announcements",
  officers: process.env.TABLE_OFFICERS || "officers",
  practices: process.env.TABLE_PRACTICES || "practices",
  tournamentArchives: process.env.TABLE_TOURNAMENT_ARCHIVES || "tournament_archives",
  tournamentWebpage: process.env.TABLE_TOURNAMENT_WEBPAGE || "tournament_webpage",
  events: process.env.TABLE_EVENTS || "events",
  registrations: process.env.TABLE_REGISTRATIONS || "registrations",
  registrationEvents: process.env.TABLE_REGISTRATION_EVENTS || "registration_events",
  emailVerifications: process.env.TABLE_EMAIL_VERIFICATIONS || "email_verifications",
  adminUsers: process.env.TABLE_ADMIN_USERS || "admin_users",
  eventOrder: process.env.TABLE_EVENT_ORDER || "event_order",
};

module.exports = { doc, TABLES };
