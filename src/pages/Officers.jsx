export default function Officers() {
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
					Officers
				</h1>
				</div>				

				{/* Section cards */}
				{/* UPDATE THESE EACH YEAR HERE */}
				{/* NOTE: ADD INSTRUCTIONS LATER */}
				{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2026
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "860px",
					width: "100%",
				}}
				>
				{[ //UPDATE OFFICER CARDS
					{
					heading: "President",
					image: "/Officers/2026/aaron.jpg",
					caption: "Aaron Yang"
					},
					{
					heading: "Vice President",
					image: "/Officers/2026/josh.jpg",
					caption: "Josh Zhu"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2026/david.jpg",
					caption: "David Hong"
					},
					{
					heading: "Secretary",
					image: "/Officers/2026/ava.jpg",
					caption: "Ava Chiu"
					},
					{
					heading: "PRC",
					image: "/Officers/2026/rachel.jpg",
					caption: "Rachel Park"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "160px",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2025
				</p>
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
					heading: "President",
					image: "/Officers/2025/1President-Bryan_Gao.jpg",
					caption: "Bryan Gao"
					},
					{
					heading: "Vice President",
					image: "/Officers/2025/2VP-William_Ng.jpg",
					caption: "William Ng"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2025/3Treasurer-Dilan_Kaza.jpg",
					caption: "Dilan Kaza"
					},
					{
					heading: "Secretary",
					image: "/Officers/2025/4Secretary-Michelle_Chung.jpg",
					caption: "Michelle Chung"
					},
					{
					heading: "IRC",
					image: "/Officers/2025/5IRC-Aaron_Yang.jpg",
					caption: "Aaron Yang"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "160px",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2024
				</p>
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
					heading: "President",
					image: "/Officers/2024/1President-Carolyn_Lee.png",
					caption: "Carolyn Lee"
					},
					{
					heading: "Vice President",
					image: "/Officers/2024/2VP-Robert_Heng.jpg",
					caption: "Robert Heng"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2024/3Treasurer-William_Ng.png",
					caption: "William Ng"
					},
					{
					heading: "Secretary",
					image: "/Officers/2024/4Secretary-Michelle_Chung.jpg",
					caption: "Michelle Chung"
					},
					{
					heading: "IRC",
					image: "/Officers/2024/5IRC-Dilan_Kaza.jpg",
					caption: "Dilan Kaza"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "160px",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2023
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "720px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2023/1President-Jasmine_Voon.jpg",
					caption: "Jasmine Voon"
					},
					{
					heading: "Vice President",
					image: "/Officers/2023/2VP-Sean_Hu.png",
					caption: "Sean Hu"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2023/3Treasurer-Nicole_Tran.jpg",
					caption: "Nicole Tran"
					},
					{
					heading: "Secretary",
					image: "/Officers/2023/4Secretary-Carolyn_Lee.png",
					caption: "Carolyn Lee"
					},
					{
					heading: "IRC",
					image: "/Officers/2023/5IRC-na.jpg",
					caption: "N/A"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "100%",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2022
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "700px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2022/1President-Zelda_Zhao.jpg",
					caption: "Zelda Zhao"
					},
					{
					heading: "Vice President",
					image: "/Officers/2022/2VP-Nicole_Tran.JPG",
					caption: "Nicole Tran"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2022/3Treasurer-Ariel_Hammerash.jpg",
					caption: "Ariel Hammerash"
					},
					{
					heading: "Secretary",
					image: "/Officers/2022/4Secretary-Jasmine_Voon.jpg",
					caption: "Jasmine Voon"
					},
					{
					heading: "IRC",
					image: "/Officers/2022/5IRC-Jennifer_Salerno.JPG",
					caption: "Jennifer Salerno"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "100%",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2021
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "700px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2021/1President-Zelda_Zhao.jpg",
					caption: "Zelda Zhao"
					},
					{
					heading: "Vice President",
					image: "/Officers/2021/2VP-Sam_Bai.jpg",
					caption: "Sam Bai"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2021/3Treasurer-Wensen_Liu.jpg",
					caption: "Wensen Liu"
					},
					{
					heading: "Secretary",
					image: "/Officers/2021/4Secretary-Andrew_Chan.jpg",
					caption: "Andrew Chan"
					},
					{
					heading: "IRC",
					image: "/Officers/2021/5IRC-_Paris_Lane.jpg",
					caption: "Paris Lane"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "100%",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2020
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "700px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2020/1President-Alex_Wang.jpg",
					caption: "Alex Wang"
					},
					{
					heading: "Vice President",
					image: "/Officers/2020/2VP-Dominic_Chow.jpg",
					caption: "Dominic Chow"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2020/3Treasurer-Kyle_Chan.jpg",
					caption: "Kyle Chan"
					},
					{
					heading: "Secretary",
					image: "/Officers/2020/4Secretary-Sam_Bai.jpg",
					caption: "Sam Bai"
					},
					{
					heading: "IRC",
					image: "/Officers/2020/5IRC-Francis_Poon.jpg",
					caption: "Francis Poon"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "100%",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2019
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "700px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2019/1President-Jason_Pang.jpg",
					caption: "Jason Pang"
					},
					{
					heading: "Vice President",
					image: "/Officers/2019/2VP-Tim_Li.jpg",
					caption: "Tim Li"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2019/3Treasurer-chris_tran.jpg",
					caption: "Chris Tran"
					},
					{
					heading: "Secretary",
					image: "/Officers/2019/4Secretary-francis_poon.jpg",
					caption: "Francis Poon"
					},
					{
					heading: "IRC",
					image: "/Officers/2019/5IRC-Alex_Wang.jpg",
					caption: "Alex Wang"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "100%",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}
			
			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2018
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "700px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2018/1President-Michelle_Tu.jpg",
					caption: "Michelle Tu"
					},
					{
					heading: "Vice President",
					image: "/Officers/2018/2VP-Tim_Li.jpg",
					caption: "Tim Li"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2018/3Treasurer-Jason_Pang.jpg",
					caption: "Jason Pang"
					},
					{
					heading: "Secretary",
					image: "/Officers/2018/4Secretary-Jae_Hee_Jang.jpg",
					caption: "Jae Hee Jang"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "160px",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2017
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "700px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2017/1President-Kasey_Chan.jpg",
					caption: "Kasey Chan"
					},
					{
					heading: "Vice President",
					image: "/Officers/2017/2VP-Emily_Yang.jpg",
					caption: "Emily Yang"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2017/3Treasurer-Michelle_Tu.jpg",
					caption: "Michelle Tu"
					},
					{
					heading: "Secretary",
					image: "/Officers/2017/4Secretary-Julia_Leung.jpg",
					caption: "Julia Leung"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "160px",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2016
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "700px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2016/1President-Jason_Tang.jpg",
					caption: "Jason Tang"
					},
					{
					heading: "Vice President",
					image: "/Officers/2016/2VP-Noriko_Katagiri.jpg",
					caption: "Noriko Katagiri"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2016/3Treasurer-Charles_Yin.jpg",
					caption: "Charles Yin"
					},
					{
					heading: "Secretary",
					image: "/Officers/2016/4Secretary-Kasey_Chan.jpg",
					caption: "Kasey Chan"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "100%",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2015
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "700px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2015/1President-Daniel_Liang.jpg",
					caption: "Daniel Liang"
					},
					{
					heading: "Vice President",
					image: "/Officers/2015/2VP-Blair_Chisholm.jpg",
					caption: "Blair Chisholm"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2015/3Treasurer-Emily_Yang.jpg",
					caption: "Emily Yang"
					},
					{
					heading: "Secretary",
					image: "/Officers/2015/4Secretary-Charles_Yin.jpg",
					caption: "Charles Yin"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "100%",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2014
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "700px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2014/1President-Analee_Wong.PNG",
					caption: "Analee Wong"
					},
					{
					heading: "Vice President",
					image: "/Officers/2014/2VP-Zack_Feitelberg.PNG",
					caption: "Zack Feitelberg"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2014/3Treasurer-Stephen_Leung.PNG",
					caption: "Stephen Leung"
					},
					{
					heading: "Secretary",
					image: "/Officers/2014/4Secretary-Daniel_Liang.PNG",
					caption: "Daniel Liang"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "160px",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2013
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "700px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2013/1President-Sherry_Feng.PNG",
					caption: "Sherry Feng"
					},
					{
					heading: "Vice President",
					image: "/Officers/2013/2VP-Regina_Calloway.PNG",
					caption: "Regina Calloway"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2013/3Treasurer-Katherine_Chen.PNG",
					caption: "Katherine Chen"
					},
					{
					heading: "Secretary",
					image: "/Officers/2013/4Secretary-Analee_Wong.PNG",
					caption: "Analee Wong"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "160px",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2011-2012
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "700px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2011-2012/1President-Jeff_Xu.PNG",
					caption: "Jeff Xu"
					},
					{
					heading: "Vice President",
					image: "/Officers/2011-2012/2VP-Leon_Chao.PNG",
					caption: "Leon Chao"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2011-2012/3Treasurer-Sherry_Feng.PNG",
					caption: "Sherry Feng"
					},
					{
					heading: "Secretary",
					image: "/Officers/2011-2012/4Secretary-Calvin_Lu.PNG",
					caption: "Calvin Lu"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "160px",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2010-2011
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "700px",
					width: "100%",
				}}
				>
				{[ 
					{ //add BREATHE sound effect on name link LMAO ill just keep it from before
					heading: "President",
					image: "/Officers/2010-2011/1President-Tina_Zhang.PNG",
					caption: "Tina Zhang"
					},
					{
					heading: "Vice President",
					image: "/Officers/2010-2011/2VP-Bryan_Huang.PNG",
					caption: "Bryan Huang"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2010-2011/3Treasurer-Jenn_Kwong.PNG",
					caption: "Jenn Kwong"
					},
					{
					heading: "Secretary",
					image: "/Officers/2010-2011/4Secretary-Jeff_Xu.PNG",
					caption: "Jeff Xu"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "100%",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2009-2010
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "700px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2009-2010/1President-Jeff_Lui.PNG",
					caption: "Jeff Lui"
					},
					{
					heading: "Vice President",
					image: "/Officers/2009-2010/2VP-Henry_Hong.PNG",
					caption: "Henry Hong"
					},
					{
					heading: "Treasurer",
					image: "/Officers/2009-2010/3Treasurer-Rosie_Zhang.PNG",
					caption: "Rosie Zhang"
					},
					{
					heading: "Secretary",
					image: "/Officers/2009-2010/4Secretary-Jenn_Kwong.PNG",
					caption: "Jenn Kwong"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "160px",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2008-2009
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "500px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2008-2009/1President-Mikey_Tsai.PNG",
					caption: "Mikey Tsai"
					},
					{
					heading: "Vice President",
					image: "/Officers/2008-2009/2VP-Jon_Chung.PNG",
					caption: "Jon Chung"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "160px",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2007-2008
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "500px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2007-2008/1President-Jason_Liu.PNG",
					caption: "Jason Liu"
					},
					{
					heading: "Vice President",
					image: "/Officers/2007-2008/2VP-Jon_Chung.PNG",
					caption: "Jon Chung"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "100%",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2006-2007
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "500px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2006-2007/1President-Yuval_Zohar.PNG",
					caption: "Yuval Zohar"
					},
					{
					heading: "Vice President",
					image: "/Officers/2006-2007/2VP-Dan_Hackner.PNG",
					caption: "Dan Hackner"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "100%",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2005-2006
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "500px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2005-2006/1President-Horatiu_Muresan.PNG",
					caption: "Horatiu Muresan"
					},
					{
					heading: "Vice President",
					image: "/Officers/2005-2006/2VP-Dan_Hackner.PNG",
					caption: "Dan Hackner"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "100%",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2004-2005
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "500px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2004-2005/1President-Sharad_Satsangi.PNG",
					caption: "Sharad Satsangi"
					},
					{
					heading: "Vice President",
					image: "/Officers/2004-2005/2VP-Sarah_Deutchman.PNG",
					caption: "Sarah Deutchman"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "160px",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2003-2004
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "250px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2003-2004/1President-Sujal_Bista.PNG",
					caption: "Sujal Bista"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "100%",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}
			
			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "250px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2002-2003
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "250px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2002-2003/1President-Tony_Wong.PNG",
					caption: "Tony Wong"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "160px",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}

			{/* START COPY HERE */}
				<p
					style={{
					fontSize: "1.125rem",
					lineHeight: 1.75,
					color: "#444",
					maxWidth: "560px",
					margin: "0 auto",
					}}
				>
					{/* UPDATE YEAR HERE */}
					2001-2002
				</p>
				<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "1.25rem",
					maxWidth: "250px",
					width: "100%",
				}}
				>
				{[ 
					{
					heading: "President",
					image: "/Officers/2001-2002/1President-Justin_Ma.PNG",
					caption: "Justin Ma"
					},
				].map(({ heading, image, caption }) => (
					<div
					key={heading}
					style={{
						background: "rgba(255,255,255,0.82)",
						backdropFilter: "blur(6px)",
						border: "1px solid rgba(192, 57, 43, 0.15)",
						borderRadius: "12px",
						padding: "0.5rem 0.5rem",
						transition: "box-shadow 0.15s",
						display: "flex",          
						flexDirection: "column",
						alignItems: "center",    
						textAlign: "center",
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

					{image && (
						<img
						src={image}
						alt={`${heading} portrait`}
						style={{
							width: "100%",
							height: "160px",       
							objectFit: "cover",    
							borderRadius: "8px",
							marginBottom: "0.75rem",
						}}
						/>
					)}

					{/* Caption Element */}
					{caption && (
						<p
						style={{
							fontSize: "0.95rem",
							color: "#444",
							fontWeight: "500",
							margin: 0,
						}}
						>
						{caption}
						</p>
					)}
					</div>
				))}
				</div>
			{/* END OFFICER CARDS. END COPY HERE */}
			


			</div>
		</div>
	);
}
