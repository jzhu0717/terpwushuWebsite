import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
	const navigate = useNavigate();

	useEffect(() => {
		const timeout = setTimeout(() => navigate('/'), 2000);
		return () => clearTimeout(timeout);
	}, [navigate]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<h1 className="text-2xl font-bold text-center">Page not found. Redirecting...</h1>
		</div>
	);
}
