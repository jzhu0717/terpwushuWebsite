const express = require("express");
const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TABLES } = require("../lib/dynamo");
const { createOrder, captureOrder } = require("../lib/paypal");
const { findRegistrationByCode } = require("../lib/checkinCode");
const { sendEmailJs } = require("../lib/emailjs");

const router = express.Router();

// Public — gated only by knowing the registration's own check-in code, same as the /lookup
// routes. Always prices the order from the registration's own stored amount_due; never
// trusts a client-sent amount.
router.post("/create-order", async (req, res) => {
  try {
    const registration = await findRegistrationByCode(req.body?.code);
    if (!registration) return res.status(404).json({ error: "Registration not found" });
    if (registration.payment_status === "paid") {
      return res.status(400).json({ error: "This registration is already paid" });
    }

    const amount = Number(registration.amount_due || 0);
    if (!(amount > 0)) return res.status(400).json({ error: "Nothing due" });

    const order = await createOrder(amount);

    // Recorded so /capture-order can confirm the orderId it's asked to capture is actually
    // the one we just issued for *this* registration — stops one registration's order id
    // from being replayed against a different registration's code.
    await doc.send(
      new UpdateCommand({
        TableName: TABLES.registrations,
        Key: { id: registration.id },
        UpdateExpression: "SET pending_paypal_order_id = :orderId",
        ExpressionAttributeValues: { ":orderId": order.id },
      })
    );

    res.json({ orderId: order.id });
  } catch (err) {
    console.error("paypal/create-order failed:", err);
    res.status(502).json({ error: "Could not start the PayPal payment. Please try again." });
  }
});

router.post("/capture-order", async (req, res) => {
  try {
    const { code, orderId } = req.body || {};
    const registration = await findRegistrationByCode(code);
    if (!registration) return res.status(404).json({ error: "Registration not found" });
    if (!orderId || orderId !== registration.pending_paypal_order_id) {
      return res.status(400).json({ error: "This order does not match this registration" });
    }
    if (registration.payment_status === "paid") {
      return res.json({ success: true, payment_status: "paid" });
    }

    const capture = await captureOrder(orderId);
    const captureUnit = capture.purchase_units?.[0]?.payments?.captures?.[0];
    const capturedAmount = Number(captureUnit?.amount?.value || 0);
    const amountDue = Number(registration.amount_due || 0);

    if (capture.status !== "COMPLETED" || Math.abs(capturedAmount - amountDue) > 0.01) {
      console.error("PayPal capture did not match expected amount/status:", { capture, amountDue });
      return res.status(502).json({ error: "Payment could not be verified" });
    }

    try {
      await doc.send(
        new UpdateCommand({
          TableName: TABLES.registrations,
          Key: { id: registration.id },
          UpdateExpression: "SET payment_status = :paid, payment_method = :method, paypal_order_id = :orderId",
          ConditionExpression: "payment_status = :pending",
          ExpressionAttributeValues: {
            ":paid": "paid",
            ":pending": "pending",
            ":method": "PayPal",
            ":orderId": orderId,
          },
        })
      );
    } catch (err) {
      // Already paid by a concurrent/retried request — the payment itself succeeded either way.
      if (err.name === "ConditionalCheckFailedException") {
        return res.json({ success: true, payment_status: "paid" });
      }
      throw err;
    }

    if (process.env.EMAILJS_CHECKIN_TEMPLATE_ID) {
      try {
        await sendEmailJs(process.env.EMAILJS_CHECKIN_TEMPLATE_ID, {
          to_email: registration.email,
          to_name: `${registration.first_name} ${registration.last_name}`,
          checkin_code: registration.checkin_code,
        });
      } catch (err) {
        console.error("Failed to send check-in code email:", err);
      }
    }

    res.json({ success: true, payment_status: "paid" });
  } catch (err) {
    console.error("paypal/capture-order failed:", err);
    res.status(502).json({ error: "Payment could not be confirmed. Please contact the club if you were charged." });
  }
});

module.exports = router;
