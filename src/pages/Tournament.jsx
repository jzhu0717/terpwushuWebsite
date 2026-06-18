import { useEffect } from "react";

export default function Tournament() {
	useEffect(() => {
			setTimeout(() => {
			window.scrollTo({
				top: 0,
				behavior: "smooth",
			});
		}, 100);
	}, [location]);
	
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

			<div className="flex justify-center px-4 pb-0">
                <div
                    style={{
                    width: "100%",
                    maxWidth: "860px",
                    aspectRatio: "16 / 7",
                    border: "1px solid rgba(192, 57, 43, 0.2)", 
                    borderRadius: "12px",
                    overflow: "hidden", 
                    position: "relative",
                    }}
                >
                    <img
                    src="/uwg/uwggroup.jpg" 
                    alt="uwg"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover", 
                        objectPosition: "center", 
                    }}
                    />
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
						University Wushu Games
					</h1>
					<p
						style={{
						fontSize: "1rem",
						lineHeight: 1.75,
						color: "#444",
						maxWidth: "100%",
						margin: "0 auto",
						textAlign: "center",
						}}
					>
						<strong>Work in progress</strong>
					</p>
				</div>
      </div>
    </div>
  );
}