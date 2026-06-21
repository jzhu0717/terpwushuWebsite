import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom"; 
import { supabase } from '../../supabaseClient';

export default function EventOrder() {
    
    useEffect(() => {
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }, 100);
    }, []);
    
    return (
        <div
            className="min-h-screen"
            style={{
                background:
                        "linear-gradient(to right, #611313 0%, #a12222 6%, #e58e8e 18%, #E8C5C5 35%, #E8C5C5 65%, #e58e8e 82%, #a12222 94%, #611313 100%)",
            }}
            >
            {/* Eyebrow / nav spacer */}
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
        </div>
    );
}