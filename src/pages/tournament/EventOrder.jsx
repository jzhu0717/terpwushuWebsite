import { useEffect, useState } from "react";
import { api } from "../../apiClient";

const POLL_INTERVAL_MS = 3000;

const CARD_STYLE = {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(192, 57, 43, 0.15)",
    borderRadius: "12px",
    overflow: "hidden",
};

const STATUS_LABELS = {
    completed: "Completed",
    in_progress: "In Progress",
    upcoming: "Upcoming",
};

const STATUS_COLORS = {
    completed: { bg: "#DCFCE7", color: "#166534" },
    in_progress: { bg: "#FEF3C7", color: "#92400E" },
    upcoming: { bg: "#F3F4F6", color: "#4B5563" },
};

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

function StatusBadge({ status }) {
    const colors = STATUS_COLORS[status] || STATUS_COLORS.upcoming;
    return (
        <span
            style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "2px 8px",
                borderRadius: "999px",
                background: colors.bg,
                color: colors.color,
            }}
        >
            {STATUS_LABELS[status] || status}
        </span>
    );
}

function EventBox({ event, expanded, onToggle }) {
    return (
        <div style={{ border: "1px solid rgba(192, 57, 43, 0.15)", borderRadius: "8px", overflow: "hidden", marginBottom: "0.5rem" }}>
            <button
                onClick={onToggle}
                className="w-full text-left"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    padding: "0.65rem 0.9rem",
                    background: "rgba(139, 26, 26, 0.06)",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1A1A1A" }}>{event.displayLabel}</span>
                <span className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                    <StatusBadge status={event.status} />
                    <span style={{ fontSize: "11px", color: "#8B1A1A" }}>{expanded ? "▲" : "▼"}</span>
                </span>
            </button>

            {expanded && (
                <div>
                    {event.status !== "upcoming" && (
                        <div
                            style={{
                                textAlign: "center",
                                fontSize: "11px",
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: "#4B5563",
                                background: "#F3F4F6",
                                padding: "0.35rem",
                            }}
                        >
                            {STATUS_LABELS[event.status]}
                        </div>
                    )}
                    {event.competitors.length === 0 ? (
                        <p className="text-xs text-gray-500 italic p-3">No competitors.</p>
                    ) : (
                        event.competitors.map((c) => (
                            <div
                                key={c.id}
                                className="flex items-center justify-between"
                                style={{ padding: "0.5rem 0.9rem", borderTop: "1px solid #eee", fontSize: "0.875rem" }}
                            >
                                <span className="flex items-center gap-2" style={{ color: "#1A1A1A" }}>
                                    {c.rank && MEDALS[c.rank] && <span>{MEDALS[c.rank]}</span>}
                                    <span style={{ fontWeight: c.rank ? 600 : 400 }}>{c.name}</span>
                                </span>
                                <span style={{ fontWeight: 700, color: c.rank ? "#8B1A1A" : "#9CA3AF" }}>
                                    {c.score !== null && c.score !== undefined ? c.score : "—"}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function RingColumn({ title, ring, expandedKeys, onToggle }) {
    if (!ring || !ring.configured) return null;

    return (
        <div style={{ flex: 1, minWidth: 0 }}>
            <h2
                style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#8B1A1A",
                    marginBottom: "0.75rem",
                    textAlign: "center",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                }}
            >
                {title}
            </h2>
            <div style={CARD_STYLE}>
                <div style={{ padding: "0.75rem" }}>
                    {ring.error ? (
                        <p className="text-center text-sm text-rose-700">{ring.error}</p>
                    ) : ring.events.length === 0 ? (
                        <p className="text-center text-sm text-gray-500">No events scheduled yet.</p>
                    ) : (
                        ring.events.map((event) => (
                            <EventBox
                                key={event.key}
                                event={event}
                                expanded={expandedKeys.has(event.key)}
                                onToggle={() => onToggle(event.key)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default function EventOrder() {
    const [data, setData] = useState({ configured: false, ring1: null, ring2: null });
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);
    const [expandedKeys, setExpandedKeys] = useState(() => new Set());

    useEffect(() => {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const result = await api.get("/live-scoring");
                if (cancelled) return;
                setData(result);
                setLastUpdated(new Date());
            } catch (err) {
                if (!cancelled) setError(err.message);
            }
        }

        load();
        const interval = setInterval(load, POLL_INTERVAL_MS);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    const toggleEvent = (key) => {
        setExpandedKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const noRingsConfigured = data.configured && !data.ring1?.configured && !data.ring2?.configured;

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
                        lineHeight: 1.1,
                        color: "#1A1A1A",
                        textAlign: "center",
                    }}
                >
                    Live Scoring
                </h1>

                <div style={{ maxWidth: "1000px", width: "100%" }}>
                    {!data.configured || noRingsConfigured ? (
                        <div style={{ ...CARD_STYLE, padding: "1.5rem 1.25rem" }}>
                            <p className="text-center text-sm text-gray-600">
                                Live scoring not available.
                            </p>
                        </div>
                    ) : error ? (
                        <div style={{ ...CARD_STYLE, padding: "1.5rem 1.25rem" }}>
                            <div className="p-3 bg-rose-50 text-rose-800 rounded-lg text-center text-sm border border-rose-200">
                                {error}
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-6 flex-wrap md:flex-nowrap">
                            <RingColumn title="Ring 1" ring={data.ring1} expandedKeys={expandedKeys} onToggle={toggleEvent} />
                            <RingColumn title="Ring 2" ring={data.ring2} expandedKeys={expandedKeys} onToggle={toggleEvent} />
                        </div>
                    )}

                    {lastUpdated && (
                        <p className="text-center text-xs text-white/80 mt-4">
                            Last updated {lastUpdated.toLocaleTimeString()} (refreshes automatically every 10 seconds.)
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
