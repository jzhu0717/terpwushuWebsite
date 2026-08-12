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

export default function Pay() {
    const [searchParams] = useSearchParams();
    const code = normalizeCode(searchParams.get("code"));

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [paidMessage, setPaidMessage] = useState("");

    useEffect(() => {
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }, []);

    const runLookup = async () => {
        setError("");
        setLoading(true);
        try {
            const result = await api.get(`/registrations/lookup/${code}`);
            setData(result);
        } catch (err) {
            setData(null);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (code.length === 6) {
            runLookup();
        } else {
            setLoading(false);
            setError("This payment link is missing a valid code. Please use the link from your registration confirmation email.");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePaid = () => {
        setPaidMessage("Payment received! Check your email for your check-in code.");
        runLookup();
    };

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
                    Pay Registration Balance
                </h1>

                <div style={{ maxWidth: "440px", width: "100%" }}>
                    {loading && (
                        <p className="text-center text-sm text-gray-700 bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
                            Looking up your registration...
                        </p>
                    )}

                    {error && (
                        <div className="p-3 rounded-lg text-center text-sm border" style={{ background: "rgba(253, 232, 232, 0.9)", color: "#9B1C1C", borderColor: "rgba(155,28,28,0.2)" }}>
                            {error}
                        </div>
                    )}

                    {data && (
                        <div className="flex flex-col gap-4" style={CARD_STYLE}>
                            <div style={{ fontSize: "0.9375rem", color: "#333", lineHeight: 1.8 }}>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Name</span>
                                    <span>{data.first_name} {data.last_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Events</span>
                                    <span style={{ textAlign: "right", maxWidth: "60%" }}>
                                        {data.events.map((ev) => ev.name).join(", ") || "None"}
                                    </span>
                                </div>

                                {data.price_breakdown && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-gray-600">
                                                First Event
                                                {data.price_breakdown.is_early_bird === true && " (Early Bird)"}
                                                {data.price_breakdown.is_early_bird === false && " (Regular)"}
                                            </span>
                                            <span>${Number(data.price_breakdown.first_event_price).toFixed(2)}</span>
                                        </div>
                                        {data.price_breakdown.additional_events_count > 0 && (
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-gray-600">
                                                    Additional Events ({data.price_breakdown.additional_events_count})
                                                </span>
                                                <span>${Number(data.price_breakdown.additional_events_cost).toFixed(2)}</span>
                                            </div>
                                        )}
                                        {data.price_breakdown.grand_champion_cost > 0 && (
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-gray-600">Grand Champion</span>
                                                <span>${Number(data.price_breakdown.grand_champion_cost).toFixed(2)}</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="flex justify-between font-bold border-t border-zinc-200 mt-2 pt-2">
                                    <span>Total</span>
                                    <span>${Number(data.amount_due ?? 0).toFixed(2)}</span>
                                </div>
                            </div>

                            {data.payment_status === "paid" ? (
                                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-center text-sm border border-emerald-200 font-semibold">
                                    Payment Complete!
                                </div>
                            ) : paidMessage ? (
                                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-center text-sm border border-emerald-200 font-semibold">
                                    {paidMessage}
                                </div>
                            ) : (
                                <PayPalPayment code={code} onPaid={handlePaid} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
