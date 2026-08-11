import { useEffect, useState } from "react";
import { api } from "../../apiClient";

const RINGS = [
    { session: "morning", ring: "ring1", label: "Ring 1 (Purple Mat)" },
    { session: "morning", ring: "ring2", label: "Ring 2 (Blue Mat)" },
];
const AFTERNOON_RINGS = [
    { session: "afternoon", ring: "ring1", label: "Ring 1 (Purple Mat)" },
    { session: "afternoon", ring: "ring2", label: "Ring 2 (Blue Mat)" },
];

function RingTable({ blocks }) {
    if (blocks.length === 0) {
        return <p style={{ fontSize: "12px", color: "#666", fontStyle: "italic" }}>No events</p>;
    }
    return (
        <table>
            <tbody>
                {blocks.map((block) => {
                    const competitors = block.competitors.length > 0 ? block.competitors : [{ id: `${block.key}-empty`, name: "" }];
                    return competitors.map((c, i) => (
                        <tr key={c.id}>
                            {i === 0 && (
                                <td rowSpan={competitors.length} className="event-label">
                                    {block.displayLabel}
                                </td>
                            )}
                            <td>{c.name}</td>
                        </tr>
                    ));
                })}
            </tbody>
        </table>
    );
}

function SessionBlock({ title, rings, sessions }) {
    return (
        <div style={{ pageBreakInside: "avoid", marginBottom: "2rem" }}>
            <h2 style={{ textAlign: "center", fontSize: "1.15rem", fontWeight: 800, marginBottom: "0.75rem" }}>{title}</h2>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                {rings.map((r) => (
                    <div key={r.ring} style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.35rem" }}>{r.label}</h3>
                        <RingTable blocks={sessions[r.session]?.[r.ring] || []} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminEventOrderPrint() {
    const [sessions, setSessions] = useState(null);
    const [eventNumber, setEventNumber] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const [orderData, settings] = await Promise.all([
                    api.get("/event-order"),
                    api.get("/tournament-webpage"),
                ]);
                setSessions(orderData.sessions);
                setEventNumber(settings?.event_number || "");
            } catch (err) {
                setError(err.message);
            }
        }
        load();
    }, []);

    return (
        <div style={{ fontFamily: "Georgia, 'Times New Roman Bold', serif", color: "#111", padding: "1.5rem", maxWidth: "1400px", margin: "0 auto" }}>
            <style>{`
                @media print {
                    .no-print { display: none; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    @page { size: landscape; margin: 0.5in; }
                }
                table { border-collapse: collapse; width: 100%; }
                td { border: 1px solid #888; padding: 3px 8px; font-size: 12px; text-align: left; vertical-align: top; }
                td.event-label { font-weight: 700; width: 42%; }
            `}</style>

            <div className="no-print" style={{ marginBottom: "1rem" }}>
                <button
                    onClick={() => window.print()}
                    style={{ background: "#611313", color: "#fff", padding: "0.5rem 1rem", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: 700 }}
                >
                    Print
                </button>
            </div>

            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "1.5rem" }}>
                {eventNumber} University Wushu Games: Event Order
            </h1>

            {error && <p style={{ color: "#9B1C1C" }}>{error}</p>}

            {!sessions && !error && <p>Loading...</p>}

            {sessions && (
                <>
                    <SessionBlock title="Morning" rings={RINGS} sessions={sessions} />
                    <SessionBlock title="After Lunch" rings={AFTERNOON_RINGS} sessions={sessions} />
                </>
            )}
        </div>
    );
}
