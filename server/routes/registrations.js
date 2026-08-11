const express = require("express");
const { randomUUID } = require("crypto");
const {
  ScanCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  BatchWriteCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("../lib/dynamo");
const { requireAdmin } = require("../lib/auth");
const { uploadObject, presignDownload } = require("../lib/s3");
const { generateWaiverPdf } = require("../lib/waiverPdf");
const { formatEntryLine } = require("../lib/heatSheet");

const router = express.Router();

const GENDERS = ["M", "F"];
const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const COLLEGIATE_STATUSES = ["Collegiate", "Non-Collegiate"];
const FREE_REGISTRATION_INSTITUTION = "University of Maryland College Park";

router.get("/", requireAdmin, async (_req, res) => {
  const [{ Items: registrations }, { Items: links }, { Items: events }] = await Promise.all([
    doc.send(new ScanCommand({ TableName: TABLES.registrations })),
    doc.send(new ScanCommand({ TableName: TABLES.registrationEvents })),
    doc.send(new ScanCommand({ TableName: TABLES.events })),
  ]);
  const eventById = Object.fromEntries((events || []).map((e) => [e.id, e]));

  const withEvents = (registrations || []).map((r) => ({
    ...r,
    events: (links || [])
      .filter((l) => l.registration_id === r.id)
      .map((l) => eventById[l.event_id])
      .filter(Boolean)
      .map((e) => ({ id: e.id, name: e.name, category: e.category })),
  }));

  res.json(withEvents);
});

router.get("/export", requireAdmin, async (_req, res) => {
  const { Items: registrations } = await doc.send(new ScanCommand({ TableName: TABLES.registrations }));
  const { Items: links } = await doc.send(new ScanCommand({ TableName: TABLES.registrationEvents }));
  const { Items: events } = await doc.send(new ScanCommand({ TableName: TABLES.events }));
  const eventById = Object.fromEntries((events || []).map((e) => [e.id, e]));
  const registrationById = Object.fromEntries((registrations || []).map((r) => [r.id, r]));

  const columns = [
    "entry", "first_name", "last_name", "email", "gender", "experience_level",
    "collegiate_status", "age_group", "institution", "event_name", "event_category",
    "amount_due", "payment_status", "checked_in", "waiver_received", "grand_champion",
  ];

  const rows = (links || [])
    .map((l) => {
      const registration = registrationById[l.registration_id];
      const event = eventById[l.event_id];
      if (!registration || !event) return null;
      return {
        entry: formatEntryLine(registration, event),
        first_name: registration.first_name,
        last_name: registration.last_name,
        email: registration.email,
        gender: registration.gender,
        experience_level: registration.experience_level,
        collegiate_status: registration.collegiate_status,
        age_group: registration.age_group,
        institution: registration.institution,
        event_name: event.name,
        event_category: event.category,
        amount_due: registration.amount_due,
        payment_status: registration.payment_status,
        checked_in: registration.checked_in,
        waiver_received: registration.waiver_received ?? false,
        grand_champion: registration.grand_champion ?? false,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.entry.localeCompare(b.entry));

  const csvLines = rows.map((row) =>
    columns.map((c) => `"${String(row[c] ?? "").replace(/"/g, '""')}"`).join(",")
  );

  const csv = [columns.join(","), ...csvLines].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=registrations.csv");
  res.send(csv);
});

router.post("/", async (req, res) => {
  const {
    first_name, last_name, email, gender, experience_level,
    collegiate_status, age_group, institution, amount_due,
    event_ids, waiver_accepted, parental_consent_required, grand_champion,
  } = req.body || {};

  if (!first_name || !last_name || !email || !age_group || !institution || amount_due === undefined) {
    return res.status(400).json({ error: "Missing required registration fields" });
  }
  if (!GENDERS.includes(gender)) return res.status(400).json({ error: "Invalid gender" });
  if (!EXPERIENCE_LEVELS.includes(experience_level)) return res.status(400).json({ error: "Invalid experience_level" });
  if (!COLLEGIATE_STATUSES.includes(collegiate_status)) return res.status(400).json({ error: "Invalid collegiate_status" });
  if (!Array.isArray(event_ids) || event_ids.length === 0) {
    return res.status(400).json({ error: "Please select at least one event" });
  }
  if (waiver_accepted !== true) {
    return res.status(400).json({ error: "The waiver must be accepted to register" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedFirst = first_name.trim().toLowerCase();
  const normalizedLast = last_name.trim().toLowerCase();

  const { Items: existingRegistrations } = await doc.send(new ScanCommand({ TableName: TABLES.registrations }));
  const isDuplicate = (existingRegistrations || []).some(
    (r) =>
      String(r.email || "").trim().toLowerCase() === normalizedEmail &&
      String(r.first_name || "").trim().toLowerCase() === normalizedFirst &&
      String(r.last_name || "").trim().toLowerCase() === normalizedLast
  );
  if (isDuplicate) {
    return res.status(409).json({
      duplicate: true,
      error: "Our records indicate that you have registered already.",
    });
  }

  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const isFree = collegiate_status === "Collegiate" && institution === FREE_REGISTRATION_INSTITUTION;
  const finalAmountDue = isFree ? 0 : Number(amount_due);

  const { Item: settings } = await doc.send(
    new GetCommand({ TableName: TABLES.tournamentWebpage, Key: { pk: "SETTINGS" } })
  );

  const waiverPdf = await generateWaiverPdf({
    firstName: first_name,
    lastName: last_name,
    eventNumber: settings?.event_number,
    uwgDay: settings?.uwg_day,
    isMinor: !!parental_consent_required,
    acceptedAt: createdAt,
  });
  const waiverKey = `${id}.pdf`;
  await uploadObject(process.env.BUCKET_WAIVERS, waiverKey, waiverPdf, "application/pdf");

  const item = {
    id,
    created_at: createdAt,
    first_name,
    last_name,
    email,
    gender,
    experience_level,
    collegiate_status,
    age_group,
    institution,
    amount_due: finalAmountDue,
    payment_status: isFree ? "paid" : "pending",
    checked_in: false,
    waiver_received: false,
    waiver_accepted: true,
    parental_consent_required: !!parental_consent_required,
    waiver_pdf_key: waiverKey,
    grand_champion: !!grand_champion,
  };

  await doc.send(new PutCommand({ TableName: TABLES.registrations, Item: item }));

  const putRequests = event_ids.map((event_id) => ({
    PutRequest: { Item: { registration_id: id, event_id } },
  }));
  await doc.send(new BatchWriteCommand({ RequestItems: { [TABLES.registrationEvents]: putRequests } }));

  res.status(201).json(item);
});

// manual add
router.post("/manual", requireAdmin, async (req, res) => {
  const {
    first_name, last_name, email, gender, experience_level,
    collegiate_status, age_group, institution, event_ids,
  } = req.body || {};

  if (!first_name || !last_name) {
    return res.status(400).json({ error: "First and last name are required" });
  }
  if (gender && !GENDERS.includes(gender)) return res.status(400).json({ error: "Invalid gender" });
  if (experience_level && !EXPERIENCE_LEVELS.includes(experience_level)) {
    return res.status(400).json({ error: "Invalid experience_level" });
  }
  if (collegiate_status && !COLLEGIATE_STATUSES.includes(collegiate_status)) {
    return res.status(400).json({ error: "Invalid collegiate_status" });
  }

  const id = randomUUID();
  const item = {
    id,
    created_at: new Date().toISOString(),
    first_name,
    last_name,
    email: email || "",
    gender: gender || "",
    experience_level: experience_level || "",
    collegiate_status: collegiate_status || "",
    age_group: age_group || "",
    institution: institution || "",
    amount_due: 0,
    payment_status: "paid",
    checked_in: false,
    waiver_received: false,
    waiver_accepted: false,
    parental_consent_required: false,
    waiver_pdf_key: null,
    grand_champion: false,
  };

  await doc.send(new PutCommand({ TableName: TABLES.registrations, Item: item }));

  const eventIds = Array.isArray(event_ids) ? event_ids.filter(Boolean) : [];
  if (eventIds.length > 0) {
    const putRequests = eventIds.map((event_id) => ({
      PutRequest: { Item: { registration_id: id, event_id } },
    }));
    await doc.send(new BatchWriteCommand({ RequestItems: { [TABLES.registrationEvents]: putRequests } }));
  }

  res.status(201).json({ ...item, events: [] });
});

router.get("/:id/waiver", requireAdmin, async (req, res) => {
  const { Item: registration } = await doc.send(
    new GetCommand({ TableName: TABLES.registrations, Key: { id: req.params.id } })
  );
  if (!registration?.waiver_pdf_key) {
    return res.status(404).json({ error: "No waiver on file for this registration" });
  }

  const url = await presignDownload(
    process.env.BUCKET_WAIVERS,
    registration.waiver_pdf_key,
    `waiver-${registration.last_name}-${registration.first_name}.pdf`
  );
  res.json({ url });
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const updates = {};
  if (typeof req.body?.checked_in === "boolean") updates.checked_in = req.body.checked_in;
  if (typeof req.body?.waiver_received === "boolean") updates.waiver_received = req.body.waiver_received;
  if (typeof req.body?.grand_champion === "boolean") updates.grand_champion = req.body.grand_champion;
  if (req.body?.gender !== undefined) {
    if (!GENDERS.includes(req.body.gender)) return res.status(400).json({ error: "Invalid gender" });
    updates.gender = req.body.gender;
  }
  if (req.body?.experience_level !== undefined) {
    if (!EXPERIENCE_LEVELS.includes(req.body.experience_level)) return res.status(400).json({ error: "Invalid experience_level" });
    updates.experience_level = req.body.experience_level;
  }
  if (req.body?.collegiate_status !== undefined) {
    if (!COLLEGIATE_STATUSES.includes(req.body.collegiate_status)) return res.status(400).json({ error: "Invalid collegiate_status" });
    updates.collegiate_status = req.body.collegiate_status;
  }
  if (typeof req.body?.age_group === "string" && req.body.age_group) updates.age_group = req.body.age_group;
  if (typeof req.body?.institution === "string" && req.body.institution) updates.institution = req.body.institution;

  const keys = Object.keys(updates);
  if (keys.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  await doc.send(
    new UpdateCommand({
      TableName: TABLES.registrations,
      Key: { id: req.params.id },
      UpdateExpression: "SET " + keys.map((k, i) => `#k${i} = :v${i}`).join(", "),
      ExpressionAttributeNames: Object.fromEntries(keys.map((k, i) => [`#k${i}`, k])),
      ExpressionAttributeValues: Object.fromEntries(keys.map((k, i) => [`:v${i}`, updates[k]])),
    })
  );

  res.json({ success: true });
});

router.put("/:id/events", requireAdmin, async (req, res) => {
  const eventIds = Array.isArray(req.body?.event_ids) ? req.body.event_ids : [];
  if (eventIds.length === 0) {
    return res.status(400).json({ error: "event_ids must be a non-empty array" });
  }

  const { Items: existingLinks } = await doc.send(
    new QueryCommand({
      TableName: TABLES.registrationEvents,
      KeyConditionExpression: "registration_id = :rid",
      ExpressionAttributeValues: { ":rid": req.params.id },
    })
  );
  if (existingLinks?.length) {
    const deleteRequests = existingLinks.map((l) => ({
      DeleteRequest: { Key: { registration_id: l.registration_id, event_id: l.event_id } },
    }));
    await doc.send(new BatchWriteCommand({ RequestItems: { [TABLES.registrationEvents]: deleteRequests } }));
  }

  const putRequests = eventIds.map((event_id) => ({
    PutRequest: { Item: { registration_id: req.params.id, event_id } },
  }));
  await doc.send(new BatchWriteCommand({ RequestItems: { [TABLES.registrationEvents]: putRequests } }));

  res.json({ success: true });
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const { Items: links } = await doc.send(
    new QueryCommand({
      TableName: TABLES.registrationEvents,
      KeyConditionExpression: "registration_id = :rid",
      ExpressionAttributeValues: { ":rid": req.params.id },
    })
  );

  if (links && links.length > 0) {
    const deleteRequests = links.map((l) => ({
      DeleteRequest: { Key: { registration_id: l.registration_id, event_id: l.event_id } },
    }));
    await doc.send(new BatchWriteCommand({ RequestItems: { [TABLES.registrationEvents]: deleteRequests } }));
  }

  await doc.send(new DeleteCommand({ TableName: TABLES.registrations, Key: { id: req.params.id } }));
  res.json({ success: true });
});

module.exports = router;
