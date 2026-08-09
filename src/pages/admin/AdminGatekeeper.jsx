import { useEffect, useState } from 'react';
import { api } from '../../apiClient';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminGatekeeper() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'instant'
        });
    }, [loggedIn]);

    useEffect(() => {
        api.get('/auth/session')
            .then((data) => setLoggedIn(!!data.loggedIn))
            .catch(() => setLoggedIn(false))
            .finally(() => setLoading(false));
    }, []);

    // While waiting to check if user is logged in, show a blank or loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white bg-[#1a0303]">
                <p>Verifying secure session...</p>
            </div>
        );
    }

    return loggedIn
        ? <AdminDashboard onLogout={() => setLoggedIn(false)} />
        : <AdminLogin onLoginSuccess={() => setLoggedIn(true)} />;
}
