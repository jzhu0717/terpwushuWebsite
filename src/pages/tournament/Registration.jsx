import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { api } from '../../apiClient';

const NON_COLLEGIATE_AGE_GROUPS = [
    "Child (Up to 6 Years Old)",
    "Youth (Up to 8 Years Old)",
    "Group C (Up to 11 Years Old)",
    "Group B (Up to 14 Years Old)",
    "Group A (Up to 17 Years Old)",
    "Adult I (Ages 18-30)",
    "Adult II (Ages 30+)",
];

const COLLEGIATE_AGE_GROUPS = [
    "Adult I (Ages 18-30)",
    "Adult II (Ages 30+)",
];

const WUSHU_SCHOOLS = [
    "Full Circle Martial Arts Academy",
    "Goh's Kung Fu",
    "GOSU Inst. Chinese Martial Arts",
    "Hao Taichi Wellness",
    "NOVA Wushu Academy",
    "O-mei Wushu Center",
    "Professional Martial Arts Academy",
    "Taichi Kung-Fu Academy",
    "United States Wushu Academy",
    "Win-Win KungFu Culture Center",
    "Wushu Kung Fu Fitness Center",
    "Wushu Taekwon-Do Academy",
    "Zen Wushu Academy",
    "No School",
    "Other",
];

