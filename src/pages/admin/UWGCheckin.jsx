import { useState, useEffect, useMemo } from "react";
import { api } from "../../apiClient";
import { MINOR_AGE_GROUPS, PAYMENT_METHODS } from "../../constants/registrationOptions";
import SignaturePad from "../../components/SignaturePad";

const CARD_STYLE = "max-w-4xl mx-auto bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm";
const SECTION_STYLE = "border border-zinc-200 rounded-xl p-4 sm:p-5";

function fullName(r) {
    return `${r.first_name} ${r.last_name}`;
}

export default function UWGCheckin() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [search, setSearch] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [paymentMethod, setPaymentMethod] = useState("");
    const [guardianName, setGuardianName] = useState("");
    const [signatureDataUrl, setSignatureDataUrl] = useState(null);
    const [signatureVersion, setSignatureVersion] = useState(0);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const data = await api.get("/registrations");
            setRegistrations(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const matches = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return [];
        return registrations
            .filter((r) => fullName(r).toLowerCase().includes(q))
            .sort((a, b) => fullName(a).localeCompare(fullName(b)))
            .slice(0, 8);
    }, [registrations, search]);

    const selected = registrations.find((r) => r.id === selectedId) || null;
    const isMinor = selected ? MINOR_AGE_GROUPS.has(selected.age_group) : false;

    const selectRegistration = (r) => {
        setSelectedId(r.id);
        setSearch(fullName(r));
        setDropdownOpen(false);
        setPaymentMethod(r.payment_method || "");
        setGuardianName(r.parent_guardian_name || "");
        setSignatureDataUrl(null);
        setSignatureVersion((v) => v + 1);
        setMessage("");
        setError("");
    };

    const patchSelected = (updates) => {
        setRegistrations((rows) => rows.map((r) => (r.id === selectedId ? { ...r, ...updates } : r)));
    };

    const handleDropEvent = async (eventId) => {
        const nextIds = (selected.events || []).map((e) => e.id).filter((id) => id !== eventId);
        if (nextIds.length === 0) {
            setError("Can't drop the last event — delete the registration from the Registrations tab instead if they're withdrawing entirely.");
            return;
        }
        setError("");
        setBusy(true);
        try {
            const { amount_due } = await api.put(`/registrations/${selectedId}/events`, { event_ids: nextIds });
            patchSelected({ events: (selected.events || []).filter((e) => e.id !== eventId), amount_due });
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const handleTogglePaid = async () => {
        setError("");
        if (selected.payment_status !== "paid" && !paymentMethod) {
            setError("Select a payment method before marking as paid.");
            return;
        }
        const nextStatus = selected.payment_status === "paid" ? "pending" : "paid";
        setBusy(true);
        try {
            await api.patch(`/registrations/${selectedId}`, {
                payment_status: nextStatus,
                ...(nextStatus === "paid" ? { payment_method: paymentMethod } : {}),
            });
            patchSelected({ payment_status: nextStatus, ...(nextStatus === "paid" ? { payment_method: paymentMethod } : {}) });
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const handleManualWaiverToggle = async () => {
        setError("");
        const nextValue = !selected.waiver_received;
        setBusy(true);
        try {
            await api.patch(`/registrations/${selectedId}`, { waiver_received: nextValue });
            patchSelected({ waiver_received: nextValue });
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const handleConfirmSignature = async () => {
        setError("");
        if (!signatureDataUrl) {
            setError("Please sign in the box before confirming.");
            return;
        }
        if (isMinor && !guardianName.trim()) {
            setError("Please enter the Parent/Guardian's name.");
            return;
        }
        setBusy(true);
        try {
            const result = await api.post(`/registrations/${selectedId}/waiver/checkin-sign`, {
                signatureDataUrl,
                parentGuardianName: isMinor ? guardianName.trim() : undefined,
            });
            patchSelected({
                waiver_received: true,
                waiver_pdf_key: result.waiver_pdf_key,
                parental_consent_required: result.parental_consent_required,
                parent_guardian_name: result.parent_guardian_name ?? selected.parent_guardian_name,
            });
            setSignatureDataUrl(null);
            setSignatureVersion((v) => v + 1);
            setMessage("Waiver signed and saved.");
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const handleViewWaiver = async () => {
        try {
            const { url } = await api.get(`/registrations/${selectedId}/waiver`);
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDone = async () => {
        setError("");
        setBusy(true);
        try {
            await api.patch(`/registrations/${selectedId}`, { checked_in: true });
            patchSelected({ checked_in: true });
            setMessage(`${fullName(selected)} checked in!`);
            setTimeout(() => {
                setSelectedId(null);
                setSearch("");
                setMessage("");
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
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

            <div className={`${CARD_STYLE} flex flex-col gap-6`}>
                <h2 className="text-2xl font-bold text-gray-800">Check-In Competitor</h2>

                <div className="relative max-w-md mx-auto">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Competitor Name:</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setSelectedId(null);
                            setDropdownOpen(true);
                        }}
                        onFocus={() => setDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                        placeholder={loading ? "Loading competitors..." : "Start typing a name..."}
                        disabled={loading}
                        className="w-full p-2 border rounded-md text-sm outline-none focus:border-[#611313]"
                    />
                    {dropdownOpen && matches.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full bg-white border border-zinc-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
                            {matches.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onMouseDown={() => selectRegistration(r)}
                                    className="block w-full text-left px-3 py-2 text-sm hover:bg-red-50"
                                >
                                    {fullName(r)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-sm">{error}</div>
                )}
                {message && (
                    <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">{message}</div>
                )}

                {selected && (
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-200 pb-3">
                            <h3 className="text-xl font-extrabold text-[#611313]">{fullName(selected)}</h3>
                            <span className="text-xs text-gray-500">
                                {selected.age_group} • {selected.experience_level} • {selected.collegiate_status}
                                {selected.checked_in && <span className="ml-2 text-emerald-700 font-semibold">✓ Already checked in</span>}
                            </span>
                        </div>

                        {/* Events */}
                        <div className={SECTION_STYLE}>
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Events</h4>
                            {(selected.events || []).length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No events on file.</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {selected.events.map((ev) => (
                                        <div key={ev.id} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                                            <span>{ev.name}</span>
                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => handleDropEvent(ev.id)}
                                                className="text-xs font-semibold text-red-700 hover:text-red-900 disabled:opacity-40"
                                            >
                                                Drop
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Payment */}
                        <div className={SECTION_STYLE}>
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Payment</h4>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="font-semibold">Amount Due: ${Number(selected.amount_due ?? 0).toFixed(2)}</span>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                        selected.payment_status === "paid"
                                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                            : "bg-amber-50 text-amber-800 border border-amber-200"
                                    }`}
                                >
                                    {selected.payment_status}
                                    {selected.payment_status === "paid" && selected.payment_method ? ` · ${selected.payment_method}` : ""}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                {selected.payment_status !== "paid" && (
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="p-2 border rounded text-sm bg-white"
                                    >
                                        <option value="">-- Payment method --</option>
                                        {PAYMENT_METHODS.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                )}
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selected.payment_status === "paid"}
                                        disabled={busy}
                                        onChange={handleTogglePaid}
                                    />
                                    Mark as Paid
                                </label>
                            </div>
                        </div>

                        {/* Waiver */}
                        <div className={SECTION_STYLE}>
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Waiver</h4>
                            <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                                <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                        selected.waiver_received
                                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                            : "bg-amber-50 text-amber-800 border border-amber-200"
                                    }`}
                                >
                                    {selected.waiver_received ? "Received" : "Not yet received"}
                                </span>
                                {selected.waiver_pdf_key && (
                                    <button type="button" onClick={handleViewWaiver} className="text-xs font-semibold text-red-700 underline hover:text-red-900">
                                        View Signed PDF
                                    </button>
                                )}
                            </div>

                            {!selected.waiver_received && (
                                <div className="flex flex-col gap-3">
                                    <p className="text-sm text-gray-600">
                                        {isMinor
                                            ? "This competitor is a minor — please have their parent/guardian read the Parental Release and Informed Consent Form and sign below."
                                            : "Please have the competitor read the Sport Clubs Release and Informed Consent Form and sign below."}
                                    </p>

                                    {isMinor && (
                                        <div className="flex flex-col gap-1 max-w-xs">
                                            <label className="text-xs font-bold text-gray-700">Parent/Guardian Name</label>
                                            <input
                                                type="text"
                                                value={guardianName}
                                                onChange={(e) => setGuardianName(e.target.value)}
                                                placeholder="Full name"
                                                className="p-2 border rounded text-sm"
                                            />
                                        </div>
                                    )}

                                    <div className="max-w-md">
                                        <SignaturePad key={signatureVersion} onChange={setSignatureDataUrl} />
                                    </div>

                                    <button
                                        type="button"
                                        disabled={busy}
                                        onClick={handleConfirmSignature}
                                        className="self-start bg-[#611313] hover:bg-[#801b1b] disabled:opacity-40 text-white font-bold text-sm px-4 py-2 rounded shadow transition-all"
                                    >
                                        Confirm Signature
                                    </button>

                                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer mt-1">
                                        <input type="checkbox" checked={false} disabled={busy} onChange={handleManualWaiverToggle} />
                                        Waiver already received another way (paper on file, etc.) — mark received without a signature
                                    </label>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            disabled={busy}
                            onClick={handleDone}
                            className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold text-lg py-3 rounded-lg shadow transition-all"
                        >
                            Confirm Check In
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
