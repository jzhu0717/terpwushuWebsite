import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import emailjs from "@emailjs/browser";
import { api } from '../../apiClient';
import { NON_COLLEGIATE_AGE_GROUPS, COLLEGIATE_AGE_GROUPS, WUSHU_SCHOOLS, COLLEGES, GRAND_CHAMPION_MIN_EVENTS, MINOR_AGE_GROUPS } from '../../constants/registrationOptions';
import PayPalPayment from '../../components/PayPalPayment';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FREE_REGISTRATION_INSTITUTION = 'University of Maryland College Park';

const COMPULSORY_CATEGORY_INFO = {
    'Group A Compulsory': {
        titleLabel: '3rd Set of International Competition Routine',
        bodyLabel: '3rd Set of International Competition Routine Taolu',
        // Prefixed onto the Barehand/Short Weapon/Long Weapon subcategory heading below, so
        // it reads e.g. "International Taolu 3rd Set Compulsory Barehand" — the same event
        // name (e.g. "ChangQuan (Longfist)") appears under Contemporary too, so the plain
        // subcategory word alone was ambiguous about which section it belonged to.
        subcategoryPrefix: 'International Taolu 3rd Set Compulsory',
    },
    'Group B Compulsory': {
        titleLabel: '1st Set of International Competition Routine',
        bodyLabel: '1st Set of International Competition Routine Taolu',
        subcategoryPrefix: 'International Taolu 1st Set Compulsory',
    },
    'Group C Compulsory': {
        titleLabel: 'International Taolu 3rd Elementary Routine',
        bodyLabel: '3rd Elementary Routine Taolu',
        subcategoryPrefix: 'International Taolu 3rd Elementary Routine',
    },
};

function isCategoryVisible(category, { isCollegiate, ageGroup, experienceLevel }) {
    if (category === 'Group A Compulsory') return !isCollegiate && ageGroup === 'Group A (Up to 17 Years Old)';
    if (category === 'Group B Compulsory') return !isCollegiate && ageGroup === 'Group B (Up to 14 Years Old)';
    if (category === 'Group C Compulsory') return !isCollegiate && ageGroup === 'Group C (Up to 11 Years Old)';
    if (category === 'Nandu Events') return experienceLevel === 'Advanced';
    return true;
}

// Kept in sync with server/lib/waiverPdf.js — this is the same text baked into the generated
// waiver PDF, shown here so registrants (or their parent/guardian, for minors) read it before
// consenting.
const WAIVER_CLAUSES = [
    "I fully recognize and understand that there are risks and hazards, minor and serious, associated with participation in sport club events, ranging from scrapes, bruises, lacerations, broken bones to concussions, spinal cord injuries, paralysis and, even, death. These injuries may result from crashing with other participants, being hit by equipment, or environmental conditions.",
    "I understand that protective equipment, including but not limited to, headgear, pads, eyewear and mouthpieces may be recommended for the safety and protection of participants, and I agree to wear such equipment when participating in such activities. However, I understand that wearing such equipment will not eliminate the risks of participation.",
    "I understand that the rules and regulations of the national entity or governing body that sponsors my sport club are designed, in part, for the safety and protection of participants and I agree to abide by those rules and regulations.",
    "I understand that sports require a minimum level of fitness for safe participation. I also understand that University Recreation & Wellness advises that participants in sport club activities have a physical examination to determine their fitness for participation and to carry personal health and accident insurance. I further understand that the University of Maryland does not provide medical, health or other insurance for participants in sport club activities.",
    "In the event of a medical emergency, I hereby give my consent to emergency transportation and medical treatment arising out of or related to participation in the Event.",
    "Knowing the dangers, hazards and risks associated with sport club activities, I voluntarily assume all responsibility and risk of loss, damage, illness and/or injury to my person or property in any way associated with my participation in the Event, including related travel.",
    "To the fullest extent permitted by law, I hereby release and forever discharge, and agree to indemnify and hold harmless the State of Maryland, the University of Maryland, and their departments, officers, agents, employees, and volunteers (Released Parties) from and against any and all liabilities, claims, demands, causes of action, costs and expenses, (including attorneys' fees and related litigation costs) incurred by any of the Released Parties arising out of or relating to my participation in or involvement with the Event, or use of RecWell equipment and facilities, including travel thereto and therefrom, whether due to the negligence, default or other action or inaction of any person or entity, including the Released Parties.",
];