const COLLEGES = [
    "Boston University",
    "Columbia University",
    "Cornell University",
    "George Mason University",
    "Georgia Institute of Technology",
    "Harvard University",
    "Illinois University",
    "Massachusetts Institute of Technology",
    "Northern Arizona University",
    "Ohio State University",
    "Rutgers University",
    "San Jose State University",
    "Stanford University",
    "University of California, Berkeley",
    "University of California, Davis",
    "University of California, Irvine",
    "University of California, Los Angeles",
    "University of California, San Diego",
    "University of Houston",
    "University of Maryland College Park",
    "University of Maryland Baltimore County",
    "University of Massachusetts Amherst",
    "University of Oregon",
    "University of Pittsburgh",
    "University of Texas at Austin",
    "University of Virginia",
    "University of Washington",
    "Virginia Commonwealth University",
    "Virginia Tech",
    "Wellesley College",
    "Yale University",
    "Other",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    const [step, setStep] = useState('bio'); // bio | details | verify | events | payment | success
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [verifyCode, setVerifyCode] = useState('');
    const [sendingCode, setSendingCode] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);

    const [registrationId, setRegistrationId] = useState(null);
    const [paidAmount, setPaidAmount] = useState(0);

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
    }, []);

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

    const baseCost = isEarlyBird ? basePrice : basePrice + lateFee;
    const eventsCost = pricePerEvent * eventSelection.event_ids.length;
    const discount = bio.collegiate_status === 'Collegiate' ? collegiateDiscount : 0;
    const estimatedTotal = Math.max(0, baseCost + eventsCost - discount);

    const isCollegiate = bio.collegiate_status === 'Collegiate';
    const ageGroupOptions = isCollegiate ? COLLEGIATE_AGE_GROUPS : NON_COLLEGIATE_AGE_GROUPS;
    const institutionOptions = isCollegiate ? COLLEGES : WUSHU_SCHOOLS;
    const institutionLabel = isCollegiate ? 'College' : 'Wushu School';

    const groupedEvents = events.reduce((acc, ev) => {
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

    const handleEventsSubmit = async (e) => {
        e.preventDefault();
        if (eventSelection.event_ids.length === 0) {
            setError('Please select at least one event.');
            return;
        }
        if (!captchaToken) {
            setError('Please complete the reCAPTCHA check.');
            return;
        }

        setError('');
        setSubmitting(true);
        try {
            const institution = details.institution === 'Other' ? details.institution_other.trim() : details.institution;

            const regRow = await api.post('/registrations', {
                first_name: bio.first_name.trim(),
                last_name: bio.last_name.trim(),
                email: bio.email.trim(),
                gender: bio.gender,
                experience_level: bio.experience_level,
                collegiate_status: bio.collegiate_status,
                age_group: details.age_group,
                institution,
                amount_due: estimatedTotal,
            });

            await api.post(`/registrations/${regRow.id}/events`, { event_ids: eventSelection.event_ids });

            setRegistrationId(regRow.id);
            setStep('payment');
        } catch (err) {
            console.error('Error submitting registration:', err);
            setError('Something went wrong submitting your registration. Please try again.');
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
                            textAlign: "left",
                        }}
                    >
                        Welcome to the registration site for the {" "}
                        {settings?.event_number} {/* event number here, ## + th / st / nd / rd  */}
                        Annual University Wushu Games organized by TerpWushu at the University of Maryland!
                        <br /><br />
                        <strong>Early Registration</strong> ends {' '}
                            {earlyEnds.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
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
                                    <h2 style={HEADING_STYLE}>Step 1 of 4: Your Information</h2>

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
                                    <h2 style={HEADING_STYLE}>Step 2 of 4: Division & {institutionLabel}</h2>

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
                                    <h2 style={HEADING_STYLE}>Step 3 of 4: Select Events</h2>

                                    <div className="flex flex-col gap-2">
                                        {events.length === 0 ? (
                                            <p className="text-zinc-400 text-sm">No events are available to register for yet. Please check back soon.</p>
                                        ) : (
                                            Object.entries(groupedEvents).map(([category, categoryEvents]) => (
                                                <div key={category} className="flex flex-col gap-1 mb-2">
                                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#8B1A1A', textTransform: 'uppercase' }}>{category}</span>
                                                    {categoryEvents.map((ev) => (
                                                        <label key={ev.id} className="flex items-center gap-2" style={{ fontSize: '15px', color: '#333', cursor: 'pointer' }}>
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
                                        )}
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
                                            onClick={() => { setError(''); setStep('details'); }}
                                            style={{ background: '#fff', color: '#a12222', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, border: '1px solid #a12222', cursor: 'pointer', flex: '0 0 auto' }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            style={{ background: '#a12222', color: '#fff', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, flex: '1 1 auto' }}
                                        >
                                            {submitting ? 'Submitting...' : `Continue to Payment ($${estimatedTotal.toFixed(2)})`}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 'payment' && (
                                <div className="flex flex-col gap-4" style={CARD_STYLE}>
                                    <h2 style={HEADING_STYLE}>Step 4 of 4: Payment</h2>

                                    <div style={{ fontSize: '0.9375rem', color: '#333', lineHeight: 1.7 }}>
                                        <div className="flex justify-between"><span>Registration ({isEarlyBird ? 'Early Bird' : 'Regular'})</span><span>${baseCost.toFixed(2)}</span></div>
                                        <div className="flex justify-between"><span>Events ({eventSelection.event_ids.length} &times; ${pricePerEvent.toFixed(2)})</span><span>${eventsCost.toFixed(2)}</span></div>
                                        {discount > 0 && (
                                            <div className="flex justify-between"><span>Collegiate Discount</span><span>-${discount.toFixed(2)}</span></div>
                                        )}
                                        <div className="flex justify-between font-bold border-t border-zinc-200 mt-2 pt-2"><span>Total</span><span>${estimatedTotal.toFixed(2)}</span></div>
                                    </div>

                                    <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID, currency: 'USD' }}>
                                        <PayPalButtons
                                            style={{ layout: 'vertical' }}
                                            createOrder={async () => {
                                                try {
                                                    const data = await api.post('/paypal/create-order', { registrationId });
                                                    return data.orderID;
                                                } catch (err) {
                                                    setError(err.message || 'Could not start payment. Please try again.');
                                                    throw err;
                                                }
                                            }}
                                            onApprove={async (data) => {
                                                try {
                                                    const captureData = await api.post('/paypal/capture-order', {
                                                        registrationId,
                                                        orderID: data.orderID,
                                                    });
                                                    if (captureData?.status !== 'paid') {
                                                        setError('Payment could not be confirmed. Please contact us if you were charged.');
                                                        return;
                                                    }
                                                    setPaidAmount(estimatedTotal);
                                                    setStep('success');
                                                } catch (err) {
                                                    setError(err.message || 'Payment could not be confirmed. Please contact us if you were charged.');
                                                }
                                            }}
                                            onError={() => setError('There was a problem processing your payment. Please try again.')}
                                        />
                                    </PayPalScriptProvider>

                                    <StatusBanner status={{ type: 'error', message: error }} />
                                </div>
                            )}

                            {step === 'success' && (
                                <div className="flex flex-col gap-4 text-center" style={CARD_STYLE}>
                                    <h2 style={HEADING_STYLE}>You're Registered!</h2>
                                    <p style={{ fontSize: '0.9375rem', color: '#333', lineHeight: 1.7 }}>
                                        Thanks, {bio.first_name}! Your payment of ${paidAmount.toFixed(2)} was received and your registration for the University Wushu Games is complete.
                                    </p>
                                    <Link to="/tournament" style={{ color: "#1A73E8", textDecoration: "underline" }}>Back to UWG</Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
