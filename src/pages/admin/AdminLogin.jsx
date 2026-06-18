import { useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        // "admin@tw.local" under the hood.
        const synthesizedEmail = `${username.trim().toLowerCase()}@tw.local`;

        const { error } = await supabase.auth.signInWithPassword({
            email: synthesizedEmail,
            password: password,
        });

        if (error) {
            const clearMessage = error.message === "Invalid login credentials" 
                ? "Invalid username or password." 
                : error.message;
                
            setErrorMessage(clearMessage);
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                background:
                    "linear-gradient(to right, #611313 0%, #a12222 6%, #e58e8e 18%, #E8C5C5 35%, #E8C5C5 65%, #e58e8e 82%, #a12222 94%, #611313 100%)",
            }}
        >
            <div 
                style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    padding: "2.5rem 2rem",
                    borderRadius: "12px",
                    maxWidth: "400px",
                    width: "100%",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                }}
            >
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#611313", marginBottom: "0.5rem", textAlign: "center" }}>
                    Admin Login
                </h2>

                {errorMessage && (
                    <div style={{ backgroundColor: "#f8d7da", color: "#721c24", padding: "0.75rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.85rem", border: "1px solid #f5c6cb" }}>
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
                        Username
                        <input 
                            type="text" 
                            required
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username"
                            style={inputStyle}
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
                        Password
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="password"
                            style={inputStyle}
                        />
                    </label>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? '#a15555' : '#611313',
                            color: 'white',
                            fontWeight: 700,
                            padding: '0.75rem',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginTop: '0.5rem',
                            transition: 'background-color 0.15s'
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const inputStyle = {
    padding: "0.6rem 0.75rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "0.95rem",
    fontWeight: "normal",
    outlineColor: "#611313",
    marginTop: "0.25rem"
};