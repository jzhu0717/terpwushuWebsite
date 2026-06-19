import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Officers() {
    const [groupedOfficers, setGroupedOfficers] = useState({});
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const fetchOfficers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('officers')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                setGroupedOfficers({});
                return;
            }

            const sortedData = data.sort((a, b) => {
                const yearA = a.year.includes('-') ? parseInt(a.year.split('-')[0]) : parseInt(a.year);
                const yearB = b.year.includes('-') ? parseInt(b.year.split('-')[0]) : parseInt(b.year);
                return yearB - yearA;
            });

            const grouped = sortedData.reduce((acc, officer) => {
                if (!acc[officer.year]) acc[officer.year] = [];
                acc[officer.year].push(officer);
                return acc;
            }, {});

            setGroupedOfficers(grouped);
        } catch (err) {
            console.error("Error loading roster logs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOfficers();
    }, []);

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

            <div
                className="flex flex-col items-center px-4 py-12"
                style={{ gap: "2.5rem" }}
            >
                <div
                    style={{
                        maxWidth: "680px",
                        width: "100%",
                        textAlign: "center",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "clamp(2rem, 5vw, 3.25rem)",
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                            lineHeight: 1.1,
                            color: "#1A1A1A",
                            marginBottom: "1rem",
                        }}
                    >
                        Officers
                    </h1>
                </div>              

                {loading ? (
                    <p className="text-gray-800 font-medium bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
                        Retrieving club records...
                    </p>
                ) : Object.keys(groupedOfficers).length === 0 ? (
                    <p className="text-gray-700 italic">No historical officer records found.</p>
                ) : (
                    Object.keys(groupedOfficers).map((yearKey) => (
                        <div key={yearKey} className="w-full flex flex-col items-center" style={{ gap: "1rem", marginBottom: "2rem" }}>
                            <p
                                style={{
                                    fontSize: "1.25rem",
                                    lineHeight: 1.75,
                                    color: "#444",
                                    maxWidth: "560px",
                                    margin: "0 auto",
                                    fontWeight: 800,
                                    borderBottom: "2px solid rgba(139, 26, 26, 0.3)",
                                    paddingBottom: "2px"
                                }}
                            >
                                {yearKey}
                            </p>
                            
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                    justifyContent: "center", 
                                    justifyItems: "center",
                                    gap: "1.5rem",
                                    maxWidth: "860px",
                                    width: "100%",
                                }}
                            >
                                {groupedOfficers[yearKey].map((officer) => (
                                    <div
                                        key={officer.id || `${officer.year}-${officer.position}`}
                                        style={{
                                            background: "rgba(255,255,255,0.82)",
                                            backdropFilter: "blur(6px)",
                                            border: "1px solid rgba(192, 57, 43, 0.15)",
                                            borderRadius: "12px",
                                            padding: "1.25rem 1rem",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            textAlign: "center",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                            width: "100%"
                                        }}
                                    >
                                        <h2
                                            style={{
                                                fontSize: "0.85rem",
                                                fontWeight: 700,
                                                color: "#8B1A1A",
                                                marginBottom: "0.75rem",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.06em",
                                            }}
                                        >
                                            {officer.position}
                                        </h2>

                                        <img
                                            src={officer.image_url}
                                            alt={`${officer.name} - ${officer.position} portrait`}
                                            style={{
                                                width: "100%",
                                                maxWidth: "300px",    
                                                height: "auto",       
                                                borderRadius: "8px",
                                                marginBottom: "0.75rem",
                                            }}
                                        />

                                        <p
                                            style={{
                                                fontSize: "0.95rem",
                                                color: "#222",
                                                fontWeight: "600",
                                                margin: 0,
                                            }}
                                        >
                                            {officer.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}