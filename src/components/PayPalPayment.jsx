import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { api } from "../apiClient";

function Buttons({ code, onPaid, error, setError }) {
    const [{ isPending, isRejected, isResolved }] = usePayPalScriptReducer();

    if (isRejected) {
        return (
            <p className="text-sm text-red-700">
                Could not load PayPal. If you have an ad blocker or privacy extension enabled, please disable it for this site and reload the page.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {isPending && <p className="text-sm text-gray-500">Loading PayPal...</p>}
            {error && (
                <div className="p-2 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs">{error}</div>
            )}
            <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={async () => {
                    setError("");
                    const { orderId } = await api.post("/paypal/create-order", { code });
                    return orderId;
                }}
                onApprove={async (data) => {
                    try {
                        await api.post("/paypal/capture-order", { code, orderId: data.orderID });
                        onPaid();
                    } catch (err) {
                        setError(err.message || "Payment could not be confirmed. Please contact the club.");
                    }
                }}
                onError={(err) => {
                    console.error("PayPal error:", err);
                    setError("Something went wrong with PayPal. Please try again.");
                }}
            />
            {isResolved && (
                <p className="text-xs text-gray-400">
                    Make payments to terpwushu@gmail.com
                    <br></br>
                    Please include competitor name in payment note
                </p>
            )}
        </div>
    );
}

// Shared PayPal payment widget — used by both the registration success page and the
// self-service Pay/OnlineCheckin pages. The server is always the source of truth for the
// amount (it prices the order from the registration's own stored amount_due, never anything
// sent by the client) and for whether the payment actually went through (via
// /api/paypal/capture-order, a direct server-to-server call to PayPal — not the client-side
// approval alone).
export default function PayPalPayment({ code, onPaid }) {
    const [error, setError] = useState("");
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    // The SDK loader defaults to the *live* PayPal endpoint unless told otherwise — without
    // this, a sandbox Client ID gets checked against production PayPal, which is why login
    // failed with "some of your info isn't correct" even for valid sandbox test credentials.
    const environment = import.meta.env.VITE_PAYPAL_ENVIRONMENT || "sandbox";

    if (!clientId) {
        return <p className="text-sm text-red-700">Online payment isn't configured yet.</p>;
    }

    return (
        <PayPalScriptProvider options={{ clientId, currency: "USD", disableFunding: "paylater", environment }}>
            <Buttons code={code} onPaid={onPaid} error={error} setError={setError} />
        </PayPalScriptProvider>
    );
}
