import { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link, useLocation } from "react-router-dom";
import { supabase } from '../../supabaseClient';

const renderPhotoLinks = (photosUrls) => {
    if (!photosUrls || photosUrls.length === 0) {
        return <span className="text-zinc-400 italic text-sm">None</span>;
    }

    return (
        <div className="flex flex-wrap gap-2">
        {photosUrls.map((url, index) => (
            <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-semibold bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded hover:bg-red-100 transition"
            >
            Album {photosUrls.length > 1 ? index + 1 : ""}
            </a>
        ))}
        </div>
    );
};

export default function Tournament() {
    const [archives, setArchives] = useState([]);
    const location = useLocation(); 
	const recaptchaRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const [captchaToken, setCaptchaToken] = useState(null);
    const [status, setStatus] = useState({ loading: false, type: '', message: '' });

	const [settings, setSettings] = useState(null);
    const [loadingSettings, setLoadingSettings] = useState(true);

	useEffect(() => {
        async function fetchSettings() {
            try {
                const { data, error } = await supabase
                    .from('tournament_webpage')
                    .select('*')
                    .eq('id', 1)
                    .single();
                
                if (error) throw error;
                setSettings(data);
            } catch (err) {
                console.error("Error loading tournament details:", err);
            } finally {
                setLoadingSettings(false);
            }
        }
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { name, email, message } = formData;

        if (!name.trim() || !email.trim() || !message.trim()) {
            setStatus({ loading: false, type: 'error', message: 'All fields are required.' });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus({ loading: false, type: 'error', message: 'Please enter a valid email address.' });
            return;
        }

        if (!captchaToken) {
            setStatus({ loading: false, type: 'error', message: 'Please complete the reCAPTCHA check.' });
            return;
        }

        setStatus({ loading: true, type: '', message: '' });

        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        const templateParams = {
            name: name,
            email: email,
            message: message,
			'g-recaptcha-response': captchaToken, 
        };

        emailjs.send(serviceId, templateId, templateParams, publicKey)
            .then(() => {
                setStatus({ loading: false, type: 'success', message: 'Message sent successfully!' });
                // Reset form on success
                setFormData({ name: '', email: '', message: '' });
                setCaptchaToken(null);
            })
            .catch((error) => {
                console.error('EmailJS Error:', error);
                setStatus({ loading: false, type: 'error', message: 'Failed to send message. Please try again.' });
            });
    };

    useEffect(() => {
        if (location.hash === "#faq") {
            const element = document.getElementById("faq");
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
            }
        } else if (location.hash === "#committee") {
            const element = document.getElementById("committee");
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
            }
        } else if (location.hash === "#archives") {
            const element = document.getElementById("archives");
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
            }
        } else {
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
            }, 100);
        }
    }, [location]);

    const now = new Date();
    const regBegins = settings?.reg_begins ? new Date(settings.reg_begins) : null;
    const earlyEnds = settings?.early_reg_ends ? new Date(settings.early_reg_ends) : null;
    const lateEnds = settings?.late_reg_ends ? new Date(settings.late_reg_ends) : null;

    const hasRegStarted = regBegins && now >= regBegins;
    const isEarlyBird = earlyEnds && now < earlyEnds;
    const hasRegClosed = lateEnds && now >= lateEnds;

    const basePrice = Number(settings?.early_reg_price || 0);
    const lateFee = Number(settings?.late_fee || 0);
    const currentRegistrationCost = isEarlyBird ? basePrice : (basePrice + lateFee);

	const isScheduleAvailable = settings?.doors_open || settings?.opening_ceremony || settings?.competition_begin;
    const isLivestreamAvailable = settings?.livestream_ring_1 || settings?.livestream_ring_2;
    const isCommitteeAvailable = settings && Object.keys(settings).some(key => 
		key.startsWith('committee_') || 
		key.endsWith('_chair') || 
		key.endsWith('_manager') || 
		key.endsWith('_liaison') || 
		key.endsWith('_coordinator') || 
		key === 'webmaster' || 
		key === 'score_contesting'
		) && (
		settings.committee_chief || 
		settings.collegiate_liaison || 
		settings.wushu_liaison || 
		settings.judges_liaison || 
		settings.design_chair || 
		settings.visual_tech_chair || 
		settings.score_contesting || 
		settings.registration_manager || 
		settings.ring_coordinator || 
		settings.webmaster
		);

    
    useEffect(() => {
        const fetchArchives = async () => {
            const { data, error } = await supabase
            .from('tournament_archives')
            .select('*')
            .order('event_number', { ascending: false });
            
            if (!error && data) {
            setArchives(data);
            }
        };
        fetchArchives();
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
                    <div className="w-full pt-4 px-4"> 
                        <nav className="mx-auto w-fit bg-[#611313] text-white py-2 px-6 flex items-center gap-6 rounded-full shadow-lg">
                            <Link to="#">Info</Link>
                            <Link to="#faq">FAQ</Link>
							<Link to="#committee">Committee</Link>
							<Link to="#archives">Archives</Link>
							    {hasRegClosed ? (
                                <span className="opacity-60 cursor-not-allowed">Register</span>
                            ) : !hasRegStarted ? (
                                <span className="opacity-60 cursor-not-allowed">Register</span>
                            ) : (
                                <Link to="/tournament/registration">Register</Link>
                            )}                            
                        </nav>
                    </div>
                    
                    <div
                        style={{
                            fontSize: "1rem",
                            lineHeight: 1.75,
                            color: "#444",
                            maxWidth: "100%",
                            margin: "2rem auto 0",
                            textAlign: "center",
                        }}
                    >
                        <div
                            id="info"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "1.25rem",
                                maxWidth: "860px",
                                width: "100%",
                                textAlign: "left"
                            }}
                        >
                            {[
                                {
                                    heading: "General Information",
                                    body: (
                                        <>
                                            The {" "}
											{settings?.event_number} {/* event number here, ## + th / st / nd / rd  */}
											Annual University Wushu Games (UWG) will be held on 
											<strong> {settings?.uwg_day} </strong> {/* event date here  */}
											at the University of Maryland, College Park. UWG is a unique opportunity for east coast schools in the area and other collegiate wushu clubs to come together and strengthen the Wushu/Chinese Kung Fu community. This event is open all ages, and it is our hope to continue providing this opportunity for years to come.
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
                                            textAlign: "center"
                                        }}
                                    >
                                        {heading}
                                    </h2>
                                    <div style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: "#333", textAlign: "left" }}>
                                        {body}
                                    </div>
                                </div>
                            ))}
                        </div>

						<br />

                        <div
                            id="info"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "1.25rem",
                                maxWidth: "860px",
                                width: "100%",
                                textAlign: "left"
                            }}
                        >
                            {[
                                {
                                    heading: "Registration",
                                    body: (
                                        <>
                                            <div style={{ width: "100%", color: "#333" }}>
                                                {settings ? (
                                                    <>
                                                        <div className="mt-4">
                                                            {hasRegClosed ? (
                                                                <div className="p-3 bg-zinc-100 text-zinc-500 rounded-lg text-center font-bold border border-zinc-200 text-sm">
                                                                    Registration has passed
                                                                </div>
                                                            ) : !hasRegStarted ? (
                                                                <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-center text-xs border border-amber-200">
                                                                    Registration opens {regBegins ? regBegins.toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'soon!'}
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-3"> 
                                                                    <div className="flex w-full justify-center"> 
                                                                        <Link to="/tournament/registration" className="flex items-center w-fit">
                                                                            <img src="/uwg/registerbutton.png" alt="register" className="h-20" />
                                                                        </Link>
                                                                    </div>
                                                                    <strong>Registration is open!</strong>
                                                                    {earlyEnds && (
                                                                        <div>
                                                                            <span className="font-bold text-gray-700">Early Registration Ends:</span>{' '}
                                                                            {earlyEnds.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                                        </div>
                                                                    )}
                                                                    {lateEnds && (
                                                                        <div>
                                                                            <span className="font-bold text-gray-700">Regular Registration Deadline:</span>{' '}
                                                                            {lateEnds.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p className="text-zinc-400 text-sm">Loading...</p>
                                                )}
                                            </div>
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
                                            textAlign: "center"
                                        }}
                                    >
                                        {heading}
                                    </h2>
                                    <div style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: "#333", textAlign: "left" }}>
                                        {body}
                                    </div>
                                </div>
                            ))}
                        </div>

						<br />

						<div
                            id="schedule"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "1.25rem",
                                maxWidth: "860px",
                                width: "100%",
                                textAlign: "center"
                            }}
                        >
                            {[
                                {
                                    heading: "Schedule",
                                    body: (
                                        <>
											{/* event times here  */}
                                            <em>Times subject to change.</em>
											<br />
											{!isScheduleAvailable ? (
												<div className="font-bold text-lg text-gray-600 my-4">Schedule Details: TBA</div>
											) : (
												<div className="flex flex-col gap-1 my-3 text-left max-w-xs mx-auto">
													{settings.doors_open && <div><strong>Doors Open:</strong> {settings.doors_open}</div>}
													{settings.opening_ceremony && <div><strong>Opening Ceremony:</strong> {settings.opening_ceremony}</div>}
													{settings.competition_begin && <div><strong>Competition Begins:</strong> {settings.competition_begin}</div>}
												</div>
											)} 

											<br />
                                                <div className="flex w-full justify-center"> 
                                                <Link to="/tournament/event-order" className="flex items-center w-fit">
                                                    <img src="/uwg/eventOrderButton.png" alt="Event Order" className="h-20" />
                                                </Link>
                                                </div>
                                            <br />
											<p className="text-xs text-left text-gray-600 mb-4">
												Please confirm that your name is under all the forms that you have registered for. If there are any mistakes or changes you would like to make, please contact us by email ASAP so we can address any problems!
											</p>
                                        
											{isLivestreamAvailable && (
												<div className="mt-4 pt-4 border-t border-red-200 text-left">
													<h4 className="font-bold text-red-800 text-sm uppercase tracking-wider mb-2 text-center">🔴 Live Streams</h4>
													<div className="flex flex-col gap-1 items-center justify-center">
														{settings.livestream_ring_1 && <a href={settings.livestream_ring_1} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm font-medium">Watch Ring 1 Live</a>}
														{settings.livestream_ring_2 && <a href={settings.livestream_ring_2} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm font-medium">Watch Ring 2 Live</a>}
													</div>
												</div>
											)}
										</>
                                    ),
                                },
								{
                                    heading: "Venue",
                                    body: (
                                        <>
                                            <strong>The University Wushu Games will be held at {settings?.venue_location}</strong>
											<br />
											{/* venue address here */}
											{settings?.venue_address}
											<br />
											<iframe
												title="Venue Location map"
												src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3101.326812690534!2d-76.936431!3d38.985037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7c6bced0c8849%3A0x8adea64deb89027f!2sRitchie%20Coliseum!5e0!3m2!1sen!2sus!4v1781904484603!5m2!1sen!2sus"
												width="400"
												height="300"
												style={{ border: 0, borderRadius: "12px", width: "100%", maxWidth: "400px" }}
												allowFullScreen
												loading="lazy"
												referrerPolicy="no-referrer-when-downgrade"
											/>
											<br />
											Parking is free in any unrestricted lots on campus. We recommend parking at lots {" "}
											{/* parking lots here */}
											{settings?.parking_locations}
											{" "} located near {" "}
											{/* venue name here */}
											{settings?.venue_location}
											{" "} on competition day. For more information on parking, please refer to the map below, as well as {" "}<a href="https://maps.umd.edu/" target="_blank" rel="noreferrer" style={{ color: "#1A73E8", textDecoration: "underline" }}>this Campus Parking Map</a>. Please read all signs at the entrance of each lot before parking. TerpWushu will not claim responsibility for any parking violations or damages to your vehicle while on campus.
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
                                            textAlign: "center"
                                        }}
                                    >
                                        {heading}
                                    </h2>
                                    <div style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: "#333", textAlign: "center" }}>
                                        {body}
                                    </div>
                                </div>
                            ))}
                        </div>

						<br />

						<div
                            id="rules"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "1.25rem",
                                maxWidth: "860px",
                                width: "100%",
                                textAlign: "center"
                            }}
                        >
                            {[
                                {
                                    heading: "Competition Rules",
                                    body: (
                                        <>
                                            With the exceptions enumerated in the UWG Rules, the University Wushu Games will comply with the competition rules and judging guidelines established by the 2024 International Wushu Federation (IWuF) rules and bylaws for International Taolu and Nandu events. For all standard open events, USWU rules will be followed. Any violation of the rules can be considered grounds for disqualification. Please download these documents from the links below.
                                            <br /><br />
                                            <a href="/docs/CompetitionOverviewandGuidetoRegistration.pdf" target="_blank" rel="noopener noreferrer" className="text-red-600 underline" style={{ color: "#1A73E8", textDecoration: "underline" }}>Competition Overview and Guide to Registration</a> 
                                            <br />
                                            <a href="/docs/USWURulebook2002.pdf" target="_blank" rel="noopener noreferrer" className="text-red-600 underline" style={{ color: "#1A73E8", textDecoration: "underline" }}>USWU Rules</a> & <a href="/docs/USWURulesAddendum2004.pdf" target="_blank" rel="noopener noreferrer" className="text-red-600 underline" style={{ color: "#1A73E8", textDecoration: "underline" }}>2004 USWU Addendum</a>
                                            <br />
                                            <a href="/docs/WUSHU-TAOLU-COMPETITION-RULES-AND-JUDGING-METHODS-2024.pdf" target="_blank" rel="noopener noreferrer" className="text-red-600 underline" style={{ color: "#1A73E8", textDecoration: "underline" }}>2024 IWUF Rules (PDF)</a>
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
                                            textAlign: "center"
                                        }}
                                    >
                                        {heading}
                                    </h2>
                                    <div style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: "#333", textAlign: "center" }}>
                                        {body}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <br />

                        <div
                            id="faq"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "1.25rem",
                                maxWidth: "860px",
                                width: "100%",
                                textAlign: "left"
                            }}
                        >
                            {[
                                {
                                    heading: "Frequently Asked Questions",
                                    body: (
                                        <>
                                            <strong>Q: Where can I find a copy of the waiver?</strong>
                                            <br />
                                            A: Any competitor under the age of 18 MUST complete the <a href="/docs/Parental-Consent.pdf" target="_blank" rel="noopener noreferrer" className="text-red-600 underline" style={{ color: "#1A73E8", textDecoration: "underline" }}>PARENTAL CONSENT FORM</a> with their parent or guardian and bring it with them on the day of competition. Any competitor over the age of 18 must complete the <a href="/docs/Event-Waiver.pdf" target="_blank" rel="noopener noreferrer" className="text-red-600 underline" style={{ color: "#1A73E8", textDecoration: "underline" }}>EVENT WAIVER</a>. The waiver should be printed, signed, and brought to the check-in table on the day of the competition. Minor forms must include the signature of their parent or guardian. The club name is "Terp Wushu Club." Should a competitor refuse to sign the waiver, they will not be allowed to compete in any events.
                                            <br /><br />
                                            <strong>Q: Where do I send my forms and payment?</strong>
                                            <br />
                                            A: You can send a copy of your waiver to our email address <a href="mailto:terpwushu@gmail.com" className="text-red-600 underline" style={{ color: "#1A73E8", textDecoration: "underline" }}>terpwushu@gmail.com</a> or bring the waiver with you on competition day and turn it in as you register. Payment can be made by cash, check, credit card, debit card, or ACH Transfer. Payments using a credit card, debit card, or ACH Transfer may be completed online via. the PayPal link sent with your registration confirmation email. If you pay by check, be sure to make it payable to <strong>"Terp Wushu Club"</strong> and bring it with you on competition day as you check-in. Credit/Debit cards are also accepted at the check in table.
                                            <br /><br />
                                            <strong>Q: Are there any spectator fees?</strong>
                                            <br />
                                            A: Spectator admission is free! On competition day, proceed directly to the spectator seating area!
                                            <br /><br />
                                            <strong>Q: Can I leave my child and come back when the competition is over?</strong>
                                            <br />
                                            A: NO! If your child is younger than 13 years old, you must sign-in along with your child and acknowledge that you will be present to supervise your child for the duration of the tournament until both you and your child leave. We do not have any designated chaperones for children left unattended and are not responsible for watching any young children. Please make sure that you or another parent/legal guardian is at the tournament with your child at all times.
                                            <br /><br />
                                            <strong>Q: Where do I park?</strong>
                                            <br />
                                            A: Parking is free in any unrestricted lots on campus. We recommend parking at lots J2, J1, L located near Ritchie Coliseum on competition day. For more information on parking, please refer to the map below, as well as {" "}<a href="https://maps.umd.edu/" target="_blank" rel="noreferrer" style={{ color: "#1A73E8", textDecoration: "underline" }}>this Campus Parking Map</a>. Please read all signs at the entrance of each lot before parking. <strong>TerpWushu will not claim responsibility for any parking violations or damages to your vehicle while on campus.</strong>
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
                                            textAlign: "center"
                                        }}
                                    >
                                        {heading}
                                    </h2>
                                    <div style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: "#333", textAlign: "left" }}>
                                        {body}
                                    </div>
                                </div>
                            ))}
                        </div>

						<br />

						<div
                            id="committee"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "1.25rem",
                                maxWidth: "860px",
                                width: "100%",
                                textAlign: "left"
                            }}
                        >
                            {[
                                {
                                    heading: "Committee",
                                    body: (
                                        <>
										<div className="grid grid-columns-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-800 max-w-md mx-auto">
                                        {settings?.committee_chief && <div><strong>Committee Chief:</strong> {settings?.committee_chief}</div>}
                                        {settings?.collegiate_liaison && <div><strong>Collegiate Schools Liaison:</strong> {settings?.collegiate_liaison}</div>}
                                        {settings?.wushu_liaison && <div><strong>Wushu Schools Liaison:</strong> {settings?.wushu_liaison}</div>}
                                        {settings?.judges_liaison && <div><strong>Judges Liaison:</strong> {settings?.judges_liaison}</div>}
                                        {settings?.design_chair && <div><strong>Design Chair:</strong> {settings?.design_chair}</div>}
                                        {settings?.visual_tech_chair && <div><strong>Visual Tech Chair:</strong> {settings?.visual_tech_chair}</div>}
                                        {settings?.score_contesting && <div><strong>Score Contesting:</strong> {settings?.score_contesting}</div>}
                                        {settings?.registration_manager && <div><strong>Registration Manager:</strong> {settings?.registration_manager}</div>}
                                        {settings?.ring_coordinator && <div><strong>Ring Event Coordinator:</strong> {settings?.ring_coordinator}</div>}
                                        {settings?.webmaster && <div><strong>Webmaster:</strong> {settings?.webmaster}</div>}
                                    	</div>
                                        </>
                                    ),
                                },
								{
                                    heading: "Questions? Contact Us!",
                                    body: (
                                        <>
										Contact our UWG Committee using the contact form below:
										<br /><br />
										<div style={{ width: "100%", maxWidth: "860px", margin: "0 auto" }}>
											<form 
												onSubmit={handleSubmit} 
												className="flex flex-col gap-4"
												style={{ 
													background: '#ffffff', 
													padding: '2rem', 
													borderRadius: '12px', 
													boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
												}}
											>
												{/* Name Input */}
												<div className="flex flex-col gap-1">
													<label style={{ fontSize: '14px', fontWeight: 600, color: '#444' }}>Name</label>
													<input 
														type="text" 
														name="name" 
														value={formData.name} 
														onChange={handleChange} 
														placeholder="Your Name" 
														style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
													/>
												</div>

												{/* Email Input */}
												<div className="flex flex-col gap-1">
													<label style={{ fontSize: '14px', fontWeight: 600, color: '#444' }}>Email</label>
													<input 
														type="email" 
														name="email" 
														value={formData.email} 
														onChange={handleChange} 
														placeholder="Email" 
														style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
													/>
												</div>

												{/* Message TextArea */}
												<div className="flex flex-col gap-1">
													<label style={{ fontSize: '14px', fontWeight: 600, color: '#444' }}>Message</label>
													<textarea 
														name="message" 
														value={formData.message} 
														onChange={handleChange} 
														rows="4" 
														placeholder="Write your message here" 
														style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', resize: 'none' }}
													/>
												</div>

												{/* Google reCAPTCHA Element */}
												<div className="flex justify-center py-2">
													<ReCAPTCHA
														ref={recaptchaRef}
														sitekey={import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY}
														onChange={handleCaptchaChange}
													/>
												</div>

												{/* Interactive Status Notice Container */}
												{status.message && (
													<div 
														style={{ 
															padding: '0.75rem', 
															borderRadius: '6px', 
															fontSize: '14px', 
															textAlign: 'center', 
															backgroundColor: status.type === 'success' ? '#DEF7EC' : '#FDE8E8', 
															color: status.type === 'success' ? '#03543F' : '#9B1C1C' 
														}}
													>
														{status.message}
													</div>
												)}

												{/* Submission Action button */}
												<button 
													type="submit" 
													disabled={status.loading} 
													style={{ 
														background: '#a12222', 
														color: '#fff', 
														padding: '0.75rem', 
														borderRadius: '6px', 
														fontWeight: 600, 
														cursor: status.loading ? 'not-allowed' : 'pointer', 
														border: 'none', 
														opacity: status.loading ? 0.7 : 1,
														transition: 'background 0.2s' 
													}}
													onMouseEnter={(e) => !status.loading && (e.target.style.background = '#7A1A1A')}
													onMouseLeave={(e) => !status.loading && (e.target.style.background = '#a12222')}
												>
													{status.loading ? 'Sending...' : 'Send Message'}
												</button>
											</form>
										</div>
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
                                            textAlign: "center"
                                        }}
                                    >
                                        {heading}
                                    </h2>
                                    <div style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: "#333", textAlign: "left" }}>
                                        {body}
                                    </div>
                                </div>
                            ))}
                        </div>

						<br />

						<div
                            id="archives"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "1.25rem",
                                maxWidth: "860px",
                                width: "100%",
                                textAlign: "left"
                            }}
                        >
                            {[
                                {
                                    heading: "Archives",
                                    body: (
                                        <>
                                            <div className="overflow-x-auto w-full">
                                                <table className="w-full min-w-[600px] border-collapse text-left text-sm text-gray-700">
                                                <thead>
                                                    <tr className="border-b border-gray-200 text-gray-500 font-semibold uppercase text-xs tracking-wider">
                                                    <th className="pb-3 pr-4 font-bold text-[#8B1A1A]">Year</th>
                                                    <th className="pb-3 px-4 font-bold text-[#8B1A1A]">Scores</th>
                                                    <th className="pb-3 px-4 font-bold text-[#8B1A1A]">Videos</th>
                                                    <th className="pb-3 pl-4 font-bold text-[#8B1A1A]">Photos</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {archives.map((row) => (
                                                    <tr key={row.id} className="hover:bg-white/40 transition-colors">
                                                        
                                                        {/* Column 1: Edition, Date & Optional Notes */}
                                                        <td className="py-3.5 pr-4 align-top max-w-[200px]">
                                                            <div className="font-bold text-gray-900">{row.edition}</div>
                                                            <div className="text-xs text-gray-500 mt-0.5">{row.event_date}</div>
                                                            
                                                            {/* If a note exists, it renders neatly under the date instead of hijacking the row */}
                                                            {row.notes && (
                                                                <div className="text-xs text-red-700 italic font-medium mt-1.5 bg-red-50/50 p-1.5 rounded border border-red-100">
                                                                    Note: {row.notes}
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Column 2: Scores */}
                                                        <td className="py-3.5 px-4 align-top">
                                                        {row.scores_url ? (
                                                            <a 
                                                            href={row.scores_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="text-red-700 hover:underline font-medium"
                                                            >
                                                            Download Scores (.xlsx)
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400">Not Available</span>
                                                        )}
                                                        </td>

                                                        {/* Column 3: Videos */}
                                                        <td className="py-3.5 px-4 align-top">
                                                        {row.videos_url ? (
                                                            <a 
                                                            href={row.videos_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="text-red-700 hover:underline font-medium"
                                                            >
                                                            Youtube
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400">No Videos</span>
                                                        )}
                                                        </td>

                                                        {/* Column 4: Photos */}
                                                        <td className="py-3.5 pl-4 align-top whitespace-normal">
                                                            {renderPhotoLinks(row.photos_urls)}
                                                        </td>
                                                    </tr>
                                                    ))}
                                                </tbody>
                                                </table>
                                            </div>
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
                                            textAlign: "center"
                                        }}
                                    >
                                        {heading}
                                    </h2>
                                    <div style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: "#333", textAlign: "left" }}>
                                        {body}
                                    </div>
                                </div>
                            ))}
                        </div>





                    </div>
                </div>
            </div>
        </div>
    );
}