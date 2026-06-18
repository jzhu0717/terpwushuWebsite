import { useState } from 'react';
import AdminOfficers from './AdminOfficers';
import AdminPractices from './AdminPractices';
import AdminAnnouncements from './AdminAnnouncements';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('announcements');

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
                </nav>
            </div>

            {/* Dynamic Content Window */}
            <div className="p-6 flex-1">
                {activeTab === 'announcements' && <AdminAnnouncements />} 
                {activeTab === 'practices' && <AdminPractices />}
                {activeTab === 'officers' && <AdminOfficers />}
            </div>
        </div>
    );
}