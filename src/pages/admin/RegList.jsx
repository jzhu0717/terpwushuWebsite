import { useEffect, useState } from "react";
import { api } from "../../apiClient";

const TH_STYLE = { padding: "0.5rem 0.75rem", whiteSpace: "nowrap" };
const TD_STYLE = { padding: "0.5rem 0.75rem", whiteSpace: "nowrap" };

export default function RegList() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
    }, []);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const data = await api.get("/registrations");
            setRegistrations(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const toggleField = async (registration, field) => {
        const nextValue = !registration[field];
        setRegistrations((rows) =>
            rows.map((r) => (r.id === registration.id ? { ...r, [field]: nextValue } : r))
        );
        try {
            await api.patch(`/registrations/${registration.id}`, { [field]: nextValue });
        } catch (err) {
            setError(err.message);
            // Revert on failure
            setRegistrations((rows) =>
                rows.map((r) => (r.id === registration.id ? { ...r, [field]: !nextValue } : r))
            );
        }
    };

    const handleViewWaiver = async (registration) => {
        try {
            const { url } = await api.get(`/registrations/${registration.id}/waiver`);
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (registration) => {
        if (!window.confirm(`Delete the registration for ${registration.first_name} ${registration.last_name}?`)) return;
        try {
            await api.delete(`/registrations/${registration.id}`);
            setRegistrations((rows) => rows.filter((r) => r.id !== registration.id));
        } catch (err) {
            setError(err.message);
        }
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
                    Admin Panel
                </span>
            </div>

            <div className="max-w-[95vw] mx-auto bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                        <h3 className="text-xl font-extrabold text-[#611313]">Registrations</h3>
                        <p className="text-xs text-gray-500">{registrations.length} registrant{registrations.length === 1 ? "" : "s"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href="/docs/Event-Waiver.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-red-700 underline"
                        >
                            View Blank Waiver
                        </a>
                        <a
                            href="/api/registrations/export"
                            className="bg-[#611313] hover:bg-[#801b1b] text-white font-bold text-xs px-4 py-2 rounded shadow transition-all"
                        >
                            Download CSV
                        </a>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-center text-sm text-gray-500 py-8">Loading registrations...</p>
                ) : registrations.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 py-8">No registrations yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="border-collapse text-left text-sm text-gray-700">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-500 font-semibold uppercase text-xs tracking-wider">
                                    <th style={TH_STYLE}>Name</th>
                                    <th style={TH_STYLE}>Email</th>
                                    <th style={TH_STYLE}>Gender</th>
                                    <th style={TH_STYLE}>Experience</th>
                                    <th style={TH_STYLE}>Status</th>
                                    <th style={TH_STYLE}>Age Group</th>
                                    <th style={TH_STYLE}>Institution</th>
                                    <th style={TH_STYLE}>Events</th>
                                    <th style={TH_STYLE}>Amount Due</th>
                                    <th style={TH_STYLE}>Payment</th>
                                    <th style={TH_STYLE}>Checked In</th>
                                    <th style={TH_STYLE}>Waiver Received</th>
                                    <th style={TH_STYLE}>Signed Waiver</th>
                                    <th style={TH_STYLE}>Grand Champion</th>
                                    <th style={TH_STYLE}></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {registrations.map((r) => (
                                    <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                                        <td style={TD_STYLE} className="font-semibold">{r.first_name} {r.last_name}</td>
                                        <td style={TD_STYLE}>{r.email}</td>
                                        <td style={TD_STYLE}>{r.gender}</td>
                                        <td style={TD_STYLE}>{r.experience_level}</td>
                                        <td style={TD_STYLE}>{r.collegiate_status}</td>
                                        <td style={TD_STYLE}>{r.age_group}</td>
                                        <td style={TD_STYLE}>{r.institution}</td>
                                        <td style={{ ...TD_STYLE, whiteSpace: "normal", minWidth: "220px" }}>
                                            {(r.events || []).map((ev) => ev.name).join(", ") || <span className="text-gray-400 italic">None</span>}
                                        </td>
                                        <td style={TD_STYLE}>${Number(r.amount_due ?? 0).toFixed(2)}</td>
                                        <td style={TD_STYLE}>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    r.payment_status === "paid"
                                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                        : "bg-amber-50 text-amber-800 border border-amber-200"
                                                }`}
                                            >
                                                {r.payment_status}
                                            </span>
                                        </td>
                                        <td style={TD_STYLE} className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={!!r.checked_in}
                                                onChange={() => toggleField(r, "checked_in")}
                                            />
                                        </td>
                                        <td style={TD_STYLE} className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={!!r.waiver_received}
                                                onChange={() => toggleField(r, "waiver_received")}
                                            />
                                        </td>
                                        <td style={TD_STYLE}>
                                            {r.waiver_pdf_key ? (
                                                <button
                                                    onClick={() => handleViewWaiver(r)}
                                                    className="text-xs font-semibold text-red-700 underline hover:text-red-900"
                                                >
                                                    View PDF
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">None</span>
                                            )}
                                        </td>
                                        <td style={TD_STYLE} className="text-center">{r.grand_champion ? "Yes" : "—"}</td>
                                        <td style={TD_STYLE}>
                                            <button
                                                onClick={() => handleDelete(r)}
                                                className="text-xs font-semibold text-red-700 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
