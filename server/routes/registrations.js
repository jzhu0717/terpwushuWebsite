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
const { computeAmountDue, FREE_REGISTRATION_INSTITUTION } = require("../lib/pricing");
const { generateUniqueCheckinCode, findRegistrationByCode } = require("../lib/checkinCode");
const { sendEmailJs } = require("../lib/emailjs");

const router = express.Router();

const GENDERS = ["M", "F"];
const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const COLLEGIATE_STATUSES = ["Collegiate", "Non-Collegiate"];
const PAYMENT_METHODS = ["Credit/Debit Card", "Check", "Cash", "PayPal", "Zelle", "Venmo"];
// Kept in sync with src/constants/registrationOptions.js's GRAND_CHAMPION_MIN_EVENTS.
const GRAND_CHAMPION_MIN_EVENTS = 4;
// Kept in sync with src/constants/registrationOptions.js's MINOR_AGE_GROUPS.
const MINOR_AGE_GROUPS = new Set([
  "Child (Up to 6 Years Old)",
  "Youth (Up to 8 Years Old)",
  "Group C (Up to 11 Years Old)",
  "Group B (Up to 14 Years Old)",
  "Group A (Up to 17 Years Old)",
]);

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

// One row per registrant (not per event — a competitor signed up for 3 events used to produce
// 3 duplicate rows here). All of a registrant's events are joined into a single column instead.
router.get("/export", requireAdmin, async (_req, res) => {
  const { Items: registrations } = await doc.send(new ScanCommand({ TableName: TABLES.registrations }));
  const { Items: links } = await doc.send(new ScanCommand({ TableName: TABLES.registrationEvents }));
  const { Items: events } = await doc.send(new ScanCommand({ TableName: TABLES.events }));
  const eventById = Object.fromEntries((events || []).map((e) => [e.id, e]));

  const columns = [
    "first_name", "last_name", "email", "gender", "experience_level",
    "collegiate_status", "age_group", "institution", "events",
    "amount_due", "payment_status", "checked_in", "waiver_received", "grand_champion",
  ];

  const rows = (registrations || [])
    .map((registration) => {
      const eventNames = (links || [])
        .filter((l) => l.registration_id === registration.id)
        .map((l) => eventById[l.event_id]?.name)
        .filter(Boolean)
        .join(", ");
      return {
        first_name: registration.first_name,
        last_name: registration.last_name,
        email: registration.email,
        gender: registration.gender,
        experience_level: registration.experience_level,
        collegiate_status: registration.collegiate_status,
        age_group: registration.age_group,
        institution: registration.institution,
        events: eventNames,
        amount_due: registration.amount_due,
        payment_status: registration.payment_status,
        checked_in: registration.checked_in,
        waiver_received: registration.waiver_received ?? false,
        grand_champion: registration.grand_champion ?? false,
      };
    })
    .sort((a, b) => `${a.last_name}${a.first_name}`.localeCompare(`${b.last_name}${b.first_name}`));

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
    event_ids, waiver_accepted, parental_consent_required, parent_guardian_name, grand_champion,
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
  if (parental_consent_required && !String(parent_guardian_name || "").trim()) {
    return res.status(400).json({ error: "Parent/Guardian name is required for minors" });
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
  const checkinCode = await generateUniqueCheckinCode();

  const { Item: settings } = await doc.send(
    new GetCommand({ TableName: TABLES.tournamentWebpage, Key: { pk: "SETTINGS" } })
  );

  // Priced server-side (never trusting the client's amount_due) so it's always correct and so
  // the breakdown can be persisted and shown back on the Pay page later — the "early bird"
  // determination in particular has to be locked in now, since it'd give a different (wrong)
  // answer if recomputed against "now" on a later visit, well past the early deadline.
  const breakdown = computeAmountDue({
    collegiateStatus: collegiate_status,
    institution,
    eventCount: event_ids.length,
    settings,
  });
  const grandChampionEligible = event_ids.length >= GRAND_CHAMPION_MIN_EVENTS && experience_level === "Advanced";
  const grandChampionApplies = !!grand_champion && grandChampionEligible && !!settings?.grand_champion_enabled && !isFree;
  const grandChampionCost = grandChampionApplies ? Number(settings?.grand_champion_price || 0) : 0;
  const finalAmountDue = isFree ? 0 : breakdown.total + grandChampionCost;
  const priceBreakdown = {
    first_event_price: breakdown.firstEventPrice,
    additional_events_cost: breakdown.additionalEventsCost,
    additional_events_count: breakdown.additionalEventsCount,
    is_early_bird: breakdown.isEarlyBird,
    grand_champion_cost: grandChampionCost,
    total: finalAmountDue,
  };

  const waiverPdf = await generateWaiverPdf({
    firstName: first_name,
    lastName: last_name,
    eventDate: settings?.uwg_day,
    isMinor: !!parental_consent_required,
    parentGuardianName: parental_consent_required ? String(parent_guardian_name).trim() : undefined,
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
    // Completing self-service registration already means the waiver (or Parental/Guardian
    // Consent Form, for minors) was signed as part of the flow — "Waiver Received" only
    // needs manual checking for waivers signed in person (e.g. day-of, via the manual-add row).
    waiver_received: true,
    waiver_accepted: true,
    parental_consent_required: !!parental_consent_required,
    parent_guardian_name: parental_consent_required ? String(parent_guardian_name).trim() : null,
    waiver_pdf_key: waiverKey,
    grand_champion: grandChampionApplies,
    checkin_code: checkinCode,
    price_breakdown: priceBreakdown,
  };

  await doc.send(new PutCommand({ TableName: TABLES.registrations, Item: item }));

  const putRequests = event_ids.map((event_id) => ({
    PutRequest: { Item: { registration_id: id, event_id } },
  }));
  await doc.send(new BatchWriteCommand({ RequestItems: { [TABLES.registrationEvents]: putRequests } }));

  // Free registrations (UMD collegiate) are already "paid" the moment they're created —
  // send the check-in code right away rather than waiting on a PayPal payment that will
  // never happen. A failed send here shouldn't block the registration itself.
  if (isFree && process.env.EMAILJS_CHECKIN_TEMPLATE_ID) {
    try {
      await sendEmailJs(process.env.EMAILJS_CHECKIN_TEMPLATE_ID, {
        to_email: email,
        to_name: `${first_name} ${last_name}`,
        checkin_code: checkinCode,
      });
    } catch (err) {
      console.error("Failed to send check-in code email:", err);
    }
  }

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

  const eventIds = Array.isArray(event_ids) ? event_ids.filter(Boolean) : [];

  const { Item: settings } = await doc.send(
    new GetCommand({ TableName: TABLES.tournamentWebpage, Key: { pk: "SETTINGS" } })
  );
  const breakdown = computeAmountDue({ collegiateStatus: collegiate_status, institution, eventCount: eventIds.length, settings });
  const checkinCode = await generateUniqueCheckinCode();

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
    amount_due: breakdown.total,
    payment_status: "pending",
    checked_in: false,
    waiver_received: false,
    waiver_accepted: false,
    parental_consent_required: false,
    waiver_pdf_key: null,
    grand_champion: false,
    checkin_code: checkinCode,
    price_breakdown: {
      first_event_price: breakdown.firstEventPrice,
      additional_events_cost: breakdown.additionalEventsCost,
      additional_events_count: breakdown.additionalEventsCount,
      is_early_bird: breakdown.isEarlyBird,
      grand_champion_cost: 0,
      total: breakdown.total,
    },
  };

  await doc.send(new PutCommand({ TableName: TABLES.registrations, Item: item }));

  if (eventIds.length > 0) {
    const putRequests = eventIds.map((event_id) => ({
      PutRequest: { Item: { registration_id: id, event_id } },
    }));
    await doc.send(new BatchWriteCommand({ RequestItems: { [TABLES.registrationEvents]: putRequests } }));
  }

  res.status(201).json({ ...item, events: [] });
});

// Public — self-service lookup by the registrant's own check-in code (not an admin route).
// Returns only what OnlineCheckin.jsx needs to display; no internal id, no editing surface.
router.get("/lookup/:code", async (req, res) => {
  const registration = await findRegistrationByCode(req.params.code);
  if (!registration) return res.status(404).json({ error: "No registration found for that code" });

  const { Items: links } = await doc.send(
    new QueryCommand({
      TableName: TABLES.registrationEvents,
      KeyConditionExpression: "registration_id = :rid",
      ExpressionAttributeValues: { ":rid": registration.id },
    })
  );
  const eventIds = (links || []).map((l) => l.event_id);
  let events = [];
  if (eventIds.length > 0) {
    const { Items: allEvents } = await doc.send(new ScanCommand({ TableName: TABLES.events }));
    const eventById = Object.fromEntries((allEvents || []).map((e) => [e.id, e]));
    events = eventIds.map((eid) => eventById[eid]).filter(Boolean).map((e) => ({ id: e.id, name: e.name }));
  }

  res.json({
    first_name: registration.first_name,
    last_name: registration.last_name,
    age_group: registration.age_group,
    experience_level: registration.experience_level,
    institution: registration.institution,
    events,
    amount_due: registration.amount_due,
    price_breakdown: registration.price_breakdown || null,
    payment_status: registration.payment_status,
    waiver_received: registration.waiver_received,
    checked_in: registration.checked_in,
  });
});

// Public — the registrant checking themselves in. Re-validates payment/waiver server-side
// regardless of what the client's button state showed (never trust the client here).
router.post("/lookup/:code/checkin", async (req, res) => {
  const registration = await findRegistrationByCode(req.params.code);
  if (!registration) return res.status(404).json({ error: "No registration found for that code" });
  if (registration.payment_status !== "paid") {
    return res.status(400).json({ error: "Payment must be completed before checking in" });
  }
  if (!registration.waiver_received) {
    return res.status(400).json({ error: "Waiver must be received before checking in" });
  }
  if (registration.checked_in) {
    return res.json({ success: true, checked_in: true });
  }

  await doc.send(
    new UpdateCommand({
      TableName: TABLES.registrations,
      Key: { id: registration.id },
      UpdateExpression: "SET checked_in = :true",
      ExpressionAttributeValues: { ":true": true },
    })
  );

  res.json({ success: true, checked_in: true });
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

// Admin-only: captures a signature drawn on a pad during in-person check-in and (re)generates
// this registration's single waiver PDF with that image embedded — for minors this is the
// Parent/Guardian's signature (their name is required, either already on file from
// registration or supplied here), otherwise the competitor's own. Marks the waiver received.
router.post("/:id/waiver/checkin-sign", requireAdmin, async (req, res) => {
  const { signatureDataUrl, parentGuardianName } = req.body || {};
  const match = /^data:image\/png;base64,(.+)$/.exec(signatureDataUrl || "");
  if (!match) return res.status(400).json({ error: "A signature is required" });

  const { Item: registration } = await doc.send(
    new GetCommand({ TableName: TABLES.registrations, Key: { id: req.params.id } })
  );
  if (!registration) return res.status(404).json({ error: "Registration not found" });

  const isMinor = MINOR_AGE_GROUPS.has(registration.age_group);
  const guardianName = isMinor ? String(parentGuardianName || registration.parent_guardian_name || "").trim() : undefined;
  if (isMinor && !guardianName) {
    return res.status(400).json({ error: "Parent/Guardian name is required for minors" });
  }

  const { Item: settings } = await doc.send(
    new GetCommand({ TableName: TABLES.tournamentWebpage, Key: { pk: "SETTINGS" } })
  );

  const waiverPdf = await generateWaiverPdf({
    firstName: registration.first_name,
    lastName: registration.last_name,
    eventDate: settings?.uwg_day,
    isMinor,
    parentGuardianName: guardianName,
    acceptedAt: new Date().toISOString(),
    signatureImage: Buffer.from(match[1], "base64"),
  });

  const waiverKey = registration.waiver_pdf_key || `${registration.id}.pdf`;
  await uploadObject(process.env.BUCKET_WAIVERS, waiverKey, waiverPdf, "application/pdf");

  const updates = {
    waiver_received: true,
    waiver_pdf_key: waiverKey,
    parental_consent_required: isMinor,
  };
  if (isMinor) updates.parent_guardian_name = guardianName;

  const keys = Object.keys(updates);
  await doc.send(
    new UpdateCommand({
      TableName: TABLES.registrations,
      Key: { id: req.params.id },
      UpdateExpression: "SET " + keys.map((k, i) => `#k${i} = :v${i}`).join(", "),
      ExpressionAttributeNames: Object.fromEntries(keys.map((k, i) => [`#k${i}`, k])),
      ExpressionAttributeValues: Object.fromEntries(keys.map((k, i) => [`:v${i}`, updates[k]])),
    })
  );

  res.json({ success: true, ...updates });
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const updates = {};
  if (typeof req.body?.checked_in === "boolean") updates.checked_in = req.body.checked_in;
  if (typeof req.body?.waiver_received === "boolean") updates.waiver_received = req.body.waiver_received;
  if (typeof req.body?.grand_champion === "boolean") updates.grand_champion = req.body.grand_champion;
  if (req.body?.payment_status !== undefined) {
    if (!["paid", "pending"].includes(req.body.payment_status)) {
      return res.status(400).json({ error: "Invalid payment_status" });
    }
    updates.payment_status = req.body.payment_status;
  }
  if (req.body?.payment_method !== undefined) {
    if (req.body.payment_method !== null && !PAYMENT_METHODS.includes(req.body.payment_method)) {
      return res.status(400).json({ error: "Invalid payment_method" });
    }
    updates.payment_method = req.body.payment_method;
  }
  if (req.body?.amount_due !== undefined) {
    const amount = Number(req.body.amount_due);
    if (!Number.isFinite(amount) || amount < 0) return res.status(400).json({ error: "Invalid amount_due" });
    updates.amount_due = amount;
  }
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

// Also recomputes and persists amount_due to match the new event count, using the same
// pricing formula as everywhere else — so dropping an event during check-in (or via the
// Registrations table's Editing mode) always keeps the charge correct without a separate step.
router.put("/:id/events", requireAdmin, async (req, res) => {
  const eventIds = Array.isArray(req.body?.event_ids) ? req.body.event_ids : [];
  if (eventIds.length === 0) {
    return res.status(400).json({ error: "event_ids must be a non-empty array" });
  }

  const { Item: registration } = await doc.send(
    new GetCommand({ TableName: TABLES.registrations, Key: { id: req.params.id } })
  );
  if (!registration) return res.status(404).json({ error: "Registration not found" });

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

  const { Item: settings } = await doc.send(
    new GetCommand({ TableName: TABLES.tournamentWebpage, Key: { pk: "SETTINGS" } })
  );
  const breakdown = computeAmountDue({
    collegiateStatus: registration.collegiate_status,
    institution: registration.institution,
    eventCount: eventIds.length,
    settings,
  });
  // Recomputed from scratch (not incrementally), so any previously-included Grand Champion
  // fee is naturally dropped here too if the event count no longer qualifies — same as
  // amount_due itself already did before this change.
  const priceBreakdown = {
    first_event_price: breakdown.firstEventPrice,
    additional_events_cost: breakdown.additionalEventsCost,
    additional_events_count: breakdown.additionalEventsCount,
    is_early_bird: breakdown.isEarlyBird,
    grand_champion_cost: 0,
    total: breakdown.total,
  };
  await doc.send(
    new UpdateCommand({
      TableName: TABLES.registrations,
      Key: { id: req.params.id },
      UpdateExpression: "SET amount_due = :amount, price_breakdown = :breakdown",
      ExpressionAttributeValues: { ":amount": breakdown.total, ":breakdown": priceBreakdown },
    })
  );

  res.json({ success: true, amount_due: breakdown.total });
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