const PARENTAL_WAIVER_CLAUSES = [
    "I understand that the University is not the sponsor of the Event, which is organized by the University of Maryland Wushu Club, an independent student organization. The University is not responsible for the Event, and it does not oversee, supervise or control Event activities.",
    "I fully recognize and understand that there are risks and hazards, minor and serious, associated with participation in wushu, which include, but are not limited to: muscular strains, bruises, broken bones, dislocations, lacerations, concussions, head and eye injuries caused by approved equipment, paralysis; and which may also include other serious bodily injuries and, even, death.",
    "Knowing the dangers, hazards and risks associated with wushu, I voluntarily assume all responsibility and risk of loss, damage, illness and/or injury to person or property that my child may, in any way, sustain in connection with his/her participation in such activities at the Event.",
    "I understand that the rules and regulations applicable to wushu are designed, in part, for the safety and protection of participants and others, and I agree that my child must abide by those rules and regulations. I further understand that protective equipment is recommended for the safety and protection of participants in wushu, and I agree that my child must provide and wear such equipment when participating in such activities. However, I understand that such rules and regulations and wearing such equipment will not eliminate the risks of participation in wushu activities.",
    "I understand that wushu requires a minimum level of experience and fitness for safe participation. I, on behalf of my minor child, also understand that the University advises that participants in Club Sport related activities have a physical examination to determine their fitness for participation. I further understand that the University of Maryland does not provide medical, health or other insurance for participants in the Event or other Club Sport related activities.",
    "To the fullest extent permitted by law, I hereby release and forever discharge, and agree to indemnify and hold harmless, the State of Maryland, the University of Maryland, University Recreation & Wellness and their officers, agents, employees, students, and volunteers from and against any and all liabilities, claims, demands and causes of action on account of any loss or injury in any way arising out of or relating to my child's participation in or involvement with wushu activities during the Event, including the use of University equipment and facilities in connection therewith, whether due to the negligence, default or other action or inaction of any person or entity.",
];

const CARD_STYLE = {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(192, 57, 43, 0.15)",
    borderRadius: "12px",
    padding: "1.5rem 1.25rem",
};

