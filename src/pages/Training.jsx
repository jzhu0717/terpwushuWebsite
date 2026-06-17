export default function Training() {
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
						Training
					</h1>
					<p
						style={{
						fontSize: "1rem",
						lineHeight: 1.75,
						color: "#444",
						maxWidth: "100%",
						margin: "0 auto",
						textAlign: "left",
						}}
					>
						These are just <strong>general guidelines</strong>; they will vary depending on the individual (i.e. whether the person is competing, just starting at the club, injured, etc.) and time of year (i.e. close to a competition, long before a competition, after a competition, before a demo, etc.). This is only meant to be a loose guide and coaches should follow their own best judgment.
						<br></br>
						<ol style={{ paddingLeft: "1.25rem" }}>
							<li>- <em>Monday: </em>Emphasis on barehand basics/combos as well as some conditioning.</li>
							<li>- <em>Wednesday: </em>Focusing on forms and nandu.</li>							
							<li>- <em>Friday: </em>Primarily a learning day for new forms/combos (especially weapons basics).</li>		
							<li>- <em>Saturday: </em>A more open practice, work on forms. Conditioning at the end of practice!.</li>							
					
							<br></br>
							<li><em>Note we only have Fridays and Saturdays at the Bubble to practice weapons. Please take advantage of these practices!</em></li>
						</ol>
						<br></br>
						A guide to the Terpwushu curriculum for individual progression through forms can be downloaded <a href="/TerpWushu_Curriculum.pdf" target="_blank" rel="noopener noreferrer" className="text-red-600 underline" style={{ color: "#1A73E8", textDecoration: "underline" }}>here</a>.
						<br></br><br></br>
						<strong>Four Periods to the TerpWushu Year</strong>
						<ol style={{ paddingLeft: "1.25rem" }}>
							<li><em>1. Fall Semester: Fall Competition</em></li>
							<em style={{ fontSize: "0.85rem" , paddingLeft: "1.25rem", display: "block"}}>This period is focused on the University Wushu Games hosted at Maryland and preparing for this competition.</em>
							<li><em>2. Winter/Spring Semester: Pre-Collegiates - Demo Season</em></li>	
							<em style={{ fontSize: "0.85rem" , paddingLeft: "1.25rem", display: "block"}}>This period should be preparing for the collegiates competition (meaning this training is still intense) but we are also preparing for all of our demos. We have a number of demos, including GW, CSA, TASA, Tianyi Showcase, and our very own TerpWushu End of Year Demo. This will be our own event, and every member will be a part of this.</em>						
							<li><em>3. Spring Semester: Pre-Collegiates - Spring Competition</em></li>	
							<em style={{ fontSize: "0.85rem" , paddingLeft: "1.25rem", display: "block"}}>The goal of this period is to train for the Wushu Collegiates Competition.</em>	
							<li><em>4. Summer Semester: Summer Competition and Training</em></li>							
							<em style={{ fontSize: "0.85rem" , paddingLeft: "1.25rem", display: "block"}}>There is a heavy focus on reviewing basics, introducing challenging combos, working on nandu, and learning new forms. It is also potentially another competition period: Some options for the competition include the Presidential Wushu Cup, USAWKF Team Trials, and Phoenix Wushu Nationals.</em>						
							<br></br>
						</ol>
						<strong>Competition Training Cycle</strong>
						<ol style={{ paddingLeft: "1.25rem" }}>
							<li><em>Quarter 1:</em></li>
							<em style={{ fontSize: "0.85rem" , paddingLeft: "1.25rem", display: "block"}}>Focus on basics and learning forms. Mostly train 1-2 sections.</em>
							<li><em>Quarter 2:</em></li>
							<em style={{ fontSize: "0.85rem" , paddingLeft: "1.25rem", display: "block"}}>Progress toward focusing more on forms, and increasing the intensity, duration, and volume of forms practice. This means go from practicing mostly 1-2 sections toward doing whole forms many times at a high intensity.</em>
							<li><em>Quarter 3:</em></li>
							<em style={{ fontSize: "0.85rem" , paddingLeft: "1.25rem", display: "block"}}>Highest intensity but lower volume. For examaple, do very intense and powerful sections and whole forms but don't do too many forms/over-train.  At this time find “peak performance”, or the conditions that bring about your best performance (how many days of rest, what kind of foods, how much practice, etc.) This period is right before competition (about 2 weeks) and should include a lot of rest (not practicing everyday).</em>
							<li><em>Quarter 4:</em></li>
							<em style={{ fontSize: "0.85rem" , paddingLeft: "1.25rem", display: "block"}}>Decrease intensity, focus on correcting mistakes made during competition, thinking about competition experience, and start to learn new things.</em>
							<br></br>
							<li><em>Summary:</em></li>
							<em style={{ fontSize: "0.85rem" , paddingLeft: "1.25rem", display: "block"}}>1. Learning/basics/slowly increasing intensity</em>
							<em style={{ fontSize: "0.85rem" , paddingLeft: "1.25rem", display: "block"}}>2. High intensity and high volume</em>
							<em style={{ fontSize: "0.85rem" , paddingLeft: "1.25rem", display: "block"}}>3. High intensity and low volume</em>
							<em style={{ fontSize: "0.85rem" , paddingLeft: "1.25rem", display: "block"}}>4. Lower intensity/polishing</em>

						</ol>
					</p>
				</div>
			</div>
		</div>
	);
}
