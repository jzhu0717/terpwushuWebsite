import { useEffect, useMemo, useState } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "../../apiClient";

const ZONES = [
    { id: "morning-ring1", session: "morning", ring: "ring1" },
    { id: "morning-ring2", session: "morning", ring: "ring2" },
    { id: "afternoon-ring1", session: "afternoon", ring: "ring1" },
    { id: "afternoon-ring2", session: "afternoon", ring: "ring2" },
];

const ZONE_SHORT_LABELS = {
    "morning-ring1": "AM · Ring 1",
    "morning-ring2": "AM · Ring 2",
    "afternoon-ring1": "PM · Ring 1",
    "afternoon-ring2": "PM · Ring 2",
};

function sessionsToZones(sessions) {
    const zones = {};
    for (const z of ZONES) {
        zones[z.id] = sessions?.[z.session]?.[z.ring] || [];
    }
    return zones;
}

function zonesToSessions(zones) {
    const sessions = { morning: { ring1: [], ring2: [] }, afternoon: { ring1: [], ring2: [] } };
    for (const z of ZONES) {
        sessions[z.session][z.ring] = zones[z.id] || [];
    }
    return sessions;
}

function zoneIdOfBlock(zones, blockKey) {
    for (const zoneId of Object.keys(zones)) {
        if (zones[zoneId].some((b) => b.key === blockKey)) return zoneId;
    }
    return null;
}

function Competitor({ id, name, highlighted }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        data: { type: "competitor" },
    });
    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.5 : 1,
                padding: "0.3rem 0.6rem",
                fontSize: "12.5px",
                cursor: "grab",
                background: highlighted ? "#FEF3C7" : "#fff",
                borderBottom: "1px solid #e5e5e5",
            }}
        >
            {name}
        </div>
    );
}

