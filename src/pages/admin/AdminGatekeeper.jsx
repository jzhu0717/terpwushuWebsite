import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminGatekeeper() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'instant' 
        });
    }, [session]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // While waiting to check if user is logged in, show a blank or loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white bg-[#1a0303]">
                <p>Verifying secure session...</p>
            </div>
        );
    }

    return session ? <AdminDashboard /> : <AdminLogin />;
}