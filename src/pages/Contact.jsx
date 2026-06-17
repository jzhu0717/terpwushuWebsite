import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import ReCAPTCHA from 'react-google-recaptcha';

export default function Contact() {
	const recaptchaRef = useRef(null);
	// 1. State configuration for form inputs
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

	// Token tracker state for reCAPTCHA validation
    const [captchaToken, setCaptchaToken] = useState(null);
    
    // 2. UI status handling (loading, success, errors)
    const [status, setStatus] = useState({ loading: false, type: '', message: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

	// Tracks when the user solves the reCAPTCHA puzzle
    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { name, email, message } = formData;

        // Validation Rule 1: Check if boxes are empty
        if (!name.trim() || !email.trim() || !message.trim()) {
            setStatus({ loading: false, type: 'error', message: 'All fields are required.' });
            return;
        }

        // Validation Rule 2: Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus({ loading: false, type: 'error', message: 'Please enter a valid email address.' });
            return;
        }

        // Validation Rule 3: Verify the reCAPTCHA token exists
        if (!captchaToken) {
            setStatus({ loading: false, type: 'error', message: 'Please complete the reCAPTCHA check.' });
            return;
        }

        // Clear errors and start loading state
        setStatus({ loading: true, type: '', message: '' });

        // EmailJS Credentials Configuration
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
                    src="/contact/spearfishing.jpg" 
                    alt="Contact Us!"
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
						Contact
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
						<strong>Contact our team using the form below:</strong>
					</p>
				</div>

				{/* Contact form */}
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

			</div>
		</div>
	);
}
