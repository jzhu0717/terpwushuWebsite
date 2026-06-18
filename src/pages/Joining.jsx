import { useState, useEffect, useRef } from "react";
import { supabase } from '../supabaseClient'; 

const SLIDESHOW_IMAGES = [
    "/joining/chris.jpg",
    "/joining/BryanJoshDavid15.jpg",
    "/joining/rachava.jpg",
    "/joining/sumner.jpg",
    "/joining/fan.jpg",
    "/joining/bryaaronrobert.jpg",
    "/joining/sherryallen.jpg",
];

const DAYS_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Joining() {
    const month = new Date().getMonth(); // 0 = Jan, 6 = July
    const semester = month >= 6 ? "FALL" : "SPRING";
    const year = new Date().getFullYear();

    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef(null);
    
    const [practices, setPractices] = useState([]);
    const [loadingPractices, setLoadingPractices] = useState(true);
    
    const resetTimeout = () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
    };
      
    useEffect(() => {
        if (SLIDESHOW_IMAGES.length <= 1) return;
    
        timeoutRef.current = setTimeout(
          () =>
            setCurrentIndex((prevIndex) =>
              prevIndex === SLIDESHOW_IMAGES.length - 1 ? 0 : prevIndex + 1
            ),
          2500 // Slides change every 2.5 seconds
        );
    
        return () => {
          resetTimeout();
        };
    }, [currentIndex]);
    
    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? SLIDESHOW_IMAGES.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };
    
    const nextSlide = () => {
        const isLastSlide = currentIndex === SLIDESHOW_IMAGES.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    useEffect(() => {
        async function fetchActivePractices() {
            try {
                setLoadingPractices(true);
                const { data, error } = await supabase
                    .from('practices')
                    .select('*');

                if (error) throw error;

                if (data) {
                    const sortedData = data.sort((a, b) => 
                        DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day)
                    );
                    setPractices(sortedData);
                }
            } catch (err) {
                console.error("Error loading schedule into signup page:", err);
            } finally {
                setLoadingPractices(false);
            }
        }

        fetchActivePractices();
    }, []);

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

            {/* slideshow */}
            <div className="flex justify-center px-4 pb-0">
                <div
                  style={{
                    width: "100%",
                    maxWidth: "860px",
                    aspectRatio: "16 / 7",
                    background: "rgba(139, 26, 26, 0.08)",
                    border: "1px solid rgba(192, 57, 43, 0.2)",
                    borderRadius: "12px",
                    overflow: "hidden", 
                    position: "relative",
                  }}
                  className="group"
                >
                  {SLIDESHOW_IMAGES.length > 0 ? (
                    <>
                      {/* Image Track */}
                      <div
                        style={{
                          display: "flex",
                          width: "100%",
                          height: "100%",
                          transform: `translateX(-${currentIndex * 100}%)`,
                          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        {SLIDESHOW_IMAGES.map((src, index) => (
                          <div
                            key={src}
                            style={{
                              minWidth: "100%",
                              height: "100%",
                            }}
                          >
                            <img
                              src={src}
                              alt={`Wushu slide ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Left Arrow Button */}
                      <button
                        onClick={prevSlide}
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "16px",
                          transform: "translateY(-50%)",
                          background: "rgba(0, 0, 0, 0.3)",
                          backdropFilter: "blur(4px)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "background 0.2s, opacity 0.2s",
                        }}
                        className="opacity-70 hover:opacity-100 hover:bg-black/50"
                        aria-label="Previous slide"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>

                      {/* Right Arrow Button */}
                      <button
                        onClick={nextSlide}
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: "16px",
                          transform: "translateY(-50%)",
                          background: "rgba(0, 0, 0, 0.3)",
                          backdropFilter: "blur(4px)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "background 0.2s, opacity 0.2s",
                        }}
                        className="opacity-70 hover:opacity-100 hover:bg-black/50"
                        aria-label="Next slide"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>

                      {/* Bottom Navigation Dots */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "16px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          display: "flex",
                          gap: "8px",
                          background: "rgba(0, 0, 0, 0.2)",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {SLIDESHOW_IMAGES.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              background: currentIndex === index ? "#fff" : "rgba(255, 255, 255, 0.4)",
                              transition: "all 0.3s ease",
                              transform: currentIndex === index ? "scale(1.2)" : "scale(1)",
                            }}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-red-700">
                      No images found. Add paths to SLIDESHOW_IMAGES.
                    </div>
                  )}
                </div>
            </div>
                
            {/* Main content */}
            <div
                className="flex flex-col items-center px-4 py-12"
                style={{ gap: "2.5rem" }}
            >
                {/* Primary heading + intro */}
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
                        Joining TerpWushu
                    </h1>
                    <div
                        style={{
                            fontSize: "1rem",
                            lineHeight: 1.75,
                            color: "#444",
                            maxWidth: "100%",
                            margin: "0 auto",
                            textAlign: "left",
                        }}
                    >
                        <strong>There is no fee to join, training is completely free.</strong> However you must be an officially enrolled student (undergraduate and graduate), faculty/staff, or a member of the UMCP Alumni Association in order to practice with us. If you're eligible, please attend any of our scheduled practices and then follow the instructions below to register as a club member!
                        <br /><br />
                        <strong>Steps to Register as a Club Member:</strong>
                        <br /><br />
                        <ol style={{ paddingLeft: "1.25rem" }}>
                            <li>1. Register with RecWell via {" "} <a href="http://www.imleagues.com/spa/club/4395e0c781af4905a4088a9561509399/home" target="_blank" rel="noreferrer" style={{ color: "#1A73E8", textDecoration: "underline" }}>IMLeagues</a></li>
                            <em style={{ fontSize: "0.85rem" , paddingLeft: "1.25rem"}}>- This includes a short concussion quiz, and a waiver. Confirm you are on the roster afterwards.</em>
                            
                            <li>2. Register with {" "} <a href="https://terplink.umd.edu/organization/terp-wushu-club" target="_blank" rel="noreferrer" style={{ color: "#1A73E8", textDecoration: "underline" }}>TerpLink</a>: Sign in with your UID first.</li>
                            <li>3. Join the Terpwushu Discord (talk to one of the officers!) </li>
                            <br />
                            <li><em>All members need to complete steps 1 and 2 every new academic year!</em></li>
                        </ol>
                        <br />
                        <strong>Times and Locations - {semester} {year}</strong>
                    </div>

                    <table
                        style={{
                            marginTop: "1rem",
                            width: "100%",
                            maxWidth: "560px",
                            borderCollapse: "collapse",
                            fontSize: "0.95rem",
                            color: "#333",
                            marginInline: "auto"
                        }}
                    >
                        <thead>
                            <tr style={{ borderBottom: "2px solid #C0392B" }}>
                                <th style={{ textAlign: "center", padding: "0.5rem 0.75rem", color: "#7A1A1A" }}>Day</th>
                                <th style={{ textAlign: "center", padding: "0.5rem 0.75rem", color: "#7A1A1A" }}>Time</th>
                                <th style={{ textAlign: "center", padding: "0.5rem 0.75rem", color: "#7A1A1A" }}>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingPractices ? (
                                <tr>
                                    <td colSpan="3" style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                                        Loading current practice schedule...
                                    </td>
                                </tr>
                            ) : practices.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{ padding: "2rem", textAlign: "center", color: "#666", fontStyle: "italic" }}>
                                        No active practices scheduled right now. 
                                    </td>
                                </tr>
                            ) : (
                                practices.map((row, i) => (
                                    <tr
                                        key={row.id || row.day}
                                        style={{
                                            borderBottom: "1px solid #E8C5C5",
                                            background: i % 2 === 1 ? "rgba(139, 26, 26, 0.04)" : "transparent",
                                        }}
                                    >
                                        <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>{row.day}</td>
                                        {/* Note: changed row.time to row.time_range to match your DB schema */}
                                        <td style={{ padding: "0.5rem 0.75rem" }}>{row.time_range}</td>
                                        <td style={{ padding: "0.5rem 0.75rem" }}>{row.location}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "1.5rem",
                            justifyContent: "center",
                            marginTop: "1.5rem",
                            width: "100%",
                            maxWidth: "860px",
                        }}
                    >
                        <div style={{ flex: "1 1 320px", maxWidth: "400px", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontWeight: 700, color: "#7A1A1A", fontSize: "1rem" }}>
                                SPH
                            </span>
                            <iframe
                                title="SPH Location map"
                                src="https://maps.google.com/maps?q=School%20of%20Public%20Health%20UMD&t=&z=13&ie=UTF8&iwloc=&output=embed"
                                width="400"
                                height="300"
                                style={{ border: 0, borderRadius: "12px", width: "100%", maxWidth: "400px" }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                        <div style={{ flex: "1 1 320px", maxWidth: "400px", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontWeight: 700, color: "#7A1A1A", fontSize: "1rem" }}>
                                Golf Bubble
                            </span>
                            <iframe
                                title="Bubble Location map"
                                src="https://maps.google.com/maps?q=University%20of%20Maryland%20Golf%20Course&t=&z=13&ie=UTF8&iwloc=&output=embed"
                                width="400"
                                height="300"
                                style={{ border: 0, borderRadius: "12px", width: "100%", maxWidth: "400px" }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            fontSize: "1rem",
                            lineHeight: 1.75,
                            color: "#444",
                            maxWidth: "100%",
                            margin: "0 auto",
                            textAlign: "left",
                        }}
                    >
                        <br />
                        If you plan on driving to practice, we recommend parking in the Terrapin Trail Garage. Parking here is free after 4PM on weekdays and all-day on weekends.
                        <br /><br />
                        <strong>Practices</strong>
                        <br />
                        Most practices are two hours long and have the following structure:
                        <ul style={{ paddingLeft: "1.25rem" }}>
                            <li><em>20min:</em> Warm-ups and stretching</li>
                            <li><em>40min:</em> Line drills consisting of basics, combos, and jumpkicks</li>
                            <li><em>50min:</em> Forms rotations</li>
                            <li><em>10min:</em> Announcements, conditioning and/or cool-down stretching</li>
                        </ul>
                        <br />
                        Warm-ups, conditioning, and stretching are group activities done with everyone attending practice. For drills and forms, club members are grouped together based on skill level (beginner, intermediate, and advanced) and style (changquan, nanquan).
                        <br /><br />
                        Practice structure may be altered depending on upcoming demos, competitions, or other club events.
                    </div>        
                </div>
            </div>
        </div>
    );
}