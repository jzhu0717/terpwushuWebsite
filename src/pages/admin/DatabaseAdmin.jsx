import { useState, useEffect } from "react";
import { api } from "../../apiClient";

const CONFIRM_PHRASE = "CONFIRM";

function defaultFileName() {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    return `uwg_export_${stamp}`;
}

function formatBytes(bytes) {
    if (!bytes) return "0 KB";
    return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function DatabaseAdmin() {
    const [exportChecked, setExportChecked] = useState(false);
    const [fileName, setFileName] = useState(defaultFileName);

    const [importChecked, setImportChecked] = useState(false);
    const [backups, setBackups] = useState([]);
    const [loadingBackups, setLoadingBackups] = useState(true);
    const [selectedBackup, setSelectedBackup] = useState("");

    const [exportWaiversChecked, setExportWaiversChecked] = useState(false);

    const [deleteAthletesEvents, setDeleteAthletesEvents] = useState(false);
    const [deleteEventOrder, setDeleteEventOrder] = useState(false);
    const [deleteWaivers, setDeleteWaivers] = useState(false);

    const [confirmText, setConfirmText] = useState("");
    const [executing, setExecuting] = useState(false);
    const [error, setError] = useState("");
    const [results, setResults] = useState([]);

    const needsConfirmation = importChecked || deleteAthletesEvents || deleteEventOrder || deleteWaivers;
    const anyActionSelected =
        exportChecked || importChecked || exportWaiversChecked || deleteAthletesEvents || deleteEventOrder || deleteWaivers;

    const fetchBackups = async () => {
        try {
            setLoadingBackups(true);
            const data = await api.get("/db-admin/backups");
            setBackups(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingBackups(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const handleDownload = async (fname) => {
        try {
            const { url } = await api.get(`/db-admin/backups/${encodeURIComponent(fname)}/download`);
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleExecute = async () => {
        setError("");
        setResults([]);

        if (!anyActionSelected) {
            setError("Select at least one action.");
            return;
        }
        if (importChecked && !selectedBackup) {
            setError("Select which backup to import.");
            return;
        }
        if (needsConfirmation && confirmText.trim().toUpperCase() !== CONFIRM_PHRASE) {
            setError(`This includes a destructive action. Type "${CONFIRM_PHRASE}" in the confirmation box to proceed.`);
            return;
        }

        setExecuting(true);
        const newResults = [];

        if (exportChecked) {
            try {
                const res = await api.post("/db-admin/export", { fileName });
                newResults.push({ label: `Exported database to ${res.fileName}`, success: true });
            } catch (err) {
                newResults.push({ label: "Export Entire Database", success: false, message: err.message });
            }
        }

        if (exportWaiversChecked) {
            try {
                const res = await api.post("/db-admin/export-waivers", {});
                newResults.push({ label: `Exported ${res.fileCount} waiver file(s)`, success: true, downloadUrl: res.url });
            } catch (err) {
                newResults.push({ label: "Export Waivers", success: false, message: err.message });
            }
        }

        const tablesToDelete = [
            deleteAthletesEvents && "athletes_events",
            deleteEventOrder && "event_order",
            deleteWaivers && "waivers",
        ].filter(Boolean);
        if (tablesToDelete.length > 0) {
            try {
                await api.post("/db-admin/delete-tables", { tables: tablesToDelete });
                newResults.push({ label: `Deleted: ${tablesToDelete.join(", ")}`, success: true });
            } catch (err) {
                newResults.push({ label: "Delete Tables", success: false, message: err.message });
            }
        }

        if (importChecked) {
            try {
                await api.post("/db-admin/import", { fileName: selectedBackup });
                newResults.push({ label: `Imported from ${selectedBackup}`, success: true });
            } catch (err) {
                newResults.push({ label: "Import Database", success: false, message: err.message });
            }
        }

        setResults(newResults);
        setExecuting(false);
        setConfirmText("");
        setFileName(defaultFileName());
        fetchBackups();
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

            <div className="max-w-3xl mx-auto bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Database Admin</h2>
                    <p className="mt-1 text-sm font-bold text-red-800 uppercase tracking-wide">
                        For the bold and daring - backup, restore, and delete database tables
                    </p>
                </div>

                {error && (
                    <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-sm">{error}</div>
                )}

                {results.length > 0 && (
                    <div className="flex flex-col gap-1">
                        {results.map((r, i) => (
                            <div
                                key={i}
                                className={`p-2 rounded-md text-sm border ${
                                    r.success
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                        : "bg-rose-50 border-rose-200 text-rose-800"
                                }`}
                            >
                                {r.success ? "✓ " : "✗ "}
                                {r.label}
                                {r.message && ` — ${r.message}`}
                                {r.downloadUrl && (
                                    <>
                                        {" "}
                                        <a href={r.downloadUrl} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                                            Download
                                        </a>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-sm font-semibold text-gray-700">Select an action:</p>

                {/* Export */}
                <div className="border border-zinc-200 rounded-xl p-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-800 cursor-pointer">
                        <input type="checkbox" checked={exportChecked} onChange={(e) => setExportChecked(e.target.checked)} />
                        Export Entire Database
                    </label>
                    <div className="mt-2 flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">File Name:</label>
                        <div className="flex items-center gap-1 text-sm">
                            <input
                                type="text"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                disabled={!exportChecked}
                                className="p-2 border rounded text-sm w-full disabled:bg-gray-100 disabled:text-gray-400"
                            />
                            <span className="text-gray-500">.json</span>
                        </div>
                        <p className="text-xs text-gray-500 italic">
                            Note: Duplicate file names will be overwritten. The exported file will appear in the Import Database list below.
                        </p>
                    </div>
                </div>

                {/* Import */}
                <div className="border border-zinc-200 rounded-xl p-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-800 cursor-pointer">
                        <input type="checkbox" checked={importChecked} onChange={(e) => setImportChecked(e.target.checked)} />
                        Import Database
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                        Restores a previous export
                    </p>
                    <div className="mt-2 flex flex-col gap-1 max-h-56 overflow-y-auto border border-gray-100 rounded-md">
                        {loadingBackups ? (
                            <p className="text-xs text-gray-400 p-2">Loading backups...</p>
                        ) : backups.length === 0 ? (
                            <p className="text-xs text-gray-400 italic p-2">No databases yet.</p>
                        ) : (
                            backups.map((b) => (
                                <label
                                    key={b.key}
                                    className={`flex items-center justify-between gap-2 text-sm px-2 py-1.5 border-b border-gray-50 last:border-0 ${
                                        importChecked ? "cursor-pointer hover:bg-gray-50" : "opacity-50"
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="importSelection"
                                            disabled={!importChecked}
                                            checked={selectedBackup === b.fileName}
                                            onChange={() => setSelectedBackup(b.fileName)}
                                        />
                                        {b.fileName} <span className="text-xs text-gray-400">({formatBytes(b.size)})</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleDownload(b.fileName)}
                                        className="text-xs font-semibold text-red-700 underline hover:text-red-900"
                                    >
                                        Download
                                    </button>
                                </label>
                            ))
                        )}
                    </div>
                </div>

                {/* Export Waivers */}
                <div className="border border-zinc-200 rounded-xl p-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-800 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={exportWaiversChecked}
                            onChange={(e) => setExportWaiversChecked(e.target.checked)}
                        />
                        Export Waivers
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                        Zips signed waiver PDFs and gives a download link
                    </p>
                </div>

                {/* Delete Tables */}
                <div className="border border-red-200 bg-red-50/40 rounded-xl p-4">
                    <p className="text-sm font-bold text-red-900">Delete Tables</p>
                    <p className="text-xs text-red-800 mb-2">Permanently clears the selected data</p>
                    <div className="flex flex-col gap-1.5">
                        <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                            <input type="checkbox" checked={deleteAthletesEvents} onChange={(e) => setDeleteAthletesEvents(e.target.checked)} />
                            Athletes/Events (registrations and their event sign-ups)
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                            <input type="checkbox" checked={deleteEventOrder} onChange={(e) => setDeleteEventOrder(e.target.checked)} />
                            Event Order
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                            <input type="checkbox" checked={deleteWaivers} onChange={(e) => setDeleteWaivers(e.target.checked)} />
                            Waivers
                        </label>
                    </div>
                </div>

                {needsConfirmation && (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-red-800">
                            Type "{CONFIRM_PHRASE}" to confirm:
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={CONFIRM_PHRASE}
                            className="p-2 border border-red-300 rounded text-sm w-full max-w-xs"
                        />
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleExecute}
                    disabled={executing}
                    className="self-start bg-[#611313] hover:bg-[#801b1b] disabled:opacity-40 text-white font-bold text-sm px-6 py-2.5 rounded shadow transition-all"
                >
                    {executing ? "Executing..." : "Execute"}
                </button>
            </div>
        </div>
    );
}
