import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../apiClient";
import PayPalPayment from "../../components/PayPalPayment";

const CARD_STYLE = {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(192, 57, 43, 0.15)",
    borderRadius: "12px",
    padding: "1.5rem 1.25rem",
};

function normalizeCode(raw) {
    return String(raw || "").trim().toUpperCase().slice(0, 6);
}

export default function OnlineCheckin() {
    const [searchParams] = useSearchParams();
    const [codeInput, setCodeInput] = useState(normalizeCode(searchParams.get("code")));
    const [lookupCode, setLookupCode] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [checkingIn, setCheckingIn] = useState(false);
    const [checkinMessage, setCheckinMessage] = useState("");

    useEffect(() => {
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }, []);

    const runLookup = async (code) => {
        if (code.length !== 6) {
            setError("Enter your 6-letter check-in code.");
            return;
        }
        setError("");
        setCheckinMessage("");
        setLoading(true);
        try {
            const result = await api.get(`/registrations/lookup/${code}`);
            setData(result);
            setLookupCode(code);
        } catch (err) {
            setData(null);
            setLookupCode(null);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initialCode = normalizeCode(searchParams.get("code"));
        if (initialCode.length === 6) {
            runLookup(initialCode);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        runLookup(codeInput);
    };

    const handlePaid = () => {
        setCheckinMessage("Payment received! Check your email for confirmation.");
        runLookup(lookupCode);
    };

    const handleCheckIn = async () => {
        setError("");
        setCheckingIn(true);
        try {
            await api.post(`/registrations/lookup/${lookupCode}/checkin`);
            setData((d) => ({ ...d, checked_in: true }));
            setCheckinMessage("Successfully checked in");
        } catch (err) {
            setError(err.message);
        } finally {
            setCheckingIn(false);
        }
    };

    const canCheckIn = data && data.payment_status === "paid" && data.waiver_received && !data.checked_in;

    return (
        <div
            className="min-h-screen"
            style={{
                background:
                    "linear-gradient(to right, #611313 0%, #a12222 6%, #e58e8e 18%, #E8C5C5 35%, #E8C5C5 65%, #e58e8e 82%, #a12222 94%, #611313 100%)",
            }}
        >
            <div className="flex justify-center pt-8 pb-2">
                <span
                    style={{
                        letterSpacing: "0.2em",
                        fontSize: "11px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        color: "#7A1A1A",
                    }}
                >
                    University of Maryland Wushu Club
                </span>
            </div>

            <div className="flex flex-col items-center px-4 py-12" style={{ gap: "1.5rem" }}>
                <h1
                    style={{
                        fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
                        fontWeight: 800,
                        letterSpacing: "-0.02em",
                        color: "#1A1A1A",
                        textAlign: "center",
                    }}
                >
                    Online Check-In
                </h1>

                <div style={{ maxWidth: "480px", width: "100%" }}>
                    <form onSubmit={handleSubmit} style={CARD_STYLE} className="flex flex-col gap-3">
                        <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
                            Check-In Code
                            <input
                                type="text"
                                value={codeInput}
                                onChange={(e) => setCodeInput(normalizeCode(e.target.value))}
                                placeholder="ABCXYZ"
                                maxLength={6}
                                style={{
                                    padding: "0.75rem",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    fontSize: "1.25rem",
                                    letterSpacing: "0.2em",
                                    textAlign: "center",
                                    fontWeight: 700,
                                }}
                            />
                        </label>
                        <p className="text-xs text-gray-500">
                            Your 6-letter code will be emailed to you when we successfully process your payment.
                        </p>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                background: "#611313",
                                color: "#fff",
                                padding: "0.75rem",
                                borderRadius: "6px",
                                fontWeight: 700,
                                border: "none",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.6 : 1,
                            }}
                        >
                            {loading ? "Looking up..." : "Look Up"}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 bg-rose-50 text-rose-800 rounded-lg text-center text-sm border border-rose-200">
                            {error}
                        </div>
                    )}
                    {checkinMessage && (
                        <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-lg text-center text-sm border border-emerald-200 font-semibold">
                            {checkinMessage}
                        </div>
                    )}

                    {data && (
                        <div className="mt-4 flex flex-col gap-4" style={CARD_STYLE}>
                            <div style={{ fontSize: "0.9375rem", color: "#333", lineHeight: 1.8 }}>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Name</span>
                                    <span>{data.first_name} {data.last_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Age Group</span>
                                    <span>{data.age_group}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Experience</span>
                                    <span>{data.experience_level}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">School</span>
                                    <span style={{ textAlign: "right", maxWidth: "60%" }}>{data.institution}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Events</span>
                                    <span style={{ textAlign: "right", maxWidth: "60%" }}>
                                        {data.events.map((ev) => ev.name).join(", ") || "None"}
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold border-t border-zinc-200 mt-2 pt-2">
                                    <span>Amount Due</span>
                                    <span>${Number(data.amount_due ?? 0).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                        data.payment_status === "paid"
                                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                            : "bg-amber-50 text-amber-800 border border-amber-200"
                                    }`}
                                >
                                    Payment: {data.payment_status}
                                </span>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                        data.waiver_received
                                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                            : "bg-amber-50 text-amber-800 border border-amber-200"
                                    }`}
                                >
                                    Waiver: {data.waiver_received ? "Received" : "Not yet received"}
                                </span>
                            </div>

                            {data.payment_status !== "paid" && (
                                <div>
                                    <strong style={{ fontSize: "0.9375rem" }}>Pay Now:</strong>
                                    <p style={{ fontSize: "0.8125rem", color: "#333", marginBottom: "0.5rem" }}>
                                        Pay your balance online now to unlock check-in.
                                    </p>
                                    <PayPalPayment code={lookupCode} onPaid={handlePaid} />
                                </div>
                            )}

                            {!data.waiver_received && (
                                <p className="text-sm text-amber-800">
                                    Your waiver hasn't been received yet. Please see the check-in table.
                                </p>
                            )}

                            {data.checked_in ? (
                                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-center text-sm border border-emerald-200 font-semibold">
                                    Checked in!
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    disabled={!canCheckIn || checkingIn}
                                    onClick={handleCheckIn}
                                    className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg py-3 rounded-lg shadow transition-all"
                                >
                                    {checkingIn ? "Checking in..." : "Check In"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
