import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom"; 
import { supabase } from '../supabaseClient';


const SLIDESHOW_IMAGES = [
  "/homepage/twCol2025.jpg",
  "/homepage/tianyi2026.jpg",
  "/homepage/twgroup1.jpg",
  "/homepage/robertspear.jpg",
  "/homepage/swordfish.jpg",
  "/homepage/jacket.jpg",
  "/homepage/collegiates2026_1.jpg",
  "/homepage/andrew.jpg",
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);
  const location = useLocation(); 

  useEffect(() => {
    const getLiveAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setAnnouncements(data);
        }
      } catch (err) {
        console.error("Failed to sync announcements:", err);
      } finally {
        setLoading(false);
      }
    };
    getLiveAnnouncements();
  }, []);

  useEffect(() => {
    if (location.hash === "#about") {
    const element = document.getElementById("about");
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  } else if (!location.hash) {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);
  }
  }, [location]);

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

      {/* Dynamic Slideshow */}
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
          className="group" // Adds tailwind group class for hover elements if desired
        >
          {SLIDESHOW_IMAGES.length > 0 ? (
            <>
              {/* Image Track (Handles the sliding mechanism) */}
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
            Welcome to TerpWushu
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              lineHeight: 1.75,
              color: "#444",
              maxWidth: "560px",
              margin: "0 auto",
            }}
          >
            Terpwushu is a sports club at the University of Maryland devoted to teaching and training of wushu at all levels.
          </p>
        </div>

        {/* Divider accent */}
        <div
          style={{
            width: "48px",
            height: "3px",
            background: "linear-gradient(to right, #C0392B, #E74C3C)",
            borderRadius: "2px",
          }}
        />

        {/* Announcements */}
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
            Announcements
          </h1>
          {/* announcement content here */}

            <div className="flex flex-col gap-4 w-full text-left">
            {loading ? (
              <p className="text-center text-sm text-red-800 animate-pulse">Syncing updates...</p>
            ) : announcements.length > 0 ? (
              announcements.map((post) => (
                <div
                  key={post.id}
                  style={{
                    background: "rgba(255,255,255,0.82)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(192, 57, 43, 0.15)",
                    borderRadius: "12px",
                    padding: "1.25rem 1.5rem",
                  }}
                  className="shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-baseline mb-2 gap-2 flex-wrap">
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#8B1A1A" }}>
                      {post.title}
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "#666", fontWeight: 500 }}>
                      By {post.author} • {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "#333", whiteSpace: "pre-wrap" }}>
                    {post.content}
                  </p>
                </div>
              ))
            ) : (
              <div 
                style={{ background: "rgba(255,255,255,0.4)", borderRadius: "12px", padding: "2rem" }}
                className="text-center text-sm text-red-900 border border-dashed border-red-900/20"
              >
                No announcements yet.
              </div>
            )}
          </div>






        </div>

        {/* Divider accent */}
        <div
          style={{
            width: "48px",
            height: "3px",
            background: "linear-gradient(to right, #C0392B, #E74C3C)",
            borderRadius: "2px",
          }}
        />

        {/* About section */}
        <div
          id="about"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
            maxWidth: "860px",
            width: "100%",
          }}
        >
          {[
            {
              heading: "About Us",
              body: (
                <>
                  Founded in 2001, TerpWushu is a University of Maryland sports club that is devoted to the teaching and training of wushu at all levels -- from beginner to advanced practitioners. Terpwushu is a competition-focused club that participates in tournaments nationwide as well as cultural performances and demonstrations. All members are encouraged to participate in these events regardless of experience or skill level. Our goal as a club is to expand wushu interest and knowledge as well as to help foster a strong intercollegiate wushu community.
                  <br /><br />
                  Here are some of the annual events that we host / participate in!
                  <ul style={{ textAlign: "center", paddingLeft: "1.25rem", marginTop: "0.5rem", fontSize:"0.8rem"}}>
                    <li>University Wushu Games</li>
                    <li>National Collegiate Wushu Tournament</li>
                    <li>East Coast Wushu Joint Practice</li>
                    <li>TASA TOT/Night Market</li>
                    <li>CSA Lunar Banquet</li>
                    <li>Tianyi Showcase</li>
                    <li>Terpwushu End of the Year Show</li>
                  </ul>
                </>
              ),
            },
            {
              heading: "Wushu",
              body: (
                <>
                  The term <em>wushu</em> is a encompasses all of Chinese martial arts, which is composed of an enormous range of martial styles and philosophies.  While wushu has developed sophisticated systems over its 2000 year history, it has recently gained international appeal in its "contemporary" form. <em>Contemporary wushu</em> refers to a conglomerate of many traditional styles and their transformation into a competitive sport with standardized rules and judging.  A more thorough definition can be found at {" "}
                  <a href="https://en.wikipedia.org/wiki/Wushu" target="_blank" rel="noreferrer" style={{ color: "#1A73E8", textDecoration: "underline" }}>
                  wikipedia.
                  </a>
                  <br /><br />
                  TerpWushu focuses on non-contact, contemporary wushu, which combines aspects of sport, performance art, and martial art.
                </>
              ),
            },
          ].map(({ heading, body }) => (
            <div
              key={heading}
              style={{
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(192, 57, 43, 0.15)",
                borderRadius: "12px",
                padding: "1.5rem 1.25rem",
                transition: "box-shadow 0.15s",
              }}
            >
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#8B1A1A",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {heading}
              </h2>
              <div style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: "#333" }}>
                {body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}