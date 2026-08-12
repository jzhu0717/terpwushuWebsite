import { useEffect, useMemo, useState } from "react";
import { api } from "../../apiClient";
import { NON_COLLEGIATE_AGE_GROUPS, COLLEGIATE_AGE_GROUPS, WUSHU_SCHOOLS, COLLEGES, GRAND_CHAMPION_MIN_EVENTS } from "../../constants/registrationOptions";

const TH_STYLE = { padding: "0.5rem 0.75rem", whiteSpace: "nowrap" };
const TD_STYLE = { padding: "0.5rem 0.75rem", whiteSpace: "nowrap" };
const PICKER_STYLE = { maxHeight: "170px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "6px", padding: "0.35rem 0.5rem", background: "#fff" };

// Single-select field rendered as checkboxes (checking one unchecks the others) — matches
// the requested "checkboxes to select the options" UI even for fields that only ever hold
// one value.
function SingleSelectCheckboxes({ options, value, onChange }) {
    return (
        <div style={PICKER_STYLE}>
            {options.map((opt) => (
                <label key={opt} className="flex items-center gap-1.5" style={{ fontSize: "12px", whiteSpace: "nowrap", cursor: "pointer" }}>
                    <input type="checkbox" checked={value === opt} onChange={() => onChange(opt)} />
                    {opt}
                </label>
            ))}
        </div>
    );
}

// Column key -> comparable value extractor, used by the sortable table headers below.
const SORT_VALUE_GETTERS = {
    name: (r) => `${r.first_name} ${r.last_name}`.toLowerCase(),
    email: (r) => String(r.email || "").toLowerCase(),
    gender: (r) => String(r.gender || "").toLowerCase(),
    experience_level: (r) => String(r.experience_level || "").toLowerCase(),
    collegiate_status: (r) => String(r.collegiate_status || "").toLowerCase(),
    age_group: (r) => String(r.age_group || "").toLowerCase(),
    institution: (r) => String(r.institution || "").toLowerCase(),
    events: (r) => (r.events || []).length,
    amount_due: (r) => Number(r.amount_due ?? 0),
    payment_status: (r) => String(r.payment_status || "").toLowerCase(),
    checked_in: (r) => (r.checked_in ? 1 : 0),
    waiver_received: (r) => (r.waiver_received ? 1 : 0),
    grand_champion: (r) => (r.grand_champion ? 1 : 0),
};

function SortableHeader({ label, sortKey, sortConfig, onSort }) {
    const active = sortConfig.key === sortKey;
    const icon = active ? (sortConfig.direction === "asc" ? "↑" : "↓") : "⇕";
    return (
        <th style={TH_STYLE}>
            <button
                type="button"
                onClick={() => onSort(sortKey)}
                className="flex items-center gap-1 uppercase text-xs tracking-wider font-semibold text-gray-500 hover:text-gray-800"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
                {label}
                <span style={{ opacity: active ? 1 : 0.4 }}>{icon}</span>
            </button>
        </th>
    );
}

const emptyNewCompetitor = () => ({
    first_name: "",
    last_name: "",
    email: "",
    gender: "",
    experience_level: "",
    collegiate_status: "",
    age_group: "",
    institution: "",
    event_ids: [],
});

// The event catalog reuses the same event names across multiple categories (e.g. "ChangQuan
// (Longfist)" appears under Group A/B/C Compulsory *and* Contemporary Barehand) — a flat list
// of names is ambiguous about which one you're actually toggling, so options are grouped
// under their category as a heading. Relies on `options` already being sorted by sort_order
// (as returned by GET /events) so same-category rows stay contiguous.
function MultiSelectCheckboxes({ options, values, onToggle }) {
    let lastCategory;
    return (
        <div style={PICKER_STYLE}>
            {options.map((opt) => {
                const showHeader = opt.category !== lastCategory;
                lastCategory = opt.category;
                return (
                    <div key={opt.id}>
                        {showHeader && opt.category && (
                            <div
                                style={{
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    color: "#8B1A1A",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.03em",
                                    marginTop: "0.35rem",
                                }}
                            >
                                {opt.category}
                            </div>
                        )}
                        <label className="flex items-center gap-1.5" style={{ fontSize: "12px", whiteSpace: "nowrap", cursor: "pointer" }}>
                            <input type="checkbox" checked={values.includes(opt.id)} onChange={() => onToggle(opt.id)} />
                            {opt.name}
                        </label>
                    </div>
                );
            })}
        </div>
    );
}

export default function RegList() {
    const [registrations, setRegistrations] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [editingMode, setEditingMode] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [newCompetitor, setNewCompetitor] = useState(emptyNewCompetitor);
    const [addingCompetitor, setAddingCompetitor] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [regData, eventsData] = await Promise.all([
                api.get("/registrations"),
                api.get("/events"),
            ]);
            setRegistrations(regData);
            setAllEvents(eventsData || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const filteredRegistrations = useMemo(() => {
        const q = search.trim().toLowerCase();
        const filtered = !q
            ? registrations
            : registrations.filter((r) => {
                  const name = `${r.first_name} ${r.last_name}`.toLowerCase();
                  return name.includes(q) || String(r.email || "").toLowerCase().includes(q);
              });

        if (!sortConfig.key) return filtered;
        const getValue = SORT_VALUE_GETTERS[sortConfig.key];
        const dir = sortConfig.direction === "asc" ? 1 : -1;
        return [...filtered].sort((a, b) => {
            const va = getValue(a);
            const vb = getValue(b);
            if (va < vb) return -1 * dir;
            if (va > vb) return 1 * dir;
            return 0;
        });
    }, [registrations, search, sortConfig]);

    const handleSort = (key) => {
        setSortConfig((prev) =>
            prev.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }
        );
    };

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

    const updateField = async (registration, field, value) => {
        const previous = registration[field];
        setRegistrations((rows) =>
            rows.map((r) => (r.id === registration.id ? { ...r, [field]: value } : r))
        );
        try {
            await api.patch(`/registrations/${registration.id}`, { [field]: value });
        } catch (err) {
            setError(err.message);
            setRegistrations((rows) =>
                rows.map((r) => (r.id === registration.id ? { ...r, [field]: previous } : r))
            );
        }
    };

    const toggleRegistrationEvent = async (registration, eventId) => {
        const currentIds = (registration.events || []).map((e) => e.id);
        const nextIds = currentIds.includes(eventId)
            ? currentIds.filter((id) => id !== eventId)
            : [...currentIds, eventId];
        if (nextIds.length === 0) {
            setError("A registration must have at least one event.");
            return;
        }

        const previousEvents = registration.events;
        const nextEvents = allEvents.filter((ev) => nextIds.includes(ev.id));
        // Dropping below the Grand Champion event minimum invalidates an existing Grand
        // Champion selection — clear it alongside the event change so the table never shows
        // a Grand Champion entry that no longer qualifies.
        const shouldClearGrandChampion = registration.grand_champion && nextIds.length < GRAND_CHAMPION_MIN_EVENTS;
        setRegistrations((rows) =>
            rows.map((r) =>
                r.id === registration.id
                    ? { ...r, events: nextEvents, ...(shouldClearGrandChampion ? { grand_champion: false } : {}) }
                    : r
            )
        );
        try {
            const { amount_due } = await api.put(`/registrations/${registration.id}/events`, { event_ids: nextIds });
            setRegistrations((rows) =>
                rows.map((r) => (r.id === registration.id ? { ...r, amount_due } : r))
            );
            if (shouldClearGrandChampion) {
                await api.patch(`/registrations/${registration.id}`, { grand_champion: false });
            }
        } catch (err) {
            setError(err.message);
            setRegistrations((rows) =>
                rows.map((r) =>
                    r.id === registration.id ? { ...r, events: previousEvents, grand_champion: registration.grand_champion } : r
                )
            );
        }
    };

    const handleAddCompetitor = async () => {
        if (!newCompetitor.first_name.trim() || !newCompetitor.last_name.trim()) {
            setError("First and last name are required to add a competitor.");
            return;
        }
        setAddingCompetitor(true);
        try {
            await api.post("/registrations/manual", newCompetitor);
            setNewCompetitor(emptyNewCompetitor());
            await fetchAll();
        } catch (err) {
            setError(err.message);
        } finally {
            setAddingCompetitor(false);
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
                        <p className="text-xs text-gray-500">
                            {filteredRegistrations.length} of {registrations.length} registrant{registrations.length === 1 ? "" : "s"}
                        </p>
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

                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="p-2 border rounded text-sm w-full sm:w-72"
                    />
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <input type="checkbox" checked={editingMode} onChange={(e) => setEditingMode(e.target.checked)} />
                        Editing mode
                    </label>
                    {editingMode && (
                        <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                            Changes save immediately as you check/uncheck options.
                        </span>
                    )}
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-center text-sm text-gray-500 py-8">Loading registrations...</p>
                ) : filteredRegistrations.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 py-8">
                        {registrations.length === 0 ? "No registrations yet." : "No registrations match your search."}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="border-collapse text-left text-sm text-gray-700">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-500 font-semibold uppercase text-xs tracking-wider">
                                    <SortableHeader label="Name" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Email" sortKey="email" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Gender" sortKey="gender" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Experience" sortKey="experience_level" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Status" sortKey="collegiate_status" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Age Group" sortKey="age_group" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Institution" sortKey="institution" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Events" sortKey="events" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Amount Due" sortKey="amount_due" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Payment" sortKey="payment_status" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Checked In" sortKey="checked_in" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableHeader label="Waiver Received" sortKey="waiver_received" sortConfig={sortConfig} onSort={handleSort} />
                                    <th style={TH_STYLE}>Signed Waiver</th>
                                    <SortableHeader label="Grand Champion" sortKey="grand_champion" sortConfig={sortConfig} onSort={handleSort} />
                                    <th style={TH_STYLE}></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {editingMode && (() => {
                                    const isCollegiate = newCompetitor.collegiate_status === "Collegiate";
                                    const ageGroupOptions = isCollegiate ? COLLEGIATE_AGE_GROUPS : NON_COLLEGIATE_AGE_GROUPS;
                                    const institutionOptions = isCollegiate ? COLLEGES : WUSHU_SCHOOLS;
                                    const setField = (field, value) => setNewCompetitor((c) => ({ ...c, [field]: value }));
                                    const toggleEvent = (eventId) =>
                                        setNewCompetitor((c) => ({
                                            ...c,
                                            event_ids: c.event_ids.includes(eventId)
                                                ? c.event_ids.filter((id) => id !== eventId)
                                                : [...c.event_ids, eventId],
                                        }));
                                    const canAdd = newCompetitor.first_name.trim() && newCompetitor.last_name.trim() && !addingCompetitor;
                                    const inputStyle = { fontSize: "12px", padding: "0.2rem 0.35rem", border: "1px solid #ddd", borderRadius: "4px", width: "110px" };
                                    return (
                                        <tr className="bg-amber-50/60 align-top">
                                            <td style={TD_STYLE}>
                                                <div className="flex flex-col gap-1">
                                                    <input
                                                        type="text"
                                                        placeholder="First name"
                                                        value={newCompetitor.first_name}
                                                        onChange={(e) => setField("first_name", e.target.value)}
                                                        style={inputStyle}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Last name"
                                                        value={newCompetitor.last_name}
                                                        onChange={(e) => setField("last_name", e.target.value)}
                                                        style={inputStyle}
                                                    />
                                                </div>
                                            </td>
                                            <td style={TD_STYLE}>
                                                <input
                                                    type="text"
                                                    placeholder="Email (optional)"
                                                    value={newCompetitor.email}
                                                    onChange={(e) => setField("email", e.target.value)}
                                                    style={{ ...inputStyle, width: "150px" }}
                                                />
                                            </td>
                                            <td style={TD_STYLE}>
                                                <SingleSelectCheckboxes options={["M", "F"]} value={newCompetitor.gender} onChange={(v) => setField("gender", v)} />
                                            </td>
                                            <td style={TD_STYLE}>
                                                <SingleSelectCheckboxes
                                                    options={["Beginner", "Intermediate", "Advanced"]}
                                                    value={newCompetitor.experience_level}
                                                    onChange={(v) => setField("experience_level", v)}
                                                />
                                            </td>
                                            <td style={TD_STYLE}>
                                                <SingleSelectCheckboxes
                                                    options={["Collegiate", "Non-Collegiate"]}
                                                    value={newCompetitor.collegiate_status}
                                                    onChange={(v) => setField("collegiate_status", v)}
                                                />
                                            </td>
                                            <td style={{ ...TD_STYLE, whiteSpace: "normal" }}>
                                                <SingleSelectCheckboxes options={ageGroupOptions} value={newCompetitor.age_group} onChange={(v) => setField("age_group", v)} />
                                            </td>
                                            <td style={{ ...TD_STYLE, whiteSpace: "normal" }}>
                                                <SingleSelectCheckboxes options={institutionOptions} value={newCompetitor.institution} onChange={(v) => setField("institution", v)} />
                                            </td>
                                            <td style={{ ...TD_STYLE, whiteSpace: "normal", minWidth: "220px" }}>
                                                <MultiSelectCheckboxes options={allEvents} values={newCompetitor.event_ids} onToggle={toggleEvent} />
                                            </td>
                                            <td style={TD_STYLE} colSpan={5}>
                                                <span className="text-xs text-gray-400 italic">Filled in after adding</span>
                                            </td>
                                            <td style={TD_STYLE}>
                                                <button
                                                    onClick={handleAddCompetitor}
                                                    disabled={!canAdd}
                                                    className="text-xs font-bold text-white bg-[#611313] hover:bg-[#801b1b] disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded shadow transition-all"
                                                >
                                                    {addingCompetitor ? "Adding..." : "+ Add"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })()}
                                {filteredRegistrations.map((r) => {
                                    const isCollegiate = r.collegiate_status === "Collegiate";
                                    const ageGroupOptions = isCollegiate ? COLLEGIATE_AGE_GROUPS : NON_COLLEGIATE_AGE_GROUPS;
                                    const institutionOptions = isCollegiate ? COLLEGES : WUSHU_SCHOOLS;
                                    return (
                                        <tr key={r.id} className="hover:bg-zinc-50 transition-colors align-top">
                                            <td style={TD_STYLE} className="font-semibold">{r.first_name} {r.last_name}</td>
                                            <td style={TD_STYLE}>{r.email}</td>

                                            <td style={TD_STYLE}>
                                                {editingMode ? (
                                                    <SingleSelectCheckboxes options={["M", "F"]} value={r.gender} onChange={(v) => updateField(r, "gender", v)} />
                                                ) : r.gender}
                                            </td>

                                            <td style={TD_STYLE}>
                                                {editingMode ? (
                                                    <SingleSelectCheckboxes
                                                        options={["Beginner", "Intermediate", "Advanced"]}
                                                        value={r.experience_level}
                                                        onChange={(v) => updateField(r, "experience_level", v)}
                                                    />
                                                ) : r.experience_level}
                                            </td>

                                            <td style={TD_STYLE}>
                                                {editingMode ? (
                                                    <SingleSelectCheckboxes
                                                        options={["Collegiate", "Non-Collegiate"]}
                                                        value={r.collegiate_status}
                                                        onChange={(v) => updateField(r, "collegiate_status", v)}
                                                    />
                                                ) : r.collegiate_status}
                                            </td>

                                            <td style={{ ...TD_STYLE, whiteSpace: editingMode ? "normal" : "nowrap" }}>
                                                {editingMode ? (
                                                    <SingleSelectCheckboxes options={ageGroupOptions} value={r.age_group} onChange={(v) => updateField(r, "age_group", v)} />
                                                ) : r.age_group}
                                            </td>

                                            <td style={{ ...TD_STYLE, whiteSpace: editingMode ? "normal" : "nowrap" }}>
                                                {editingMode ? (
                                                    <SingleSelectCheckboxes options={institutionOptions} value={r.institution} onChange={(v) => updateField(r, "institution", v)} />
                                                ) : r.institution}
                                            </td>

                                            <td style={{ ...TD_STYLE, whiteSpace: "normal", minWidth: "220px" }}>
                                                {editingMode ? (
                                                    <MultiSelectCheckboxes
                                                        options={allEvents}
                                                        values={(r.events || []).map((ev) => ev.id)}
                                                        onToggle={(eventId) => toggleRegistrationEvent(r, eventId)}
                                                    />
                                                ) : (
                                                    (r.events || []).map((ev) => ev.name).join(", ") || <span className="text-gray-400 italic">None</span>
                                                )}
                                            </td>

                                            <td style={TD_STYLE}>${Number(r.amount_due ?? 0).toFixed(2)}</td>
                                            <td style={TD_STYLE}>
                                                <label className="flex items-center gap-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={r.payment_status === "paid"}
                                                        onChange={() => updateField(r, "payment_status", r.payment_status === "paid" ? "pending" : "paid")}
                                                    />
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                            r.payment_status === "paid"
                                                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                                : "bg-amber-50 text-amber-800 border border-amber-200"
                                                        }`}
                                                    >
                                                        {r.payment_status}
                                                    </span>
                                                </label>
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
                                            <td style={TD_STYLE} className="text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={!!r.grand_champion}
                                                    disabled={(r.events || []).length < GRAND_CHAMPION_MIN_EVENTS}
                                                    title={
                                                        (r.events || []).length < GRAND_CHAMPION_MIN_EVENTS
                                                            ? `Requires at least ${GRAND_CHAMPION_MIN_EVENTS} events`
                                                            : undefined
                                                    }
                                                    onChange={() => toggleField(r, "grand_champion")}
                                                />
                                            </td>
                                            <td style={TD_STYLE}>
                                                <button
                                                    onClick={() => handleDelete(r)}
                                                    className="text-xs font-semibold text-red-700 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
