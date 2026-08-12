// Thin wrapper around PayPal's REST API (Orders v2) — no SDK dependency, just fetch. Uses
// synchronous server-to-server calls only (create + capture); no webhook/IPN listener is
// needed since the capture response itself is the authoritative proof of payment.

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const base = process.env.PAYPAL_API_BASE;
  if (!clientId || !clientSecret || !base) {
    throw new Error("PayPal credentials are not configured");
  }

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal OAuth failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

async function createOrder(amount) {
  const base = process.env.PAYPAL_API_BASE;
  const accessToken = await getAccessToken();

  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: amount.toFixed(2) } }],
    }),
  });
  if (!res.ok) throw new Error(`PayPal create order failed (${res.status}): ${await res.text()}`);
  return res.json();
}

async function captureOrder(orderId) {
  const base = process.env.PAYPAL_API_BASE;
  const accessToken = await getAccessToken();

  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`PayPal capture failed (${res.status}): ${await res.text()}`);
  return res.json();
}

module.exports = { createOrder, captureOrder };