const LABEL_STYLE = { fontSize: '14px', fontWeight: 600, color: '#444' };
const INPUT_STYLE = { padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' };
const HEADING_STYLE = {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#8B1A1A",
    marginBottom: "1rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
};

function RadioGroup({ label, name, options, value, onChange }) {
    return (
        <div className="flex flex-col gap-1">
            <span style={LABEL_STYLE}>{label}</span>
            <div className="flex flex-wrap justify-center gap-4">
                {options.map((opt) => (
                    <label key={opt} className="flex items-center gap-2" style={{ fontSize: '15px', color: '#333', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name={name}
                            value={opt}
                            checked={value === opt}
                            onChange={onChange}
                        />
                        {opt}
                    </label>
                ))}
            </div>
        </div>
    );
}

function StatusBanner({ status }) {
    if (!status.message) return null;
    return (
        <div
            style={{
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '14px',
                textAlign: 'center',
                backgroundColor: status.type === 'success' ? '#DEF7EC' : '#FDE8E8',
                color: status.type === 'success' ? '#03543F' : '#9B1C1C',
            }}
        >
            {status.message}
        </div>
    );
}

export default function Registration() {
    const recaptchaRef = useRef(null);

    const [settings, setSettings] = useState(null);
    const [events, setEvents] = useState([]);
    const [loadError, setLoadError] = useState('');

    const [step, setStep] = useState('bio'); // bio | details | verify | events | waiver | confirm | success | duplicate
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [verifyCode, setVerifyCode] = useState('');
    const [sendingCode, setSendingCode] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);

    const [waiverAccepted, setWaiverAccepted] = useState(false);
    const [parentGuardianName, setParentGuardianName] = useState('');
    const [grandChampion, setGrandChampion] = useState(false);
    const [finalRegistration, setFinalRegistration] = useState(null);

    const [bio, setBio] = useState({
        first_name: '',
        last_name: '',
        email: '',
        gender: '',
        experience_level: '',
        collegiate_status: '',
    });

    const [details, setDetails] = useState({
        age_group: '',
        institution: '',
        institution_other: '',
    });

    const [eventSelection, setEventSelection] = useState({ event_ids: [] });

    useEffect(() => {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
    }, [step]);

    useEffect(() => {
        async function load() {
            try {
                const [settingsData, eventsData] = await Promise.all([
                    api.get('/tournament-webpage'),
                    api.get('/events?active=true'),
                ]);
                setSettings(settingsData);
                setEvents(eventsData || []);
            } catch (err) {
                console.error("Error loading registration page:", err);
                setLoadError('We had trouble loading registration details. Please refresh the page or try again later.');
            }
        }
        load();
    }, []);

    const now = new Date();
    const regBegins = settings?.reg_begins ? new Date(settings.reg_begins) : null;
    const earlyEnds = settings?.early_reg_ends ? new Date(settings.early_reg_ends) : null;
    const lateEnds = settings?.late_reg_ends ? new Date(settings.late_reg_ends) : null;
    const hasRegStarted = regBegins && now >= regBegins;
    const isEarlyBird = earlyEnds && now < earlyEnds;
    const hasRegClosed = lateEnds && now >= lateEnds;
    const basePrice = Number(settings?.early_reg_price || 0);
    const lateFee = Number(settings?.late_fee || 0);
    const pricePerEvent = Number(settings?.price_per_event || 0);
    const collegiateDiscount = Number(settings?.collegiate_discount || 0);
    const collegiateFirstEventPrice = Math.max(0, basePrice - collegiateDiscount);
    const grandChampionFee = Number(settings?.grand_champion_price || 0);

    const isCollegiate = bio.collegiate_status === 'Collegiate';
    const isMinor = MINOR_AGE_GROUPS.has(details.age_group);
    const ageGroupOptions = isCollegiate ? COLLEGIATE_AGE_GROUPS : NON_COLLEGIATE_AGE_GROUPS;
    const institutionOptions = isCollegiate ? COLLEGES : WUSHU_SCHOOLS;
    const institutionLabel = isCollegiate ? 'College' : 'Wushu School';

    const isFreeUmdRegistration = isCollegiate && details.institution === FREE_REGISTRATION_INSTITUTION;

    const visibleEvents = events.filter((ev) =>
        isCategoryVisible(ev.category, { isCollegiate, ageGroup: details.age_group, experienceLevel: bio.experience_level })
    );
    const visibleEventIds = new Set(visibleEvents.map((ev) => ev.id));
    // Drops any selection that's no longer visible (e.g. registrant went back and changed
    // age group/experience level after picking events) so pricing/validation never counts it.
    const selectedEventIds = eventSelection.event_ids.filter((id) => visibleEventIds.has(id));
    const selectedEvents = visibleEvents.filter((ev) => selectedEventIds.includes(ev.id));

    const grandChampionEligible = selectedEventIds.length >= GRAND_CHAMPION_MIN_EVENTS && bio.experience_level === 'Advanced';
    const grandChampionOffered = !!settings?.grand_champion_enabled && !isFreeUmdRegistration;

    const discount = isCollegiate ? collegiateDiscount : 0;
    const firstEventBase = Math.max(0, basePrice - discount);
    const firstEventPriced = isEarlyBird ? firstEventBase : firstEventBase + lateFee;
    const additionalEventsCount = Math.max(0, selectedEventIds.length - 1);
    const additionalEventsCost = additionalEventsCount * pricePerEvent;
    const grandChampionCost = grandChampionOffered && grandChampion && grandChampionEligible ? grandChampionFee : 0;
    const estimatedTotal = isFreeUmdRegistration
        ? 0
        : Math.max(0, firstEventPriced + additionalEventsCost + grandChampionCost);

    const groupedEvents = visibleEvents.reduce((acc, ev) => {
        const key = ev.category || 'Events';
        if (!acc[key]) acc[key] = [];
        acc[key].push(ev);
        return acc;
    }, {});

    const handleBioChange = (e) => {
        setBio({ ...bio, [e.target.name]: e.target.value });
    };

    const handleBioSubmit = (e) => {
        e.preventDefault();
        const { first_name, last_name, email, gender, experience_level, collegiate_status } = bio;

        if (!first_name.trim() || !last_name.trim() || !email.trim() || !gender || !experience_level || !collegiate_status) {
            setError('Please fill out all fields.');
            return;
        }
        if (!EMAIL_REGEX.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (collegiate_status === 'Collegiate' && !email.trim().toLowerCase().endsWith('.edu')) {
            setError('Collegiate competitors please enter an .edu email address');
            return;
        }

        setError('');
        setStep('details');
    };

    const handleDetailsSubmit = async (e) => {
        e.preventDefault();
        if (!details.age_group) {
            setError('Please select an age group.');
            return;
        }
        if (!details.institution) {
            setError(`Please select your ${institutionLabel.toLowerCase()}.`);
            return;
        }
        if (details.institution === 'Other' && !details.institution_other.trim()) {
            setError(`Please enter your ${institutionLabel.toLowerCase()}.`);
            return;
        }

        setError('');

        if (!isCollegiate) {
            setStep('events');
            return;
        }

        setSendingCode(true);
        try {
            await api.post('/verify/send-code', { email: bio.email.trim() });
            setStep('verify');
        } catch (err) {
            setError(err.message);
        } finally {
            setSendingCode(false);
        }
    };

    const handleResendCode = async () => {
        setError('');
        setSendingCode(true);
        try {
            await api.post('/verify/send-code', { email: bio.email.trim() });
        } catch (err) {
            setError(err.message);
        } finally {
            setSendingCode(false);
        }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        if (!verifyCode.trim()) {
            setError('Please enter the code we emailed you.');
            return;
        }

        setError('');
        setVerifyingCode(true);
        try {
            const data = await api.post('/verify/check-code', { email: bio.email.trim(), code: verifyCode.trim() });
            if (!data?.verified) {
                setError('Incorrect code. Please try again.');
                return;
            }
            setStep('events');
        } catch (err) {
            setError(err.message);
        } finally {
            setVerifyingCode(false);
        }
    };

    const toggleEvent = (eventId) => {
        setEventSelection((s) => ({
            event_ids: s.event_ids.includes(eventId)
                ? s.event_ids.filter((id) => id !== eventId)
                : [...s.event_ids, eventId],
        }));
    };

    const handleEventsSubmit = (e) => {
        e.preventDefault();
        if (selectedEventIds.length === 0) {
            setError('Please select at least one event.');
            return;
        }
        setError('');
        setStep('waiver');
    };

    const handleWaiverSubmit = (e) => {
        e.preventDefault();
        if (!waiverAccepted) {
            setError('Please read and accept the terms and conditions in its entirety.');
            return;
        }
        if (isMinor && !parentGuardianName.trim()) {
            setError('Please enter the Parent/Guardian name.');
            return;
        }
        setError('');
        setStep('confirm');
    };

    const sendConfirmationEmail = async (registration) => {
        const serviceId = import.meta.env.VITE_EMAILJS_CONFIRMATION_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        try {
            await emailjs.send(serviceId, templateId, {
                to_email: registration.email,
                to_name: `${registration.first_name} ${registration.last_name}`,
                age_group: registration.age_group,
                gender: registration.gender,
                experience_level: registration.experience_level,
                school: registration.institution,
                events: selectedEvents.map((ev) => ev.name).join(', '),
                amount_due: registration.amount_due.toFixed(2),
                payment_status: registration.payment_status,
                event_number: settings?.event_number || '',
                uwg_day: settings?.uwg_day || '',
                pay_link: `${window.location.origin}/tournament/pay?code=${registration.checkin_code}`,
            }, publicKey);
        } catch (err) {
            // Registration already succeeded server-side — a failed confirmation email
            // shouldn't block the registrant from seeing their success page.
            console.error('Failed to send confirmation email:', err);
        }
    };

    const handleFinalRegister = async (e) => {
        e.preventDefault();
        if (!captchaToken) {
            setError('Please complete the reCAPTCHA check.');
            return;
        }

        setError('');
        setSubmitting(true);
        try {
            const institution = details.institution === 'Other' ? details.institution_other.trim() : details.institution;

            const registration = await api.post('/registrations', {
                first_name: bio.first_name.trim(),
                last_name: bio.last_name.trim(),
                email: bio.email.trim(),
                gender: bio.gender,
                experience_level: bio.experience_level,
                collegiate_status: bio.collegiate_status,
                age_group: details.age_group,
                institution,
                amount_due: estimatedTotal,
                event_ids: selectedEventIds,
                waiver_accepted: true,
                parental_consent_required: isMinor,
                parent_guardian_name: isMinor ? parentGuardianName.trim() : undefined,
                grand_champion: grandChampionOffered && grandChampion && grandChampionEligible,
            });

            setFinalRegistration(registration);
            await sendConfirmationEmail(registration);
            setStep('success');
        } catch (err) {
            if (err.data?.duplicate) {
                setStep('duplicate');
            } else {
                console.error('Error submitting registration:', err);
                setError('Something went wrong submitting your registration. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

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

            <div className="flex flex-col items-center px-4 py-12" style={{ gap: "1.5rem" }}>
                <div style={{ maxWidth: "560px", width: "100%", textAlign: "center" }}>
                    <h1
                        style={{
                            fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                            lineHeight: 1.1,
                            color: "#1A1A1A",
                            marginBottom: "1rem",
                        }}
                    >
                        {" "}
                        {settings?.event_number} {/* event number here, ## + th / st / nd / rd  */}
                        UWG Registration
                    </h1>
                </div>
                <div
                        style={{
                            fontSize: "1rem",
                            lineHeight: 1.75,
                            color: "#444",
                            maxWidth: "75%",
                            margin: "0 auto",
                            textAlign: "center",
                        }}
                    >
                        Welcome to the registration site for the {' '} {settings?.event_number} {' '} Annual University Wushu Games organized by TerpWushu at the University of Maryland!
                        <br /><br />
                        <strong>Early Registration</strong> ends {' '}
                            {earlyEnds ? earlyEnds.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'TBA'}
                        <br></br>
                        <strong>Late Registration</strong> ends {' '}
                            {lateEnds ? lateEnds.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'TBA'}
                        <br></br>
                        For collegiate competitors, the early registration fee is ${collegiateFirstEventPrice} for the first event.{' '}
                        <br></br>For non-collegiate competitors, the early registration fee is ${basePrice} for the first event.{' '}
                        <br></br>Each additional event costs ${pricePerEvent}
                    </div>

                <div style={{ maxWidth: "560px", width: "100%" }}>
                    {loadError ? (
                        <div style={CARD_STYLE}>
                            <div className="p-3 bg-rose-50 text-rose-800 rounded-lg text-center text-sm border border-rose-200">
                                {loadError}
                            </div>
                        </div>
                    ) : !settings ? (
                        <div style={CARD_STYLE}>
                            <p className="text-zinc-400 text-sm text-center">Loading registration details...</p>
                        </div>
                    ) : hasRegClosed ? (
                        <div style={CARD_STYLE}>
                            <div className="p-3 bg-zinc-100 text-zinc-500 rounded-lg text-center font-bold border border-zinc-200 text-sm">
                                Registration has passed
                            </div>
                            <div className="text-center mt-4">
                                <Link to="/tournament" style={{ color: "#1A73E8", textDecoration: "underline" }}>Back to UWG</Link>
                            </div>
                        </div>
                    ) : !hasRegStarted ? (
                        <div style={CARD_STYLE}>
                            <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-center text-sm border border-amber-200">
                                Registration opens {regBegins ? regBegins.toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'soon!'}
                            </div>
                            <div className="text-center mt-4">
                                <Link to="/tournament" style={{ color: "#1A73E8", textDecoration: "underline" }}>Back to UWG</Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {step === 'bio' && (
                                <form onSubmit={handleBioSubmit} className="flex flex-col gap-4" style={CARD_STYLE}>
                                    <h2 style={HEADING_STYLE}>Step 1 of 5: Your Information</h2>

                                    <div className="flex flex-col gap-1">
                                        <label style={LABEL_STYLE}>First Name</label>
                                        <input type="text" name="first_name" value={bio.first_name} onChange={handleBioChange} style={INPUT_STYLE} />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label style={LABEL_STYLE}>Last Name</label>
                                        <input type="text" name="last_name" value={bio.last_name} onChange={handleBioChange} style={INPUT_STYLE} />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label style={LABEL_STYLE}>Email</label>
                                        <input type="email" name="email" value={bio.email} onChange={handleBioChange} style={INPUT_STYLE} />
                                        {isCollegiate && (
                                            <span style={{ fontSize: '12px', color: '#666' }}>Collegiate competitors must use a .edu email address.</span>
                                        )}
                                    </div>

                                    <RadioGroup label="Gender" name="gender" value={bio.gender} onChange={handleBioChange} options={['M', 'F']} />
                                    <RadioGroup label="Experience Level" name="experience_level" value={bio.experience_level} onChange={handleBioChange} options={['Beginner', 'Intermediate', 'Advanced']} />
                                    <RadioGroup label="Collegiate Status" name="collegiate_status" value={bio.collegiate_status} onChange={handleBioChange} options={['Collegiate', 'Non-Collegiate']} />

                                    <StatusBanner status={{ type: 'error', message: error }} />

                                    <button
                                        type="submit"
                                        style={{ background: '#a12222', color: '#fff', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                                    >
                                        Continue
                                    </button>
                                </form>
                            )}

                            {step === 'details' && (
                                <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-4" style={CARD_STYLE}>
                                    <h2 style={HEADING_STYLE}>Step 2 of 5: Division & {institutionLabel}</h2>

                                    <div className="flex flex-col gap-1">
                                        <label style={LABEL_STYLE}>Age Group</label>
                                        {!isCollegiate && (
                                            <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6, margin: '0 0 0.25rem' }}>
                                                Group A may choose to compete in the 3rd Set of International Competition Routine events.
                                                <br />
                                                Group B may choose to compete in the 1st Set of International Competition Routine events.
                                                <br />
                                                Group C may choose to compete in the No. 3 Elementary Routine events.
                                                <br />
                                                <strong>Minimum age for competitors is 5 years old.</strong>
                                            </p>
                                        )}
                                        <select
                                            name="age_group"
                                            value={details.age_group}
                                            onChange={(e) => setDetails({ ...details, age_group: e.target.value })}
                                            style={INPUT_STYLE}
                                        >
                                            <option value="">Select an age group</option>
                                            {ageGroupOptions.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label style={LABEL_STYLE}>{institutionLabel}</label>
                                        <select
                                            name="institution"
                                            value={details.institution}
                                            onChange={(e) => setDetails({ ...details, institution: e.target.value, institution_other: '' })}
                                            style={INPUT_STYLE}
                                        >
                                            <option value="">Select your {institutionLabel.toLowerCase()}</option>
                                            {institutionOptions.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        {details.institution === 'Other' && (
                                            <input
                                                type="text"
                                                placeholder={`Enter your ${institutionLabel.toLowerCase()}`}
                                                value={details.institution_other}
                                                onChange={(e) => setDetails({ ...details, institution_other: e.target.value })}
                                                style={INPUT_STYLE}
                                            />
                                        )}
                                    </div>

                                    <StatusBanner status={{ type: 'error', message: error }} />

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { setError(''); setStep('bio'); }}
                                            style={{ background: '#fff', color: '#a12222', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, border: '1px solid #a12222', cursor: 'pointer', flex: '0 0 auto' }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={sendingCode}
                                            style={{ background: '#a12222', color: '#fff', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: sendingCode ? 'not-allowed' : 'pointer', opacity: sendingCode ? 0.7 : 1, flex: '1 1 auto' }}
                                        >
                                            {sendingCode ? 'Sending code...' : 'Continue'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 'verify' && (
                                <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4" style={CARD_STYLE}>
                                    <h2 style={HEADING_STYLE}>Verify Your Email</h2>
                                    <p style={{ fontSize: '0.9375rem', color: '#333', lineHeight: 1.6 }}>
                                        We sent a 6-digit code to <strong>{bio.email}</strong>. Enter it below to continue.
                                    </p>

                                    <div className="flex flex-col gap-1">
                                        <label style={LABEL_STYLE}>Verification Code</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={verifyCode}
                                            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                                            style={{ ...INPUT_STYLE, textAlign: 'center', letterSpacing: '0.3em', fontSize: '20px' }}
                                            placeholder="000000"
                                        />
                                    </div>

                                    <StatusBanner status={{ type: 'error', message: error }} />

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { setError(''); setVerifyCode(''); setStep('details'); }}
                                            style={{ background: '#fff', color: '#a12222', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, border: '1px solid #a12222', cursor: 'pointer', flex: '0 0 auto' }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={verifyingCode}
                                            style={{ background: '#a12222', color: '#fff', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: verifyingCode ? 'not-allowed' : 'pointer', opacity: verifyingCode ? 0.7 : 1, flex: '1 1 auto' }}
                                        >
                                            {verifyingCode ? 'Verifying...' : 'Verify'}
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        disabled={sendingCode}
                                        style={{ background: 'none', border: 'none', color: '#1A73E8', textDecoration: 'underline', cursor: sendingCode ? 'not-allowed' : 'pointer', fontSize: '13px', alignSelf: 'center' }}
                                    >
                                        {sendingCode ? 'Sending...' : "Didn't get a code? Resend"}
                                    </button>
                                </form>
                            )}

                            {step === 'events' && (
                                <form onSubmit={handleEventsSubmit} className="flex flex-col gap-4" style={CARD_STYLE}>
                                    <h2 style={HEADING_STYLE}>Step 3 of 5: Select Events</h2>

                                    <div className="flex flex-col gap-2">
                                        {events.length === 0 ? (
                                            <p className="text-zinc-400 text-sm">No events are available to register for yet. Please check back soon.</p>
                                        ) : (
                                            Object.entries(groupedEvents).map(([category, categoryEvents]) => {
                                                const compulsoryInfo = COMPULSORY_CATEGORY_INFO[category];
                                                return (
                                                    <div key={category} className="flex flex-col gap-1 mb-2">
                                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#8B1A1A', textTransform: 'uppercase' }}>
                                                            {compulsoryInfo ? `${category} (${compulsoryInfo.titleLabel})` : category}
                                                        </span>
                                                        {compulsoryInfo && (
                                                            <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.6, margin: '0 0 0.25rem' }}>
                                                                These events will be conducted in accordance with the{' '}
                                                                <a
                                                                    href="/docs/WUSHU-TAOLU-COMPETITION-RULES-AND-JUDGING-METHODS-2024.pdf"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{ color: '#1A73E8', textDecoration: 'underline' }}
                                                                >
                                                                    IWUF Rules for International Wushu Taolu Competition (2024)
                                                                </a>{' '}
                                                                and utilize the Non-Degree of Difficulty Scoring Method, comprising of
                                                                <br></br>- A Score (Quality of Movements Scoring) &
                                                                <br></br>- B Score (Overall Performance Scoring) only.
                                                                {' '}<br></br>There is no time requirement for these events.
                                                                {' '}<br></br>These events are ONLY for the taolu from the {compulsoryInfo.bodyLabel}.
                                                                <br></br>Additional event selections are available in the next section.
                                                            </p>
                                                        )}
                                                        {category === 'Nandu Events' && (
                                                            <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.6, margin: '0 0 0.25rem' }}>
                                                                Nandu (Degree of Difficulty) scoring based on 3 categories that are judged separately by different judging panels:
                                                                <ul style={{ margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
                                                                    - A Score (Quality of Movements Scoring)
                                                                    <br></br>- B Score (Overall Performance Scoring)
                                                                    <br></br>- C Score (Evaluation of Nandu)
                                                                </ul>
                                                                These events will be conducted in accordance with the{' '}
                                                                <a
                                                                    href="/docs/WUSHU-TAOLU-COMPETITION-RULES-AND-JUDGING-METHODS-2024.pdf"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{ color: '#1A73E8', textDecoration: 'underline' }}
                                                                >
                                                                    IWUF Rules for International Wushu Taolu Competition <strong>(2024 Rules)</strong>
                                                                </a>
                                                                <br />
                                                                <strong>NEW: Nandu Events are now open age.</strong>
                                                            </div>
                                                        )}
                                                        {categoryEvents.some((ev) => ev.subcategory) ? (
                                                            Object.entries(
                                                                categoryEvents.reduce((acc, ev) => {
                                                                    const key = ev.subcategory || 'Other';
                                                                    if (!acc[key]) acc[key] = [];
                                                                    acc[key].push(ev);
                                                                    return acc;
                                                                }, {})
                                                            ).map(([subcategory, subcategoryEvents]) => (
                                                                <div key={subcategory} className="flex flex-col gap-1 mb-1">
                                                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#8B1A1A' }}>
                                                                        {compulsoryInfo ? `${compulsoryInfo.subcategoryPrefix} ${subcategory}` : subcategory}
                                                                    </span>
                                                                    {subcategoryEvents.map((ev) => (
                                                                        <label key={ev.id} className="flex items-center gap-2 ml-2" style={{ fontSize: '15px', color: '#333', cursor: 'pointer' }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={eventSelection.event_ids.includes(ev.id)}
                                                                                onChange={() => toggleEvent(ev.id)}
                                                                            />
                                                                            {ev.name}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            categoryEvents.map((ev) => (
                                                                <label key={ev.id} className="flex items-center gap-2" style={{ fontSize: '15px', color: '#333', cursor: 'pointer' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={eventSelection.event_ids.includes(ev.id)}
                                                                        onChange={() => toggleEvent(ev.id)}
                                                                    />
                                                                    {ev.name}
                                                                </label>
                                                            ))
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    <StatusBanner status={{ type: 'error', message: error }} />

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { setError(''); setStep('details'); }}
                                            style={{ background: '#fff', color: '#a12222', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, border: '1px solid #a12222', cursor: 'pointer', flex: '0 0 auto' }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            style={{ background: '#a12222', color: '#fff', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer', flex: '1 1 auto' }}
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 'waiver' && (
                                <form onSubmit={handleWaiverSubmit} className="flex flex-col gap-4" style={CARD_STYLE}>
                                    <h2 style={HEADING_STYLE}>
                                        Step 4 of 5: {isMinor ? 'Parental Release and Informed Consent Form' : 'Sport Clubs Release and Informed Consent Form'}
                                    </h2>

                                    {isMinor ? (
                                        <p style={{ fontSize: '0.875rem', color: '#333', lineHeight: 1.7, textAlign: 'justify' }}>
                                            I, on behalf of my minor child, <strong>{bio.first_name} {bio.last_name}</strong>, desire for my minor child to participate in Wushu activities during the University Wushu Games (the "Event"), to be held at the University of Maryland ("the University"){settings?.uwg_day ? ` on ${settings.uwg_day}` : ''}. In consideration of my child being permitted to participate in this activity, I, for and on behalf of my minor child and myself, our heirs, personal representative(s) and assigns, hereby represent and agree as follows:
                                        </p>
                                    ) : (
                                        <p style={{ fontSize: '0.875rem', color: '#333', lineHeight: 1.7, textAlign: 'justify' }}>
                                            I, <strong>{bio.first_name} {bio.last_name}</strong>, desire to participate in the University Wushu Games, hosted by Terp Wushu Club event{settings?.uwg_day ? ` on ${settings.uwg_day}` : ''} at University of Maryland, College Park. In consideration of being permitted to participate in such sport club activities, I, for myself, my heirs, personal representative(s) and assigns hereby represent and agree as follows:
                                        </p>
                                    )}

                                    <ol style={{ fontSize: '0.8125rem', color: '#333', lineHeight: 1.6, textAlign: 'justify', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {(isMinor ? PARENTAL_WAIVER_CLAUSES : WAIVER_CLAUSES).map((clause, i) => (
                                            <li key={i}>{clause}</li>
                                        ))}
                                    </ol>

                                    <label className="flex items-start gap-2" style={{ fontSize: '13px', color: '#333', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={waiverAccepted}
                                            onChange={(e) => setWaiverAccepted(e.target.checked)}
                                            style={{ marginTop: '3px' }}
                                        />
                                        <span>
                                            {isMinor
                                                ? 'I, THE PARENT/GUARDIAN CERTIFY THAT I AM 18 YEARS OF AGE OR OLDER AND THAT I HAVE READ AND FULLY UNDERSTAND THIS RELEASE AND INFORMED CONSENT FORM AND I SIGN IT VOLUNTARILY WITH FULL KNOWLEDGE OF ITS SIGNIFICANCE.'
                                                : <><strong>YES! </strong>I CERTIFY THAT I AM 18 YEARS OF AGE OR OLDER AND THAT I HAVE READ AND FULLY UNDERSTAND THIS RELEASE AND INFORMED CONSENT FORM AND I SIGN IT VOLUNTARILY WITH FULL KNOWLEDGE OF ITS SIGNIFICANCE.</>}
                                        </span>
                                    </label>

                                    {isMinor && (
                                        <div className="flex flex-col gap-1">
                                            <label style={LABEL_STYLE}>Parent/Guardian Name (used as signature)</label>
                                            <input
                                                type="text"
                                                value={parentGuardianName}
                                                onChange={(e) => setParentGuardianName(e.target.value)}
                                                placeholder="Full name"
                                                style={INPUT_STYLE}
                                                required
                                            />
                                        </div>
                                    )}

                                    <StatusBanner status={{ type: 'error', message: error }} />

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { setError(''); setStep('events'); }}
                                            style={{ background: '#fff', color: '#a12222', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, border: '1px solid #a12222', cursor: 'pointer', flex: '0 0 auto' }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            style={{ background: '#a12222', color: '#fff', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer', flex: '1 1 auto' }}
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 'confirm' && (
                                <form onSubmit={handleFinalRegister} className="flex flex-col gap-4" style={CARD_STYLE}>
                                    <h2 style={HEADING_STYLE}>Step 5 of 5: Confirm & Register</h2>

                                    <div style={{ fontSize: '0.9375rem', color: '#333', lineHeight: 1.8 }}>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-600">Name</span><span>{bio.first_name} {bio.last_name}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-600">Email</span><span>{bio.email}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-600">Gender</span><span>{bio.gender}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-600">Experience</span><span>{bio.experience_level}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-600">Age Group</span><span>{details.age_group}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-600">Events</span><span style={{ textAlign: 'right', maxWidth: '60%' }}>{selectedEvents.map((ev) => ev.name).join(', ')}</span></div>
                                    </div>

                                    {grandChampionOffered && (
                                        <div className="flex flex-col gap-1">
                                            <label className="flex items-center gap-2" style={{ fontSize: '14px', color: grandChampionEligible ? '#333' : '#999', cursor: grandChampionEligible ? 'pointer' : 'not-allowed' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={grandChampion}
                                                    disabled={!grandChampionEligible}
                                                    onChange={(e) => setGrandChampion(e.target.checked)}
                                                />
                                                Eligible for Grand Champion (+${grandChampionFee.toFixed(2)})
                                            </label>
                                            <span style={{ fontSize: '12px', color: '#666' }}>
                                                Requires Advanced experience level and at least {GRAND_CHAMPION_MIN_EVENTS} events selected
                                                {!grandChampionEligible
                                                    ? ` (you have ${bio.experience_level || 'no'} experience level and ${selectedEventIds.length} event${selectedEventIds.length === 1 ? '' : 's'} selected)`
                                                    : ''}
                                                .
                                            </span>
                                        </div>
                                    )}

                                    <div style={{ fontSize: '0.9375rem', color: '#333', lineHeight: 1.7 }}>
                                        <div className="flex justify-between"><span>First Event ({isEarlyBird ? 'Early Bird' : 'Regular'})</span><span>${basePrice.toFixed(2)}</span></div>
                                        {discount > 0 && (
                                            <div className="flex justify-between"><span>Collegiate Discount</span><span>-${discount.toFixed(2)}</span></div>
                                        )}
                                        {!isEarlyBird && lateFee > 0 && (
                                            <div className="flex justify-between"><span>Late Fee</span><span>+${lateFee.toFixed(2)}</span></div>
                                        )}
                                        <div className="flex justify-between"><span>Additional Events ({additionalEventsCount} &times; ${pricePerEvent.toFixed(2)})</span><span>${additionalEventsCost.toFixed(2)}</span></div>
                                        {grandChampionCost > 0 && (
                                            <div className="flex justify-between"><span>Grand Champion</span><span>${grandChampionCost.toFixed(2)}</span></div>
                                        )}
                                        <div className="flex justify-between font-bold border-t border-zinc-200 mt-2 pt-2"><span>Total</span><span>${estimatedTotal.toFixed(2)}</span></div>
                                    </div>

                                    <div className="flex justify-center py-2">
                                        <ReCAPTCHA
                                            ref={recaptchaRef}
                                            sitekey={import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY}
                                            onChange={setCaptchaToken}
                                        />
                                    </div>

                                    <StatusBanner status={{ type: 'error', message: error }} />

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { setError(''); setStep('waiver'); }}
                                            style={{ background: '#fff', color: '#a12222', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, border: '1px solid #a12222', cursor: 'pointer', flex: '0 0 auto' }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            style={{ background: '#a12222', color: '#fff', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, flex: '1 1 auto' }}
                                        >
                                            {submitting ? 'Registering...' : 'Register!'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 'duplicate' && (
                                <div className="flex flex-col gap-4" style={CARD_STYLE}>
                                    <h2 style={HEADING_STYLE}>Already Registered</h2>
                                    <p style={{ fontSize: '0.9375rem', color: '#333', lineHeight: 1.7 }}>
                                        Our records indicate that you have registered already. If you are registering for an additional competitor,
                                        please use the back button below to update your name and email address. Please allow up to 30 minutes to
                                        receive a confirmation email for your registration. If you still have not received a confirmation email,
                                        check your spam inbox or reach out via email for support. If you believe that you are receiving this message
                                        in error, please reach out via. email and we will get you registered ASAP.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => { setError(''); setStep('bio'); }}
                                        style={{ background: '#fff', color: '#a12222', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, border: '1px solid #a12222', cursor: 'pointer' }}
                                    >
                                        Back
                                    </button>
                                </div>
                            )}

                            {step === 'success' && finalRegistration && (
                                <div className="flex flex-col gap-4" style={CARD_STYLE}>
                                    <h2 style={HEADING_STYLE}>Thank You!</h2>
                                    <p style={{ fontSize: '0.9375rem', color: '#333', lineHeight: 1.7 }}>
                                        Your registration has been saved. You should receive a confirmation email shortly at the address you provided. (check spam folders!)
                                        <br></br> If you do not receive a confirmation email, please contact us at terpwushu@gmail.com
                                    </p>

                                    <div style={{ fontSize: '0.9375rem', color: '#333', lineHeight: 1.8 }}>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-600">Name</span><span>{finalRegistration.first_name} {finalRegistration.last_name}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-600">Email</span><span>{finalRegistration.email}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-600">Age Group</span><span>{finalRegistration.age_group}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold text-gray-600">Events</span><span style={{ textAlign: 'right', maxWidth: '60%' }}>{selectedEvents.map((ev) => ev.name).join(', ')}</span></div>
                                        <div className="flex justify-between font-bold border-t border-zinc-200 mt-2 pt-2"><span>Amount Due</span><span>${Number(finalRegistration.amount_due).toFixed(2)}</span></div>
                                    </div>

                                    {finalRegistration.payment_status === 'paid' ? (
                                        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-center text-sm border border-emerald-200">
                                            {isFreeUmdRegistration
                                                ? 'No payment needed - your registration is complete!'
                                                : 'Payment received - your registration is complete! Check your email for your check-in code.'}
                                        </div>
                                    ) : (
                                        <div>
                                            <strong style={{ fontSize: '0.9375rem' }}>Pay Now:</strong>
                                            <p style={{ fontSize: '0.875rem', color: '#333', lineHeight: 1.6 }}>
                                                Pay online now with PayPal. Once payment is confirmed, you'll receive your self-service check-in
                                                code by email — use it on the Online Check-In page on competition day instead of waiting in line.
                                            </p>
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <PayPalPayment
                                                    code={finalRegistration.checkin_code}
                                                    onPaid={() => setFinalRegistration((r) => ({ ...r, payment_status: 'paid' }))}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <Link to="/tournament" style={{ color: "#1A73E8", textDecoration: "underline", textAlign: 'center' }}>Back to UWG</Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
