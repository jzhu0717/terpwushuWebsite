export default function Home() {
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

      {/* Hero slideshow placeholder */}
      <div className="flex justify-center px-4 pb-0">
        <div
          style={{
            width: "100%",
            maxWidth: "860px",
            aspectRatio: "16 / 7",
            background: "rgba(139, 26, 26, 0.08)",
            border: "1.5px dashed #C0392B",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            color: "#9B3333",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="20" height="20" rx="3" />
            <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
          </svg>
          <span style={{ fontSize: "13px", fontWeight: 500 }}>
            Image / Video Slideshow
          </span>
          <span style={{ fontSize: "11px", opacity: 0.7 }}>
            placeholder for now
          </span>
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

        {/* Section cards */}
        <div
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
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: "#333" }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}