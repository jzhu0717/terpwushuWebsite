import { useState } from 'react';
import AdminOfficers from './AdminOfficers';
import AdminPractices from './AdminPractices';
import AdminAnnouncements from './AdminAnnouncements';
import AdminTournament from './AdminTournament';
import AdminTournamentArchives from './AdminTournamentArchives';
import Registrations from './RegList';
import EventOrder from './EventBuilder';
import CheckIn from './UWGCheckin';
import DatabaseAdmin from './DatabaseAdmin';
import { api } from '../../apiClient';

export default function AdminDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('announcements');
    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            onLogout();
        }
    };

    const [uwgDropdownOpen, setUwgDropdownOpen] = useState(false);

    const uwgPages = [
        { id: 'tournament', label: 'Edit Tournament Info' },
        { id: 'registration-list', label: 'Registrations' }, // Complete list of tournament registrations & event distributions, can add / edit competitors here too
        { id: 'event-builder', label: 'EventOrder' }, // Event order builder
        { id: 'check-in', label: 'CheckIn' }, // Check in competitors at the check in table. Use during competiton day.
        { id: 'tournament-archives', label: 'Edit Tournament Archives' },
        { id: 'database-admin', label: 'Database Admin' },
        ];

    const isUwgActive = uwgPages.some(p => p.id === activeTab);
    return (
        <div
			className="min-h-screen"
			style={{
				background:
				"linear-gradient(to right, #611313 0%, #a12222 6%, #e58e8e 18%, #E8C5C5 35%, #E8C5C5 65%, #e58e8e 82%, #a12222 94%, #611313 100%)",
			}}
			>
            {/* Internal Admin Navbar */}
            <div className="w-full pt-4 px-4"> 
                <nav className="mx-auto w-fit bg-[#611313] text-white py-2 px-6 flex items-center gap-6 rounded-full shadow-lg">
                    <button onClick={() => setActiveTab('announcements')} className={`text-sm transition-all ${activeTab === 'announcements' ? 'underline font-semibold text-red-200' : 'hover:text-red-200'}`}>Edit Announcements</button>
                    <button onClick={() => setActiveTab('practices')} className={`text-sm transition-all ${activeTab === 'practices' ? 'underline font-semibold text-red-200' : 'hover:text-red-200'}`}>Edit Practice Times</button>
                    <button onClick={() => setActiveTab('officers')} className={`text-sm transition-all ${activeTab === 'officers' ? 'underline font-semibold text-red-200' : 'hover:text-red-200'}`}>Edit Officers</button>
                    <div className="relative">
                        <button
                            onClick={() => setUwgDropdownOpen(!uwgDropdownOpen)}
                            onBlur={() => setTimeout(() => setUwgDropdownOpen(false), 150)}
                            className={`text-sm transition-all flex items-center gap-1 ${isUwgActive ? 'underline font-semibold text-red-200' : 'hover:text-red-200'}`}
                        >
                            UWG Actions
                            <svg
                                className={`w-3 h-3 transition-transform ${uwgDropdownOpen ? 'rotate-180' : ''}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {uwgDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg py-1 min-w-[140px] z-50">
                                {uwgPages.map((page) => (
                                    <button
                                        key={page.id}
                                        onClick={() => {
                                            setActiveTab(page.id);
                                            setUwgDropdownOpen(false);
                                        }}
                                        className={`block w-full text-left px-3 py-2 text-sm transition-all ${
                                            activeTab === page.id ? 'text-red-200 font-semibold' : 'text-white hover:text-red-200 hover:bg-neutral-800'
                                        }`}
                                    >
                                        {page.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            marginLeft: "auto", // Pushes the logout button all the way to the right side
                            backgroundColor: "rgba(255,255,255,0.15)",
                            padding: "0.4rem 0.8rem",
                            borderRadius: "4px",
                            fontSize: "0.85rem"
                        }}
                    >
                        Log Out
                    </button>
                </nav>
            </div>

            {/* Dynamic Content Window */}
            <div className="p-6 flex-1">
                {activeTab === 'announcements' && <AdminAnnouncements />} 
                {activeTab === 'practices' && <AdminPractices />}
                {activeTab === 'officers' && <AdminOfficers />}
                {activeTab === 'tournament' && <AdminTournament />}
                {activeTab === 'tournament-archives' && <AdminTournamentArchives />}
                {activeTab === 'registration-list' && <Registrations />}
                {activeTab === 'event-builder' && <EventOrder />}
                {activeTab === 'check-in' && <CheckIn />}
                {activeTab === 'database-admin' && <DatabaseAdmin />}
            </div>
        </div>
    );
}