function EventBlock({ block, highlightedIds, currentZoneId, onMoveToZone }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: block.key,
        data: { type: "block" },
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.6 : 1,
                background: "#fff",
                border: "1px solid #999",
                marginBottom: "0.5rem",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    background: "#f0f0f0",
                    color: "#111",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    padding: "0.3rem 0.5rem",
                    borderBottom: "1px solid #999",
                }}
            >
                <span
                    {...attributes}
                    {...listeners}
                    style={{ cursor: "grab", color: "#888", fontSize: "13px", touchAction: "none", flexShrink: 0 }}
                    title="Drag to reorder"
                >
                    ⠿
                </span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {block.displayLabel} <span style={{ opacity: 0.6, fontWeight: 400 }}>({block.competitors.length})</span>
                </span>
                <select
                    value={currentZoneId}
                    onChange={(e) => onMoveToZone(block.key, e.target.value)}
                    onPointerDown={(e) => e.stopPropagation()}
                    title="Move to session/ring"
                    style={{
                        fontSize: "10.5px",
                        fontWeight: 600,
                        padding: "1px 3px",
                        border: "1px solid #bbb",
                        borderRadius: "3px",
                        background: "#fff",
                        color: "#333",
                        cursor: "pointer",
                        flexShrink: 0,
                    }}
                >
                    {ZONES.map((z) => (
                        <option key={z.id} value={z.id}>
                            {ZONE_SHORT_LABELS[z.id]}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <SortableContext items={block.competitors.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    {block.competitors.map((c) => (
                        <Competitor key={c.id} id={c.id} name={c.name} highlighted={highlightedIds.has(c.id)} />
                    ))}
                    {block.competitors.length === 0 && (
                        <div className="text-xs text-gray-400 italic p-1.5">No competitors</div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}

function Zone({ zoneId, title, blocks, highlightedIds, onMoveToZone }) {
    const { setNodeRef } = useDroppable({ id: zoneId, data: { type: "zone" } });
    return (
        <div className="flex-1 min-w-[280px]">
            <h4 className="text-sm font-bold text-gray-800 mb-2">{title}</h4>
            <div ref={setNodeRef} style={{ minHeight: "80px", background: "#fafafa", borderRadius: "8px", padding: "0.5rem" }}>
                <SortableContext items={blocks.map((b) => b.key)} strategy={verticalListSortingStrategy}>
                    {blocks.map((block) => (
                        <EventBlock
                            key={block.key}
                            block={block}
                            highlightedIds={highlightedIds}
                            currentZoneId={zoneId}
                            onMoveToZone={onMoveToZone}
                        />
                    ))}
                    {blocks.length === 0 && <div className="text-xs text-gray-400 italic p-2">No events</div>}
                </SortableContext>
            </div>
        </div>
    );
}

export default function EventBuilder() {
    const [zones, setZones] = useState(() => Object.fromEntries(ZONES.map((z) => [z.id, []])));
    const [ignoreHighlightNames, setIgnoreHighlightNames] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    useEffect(() => {
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            const data = await api.get("/event-order");
            setZones(sessionsToZones(data.sessions));
            setIgnoreHighlightNames((data.ignoreHighlightNames || []).join(", "));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const saveOrder = async (nextZones, nextIgnoreNames) => {
        setSaving(true);
        try {
            await api.put("/event-order", {
                sessions: zonesToSessions(nextZones),
                ignoreHighlightNames: nextIgnoreNames
                    .split(/[,\n]/)
                    .map((n) => n.trim())
                    .filter(Boolean),
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleIgnoreNamesBlur = () => {
        saveOrder(zones, ignoreHighlightNames);
    };
    const moveBlockToZone = (blockKey, destZoneId) => {
        setZones((prevZones) => {
            const sourceZoneId = zoneIdOfBlock(prevZones, blockKey);
            if (!sourceZoneId || sourceZoneId === destZoneId) return prevZones;

            const nextZones = { ...prevZones };
            const sourceBlocks = [...nextZones[sourceZoneId]];
            const idx = sourceBlocks.findIndex((b) => b.key === blockKey);
            if (idx === -1) return prevZones;
            const [moved] = sourceBlocks.splice(idx, 1);

            nextZones[sourceZoneId] = sourceBlocks;
            nextZones[destZoneId] = [...nextZones[destZoneId], moved];

            saveOrder(nextZones, ignoreHighlightNames);
            return nextZones;
        });
    };

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const type = active.data.current?.type;

        setZones((prevZones) => {
            let nextZones = prevZones;

            if (type === "block") {
                const sourceZoneId = zoneIdOfBlock(prevZones, active.id);
                const overIsZone = ZONES.some((z) => z.id === over.id);
                const destZoneId = overIsZone ? over.id : zoneIdOfBlock(prevZones, over.id);
                if (!sourceZoneId || !destZoneId) return prevZones;

                nextZones = { ...prevZones };
                const sourceBlocks = [...nextZones[sourceZoneId]];
                const activeIndex = sourceBlocks.findIndex((b) => b.key === active.id);
                const [moved] = sourceBlocks.splice(activeIndex, 1);

                if (sourceZoneId === destZoneId) {
                    const overIndex = sourceBlocks.findIndex((b) => b.key === over.id);
                    sourceBlocks.splice(overIndex < 0 ? sourceBlocks.length : overIndex, 0, moved);
                    nextZones[sourceZoneId] = sourceBlocks;
                } else {
                    const destBlocks = [...nextZones[destZoneId]];
                    const overIndex = overIsZone ? destBlocks.length : destBlocks.findIndex((b) => b.key === over.id);
                    destBlocks.splice(overIndex < 0 ? destBlocks.length : overIndex, 0, moved);
                    nextZones[sourceZoneId] = sourceBlocks;
                    nextZones[destZoneId] = destBlocks;
                }
            } else if (type === "competitor") {
     
                const zoneId = Object.keys(prevZones).find((zid) =>
                    prevZones[zid].some((b) => b.competitors.some((c) => c.id === active.id))
                );
                if (!zoneId) return prevZones;
                nextZones = { ...prevZones };
                nextZones[zoneId] = nextZones[zoneId].map((block) => {
                    const activeIndex = block.competitors.findIndex((c) => c.id === active.id);
                    const overIndex = block.competitors.findIndex((c) => c.id === over.id);
                    if (activeIndex === -1 || overIndex === -1) return block;
                    return { ...block, competitors: arrayMove(block.competitors, activeIndex, overIndex) };
                });
            }

            saveOrder(nextZones, ignoreHighlightNames);
            return nextZones;
        });
    };

    // Yellow highlight: competitor appears in at least one Ring 1 block AND at least one
    // Ring 2 block (any session), unless their name is in the ignore list.
    const highlightedIds = useMemo(() => {
        const ring1Ids = new Set();
        const ring2Ids = new Set();
        const namesById = new Map();
        for (const z of ZONES) {
            const target = z.ring === "ring1" ? ring1Ids : ring2Ids;
            for (const block of zones[z.id] || []) {
                for (const c of block.competitors) {
                    target.add(c.id);
                    namesById.set(c.id, c.name);
                }
            }
        }
        const ignoreSet = new Set(
            ignoreHighlightNames.split(/[,\n]/).map((n) => n.trim().toLowerCase()).filter(Boolean)
        );
        const result = new Set();
        for (const id of ring1Ids) {
            if (ring2Ids.has(id) && !ignoreSet.has((namesById.get(id) || "").toLowerCase())) {
                result.add(id);
            }
        }
        return result;
    }, [zones, ignoreHighlightNames]);

    return (
        <div
            className="min-h-screen"
            style={{
                background:
                    "linear-gradient(to right, #611313 0%, #a12222 6%, #e58e8e 18%, #E8C5C5 35%, #E8C5C5 65%, #e58e8e 82%, #a12222 94%, #611313 100%)",
            }}
        >
            <div className="flex justify-center pt-8 pb-2">
                <span style={{ letterSpacing: "0.2em", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "#7A1A1A" }}>
                    Admin Panel
                </span>
            </div>

            <div className="max-w-[95vw] mx-auto bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-4">
                    <div />
                    <div className="text-center">
                        <h3 className="text-xl font-extrabold text-[#611313]">Event Order</h3>
                        <p className="text-xs text-gray-500">
                            <strong>WARNING: THIS IS NOT A COLLABORATION TOOL! READ THE WINNING GUIDE BEFORE USING.</strong>
                            <br></br>Having multiple sumultaneous editors will corrupt the event order
                            <br></br><strong>HOW TO USE:</strong> Drag event names to reorder events. Drag names to reorder competitors in each event.
                            <br></br><strong>BE CAREFUL WHEN SCROLLING ON MOBILE.</strong> You might unintentionally move names/events.
                            <br></br>Changes are saved automatically. {saving && "Saving..."}</p>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                        <a href="/admin/event-order-print" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-red-700 underline">
                            Printable Event Order
                        </a>
                        <a href="/api/event-order/export?ring=1" className="bg-[#611313] hover:bg-[#801b1b] text-white font-bold text-xs px-3 py-2 rounded shadow transition-all">
                            Export Ring 1 (.xlsx)
                        </a>
                        <a href="/api/event-order/export?ring=2" className="bg-[#611313] hover:bg-[#801b1b] text-white font-bold text-xs px-3 py-2 rounded shadow transition-all">
                            Export Ring 2 (.xlsx)
                        </a>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
                    <span className="flex items-center gap-1.5">
                        <span style={{ width: "14px", height: "14px", background: "#FEF3C7", border: "1px solid #e5e5e5", display: "inline-block", borderRadius: "3px" }} />
                        Yellow: Competitors have events in BOTH Ring 1 and Ring 2.
                    </span>
                </div>

                <div className="mb-6">
                    <label className="text-xs font-bold text-gray-700 uppercase">Ignore highlights for the following names</label>
                    <input
                        type="text"
                        value={ignoreHighlightNames}
                        onChange={(e) => setIgnoreHighlightNames(e.target.value)}
                        onBlur={handleIgnoreNamesBlur}
                        placeholder="Comma-separated names..."
                        className="p-2 border rounded text-sm w-full mt-1"
                    />
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-sm">{error}</div>
                )}

                {loading ? (
                    <p className="text-center text-sm text-gray-500 py-8">Loading event order...</p>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <div className="flex flex-col gap-6">
                            <div>
                                <h3 className="text-base font-extrabold text-[#611313] mb-2 text-center">Morning</h3>
                                <div className="flex gap-4 flex-wrap">
                                    <Zone zoneId="morning-ring1" title="Ring 1 (Purple Mat)" blocks={zones["morning-ring1"]} highlightedIds={highlightedIds} onMoveToZone={moveBlockToZone} />
                                    <Zone zoneId="morning-ring2" title="Ring 2 (Blue Mat)" blocks={zones["morning-ring2"]} highlightedIds={highlightedIds} onMoveToZone={moveBlockToZone} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-[#611313] mb-2 text-center">After Lunch</h3>
                                <div className="flex gap-4 flex-wrap">
                                    <Zone zoneId="afternoon-ring1" title="Ring 1 (Purple Mat)" blocks={zones["afternoon-ring1"]} highlightedIds={highlightedIds} onMoveToZone={moveBlockToZone} />
                                    <Zone zoneId="afternoon-ring2" title="Ring 2 (Blue Mat)" blocks={zones["afternoon-ring2"]} highlightedIds={highlightedIds} onMoveToZone={moveBlockToZone} />
                                </div>
                            </div>
                        </div>
                    </DndContext>
                )}
            </div>
        </div>
    );
}
