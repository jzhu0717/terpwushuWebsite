import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

function utcToEasternInput(utcString) {
  if (!utcString) return "";
  const date = new Date(utcString);
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });
  
  const parts = formatter.formatToParts(date);
  const p = Object.fromEntries(parts.map(part => [part.type, part.value]));
  
  // Returns the exact "YYYY-MM-DDTHH:mm" format the input requires
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

// 2. Converts Eastern Time (from the input) back to UTC for your database/state
function easternToUTC(dateTimeString) {
  if (!dateTimeString) return "";
  
  const [datePart] = dateTimeString.split('T');
  const tempDate = new Date(`${datePart}T12:00:00`);
  
  // Automatically find if this specific date is -04:00 (EDT) or -05:00 (EST)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    timeZoneName: 'longOffset'
  }).formatToParts(tempDate);
  
  const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value;
  const offset = offsetPart ? offsetPart.replace('GMT', '') : '-04:00'; 
  
  // Combine input time with the calculated offset and output a clean UTC ISO string
  return new Date(`${dateTimeString}:00${offset}`).toISOString();
}

export default function AdminTournament() {
    const [form, setForm] = useState({
        event_number: '',
        uwg_day: '',
        doors_open: '',
        opening_ceremony: '',
        competition_begin: '',
        venue_location: '',
        venue_address: '',
        parking_locations: '',
        livestream_ring_1: '',
        livestream_ring_2: '',
        committee_chief: '',
        collegiate_liaison: '',
        wushu_liaison: '',
        judges_liaison: '',
        design_chair: '',
        visual_tech_chair: '',
        score_contesting: '',
        registration_manager: '',
        ring_coordinator: '',
        webmaster: '',
        reg_begins: '',
        early_reg_ends: '',
        late_reg_ends: '',
        early_reg_price: '',
        late_fee: '',
        collegiate_discount: '',
        price_per_event: ''
    });
  
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        async function loadTournamentSettings() {
            try {
                const { data, error } = await supabase
                    .from('tournament_webpage')
                    .select('*')
                    .eq('id', 1)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;
                if (data) {
                    const normalizedData = {};
                    Object.keys(data).forEach(key => {
                        normalizedData[key] = data[key] ?? '';
                    });
                    setForm(normalizedData);
                }
            } catch (err) {
                console.error("Failed to load settings:", err);
                setMessage({ type: 'error', text: 'Could not fetch tournament configuration.' });
            } finally {
                setLoading(false);
            }
        }
        loadTournamentSettings();
    }, []);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        
        const utcValue = easternToUTC(value);
        
        setForm(prev => ({
            ...prev,
            [name]: utcValue
        }));
    };

    // Helper to flash alert banners
    const showStatus = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const { error } = await supabase
                .from('tournament_webpage')
                .upsert({ id: 1, ...form });

            if (error) throw error;
            setMessage({ type: 'success', text: 'Tournament page settings saved successfully!' });
        } catch (err) {
            console.error("Failed to save settings:", err);
            setMessage({ type: 'error', text: 'Failed to update settings. Please try again.' });
        } finally {
            setSaving(false);
        }
    };
  
    if (loading) {
        return <div className="text-center py-8 text-zinc-400">Loading tournament information...</div>;
    }

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
                Admin Panel
                </span>
            </div>

            <div className="max-w-4xl mx-auto bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        
                <div className="flex-1 bg-white/95 p-6 rounded-xl shadow-lg border border-red-900/10">
                    <h2 className="text-l font-extrabold text-[#611313] mb-1">Update UWG Info</h2>
                </div>

                {message.text && (
                <div className={`p-3 rounded-md mb-6 text-sm font-medium ${
                    message.type === 'success' 
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                    {message.text}
                </div>
                )}

            <form onSubmit={handleSave} className="space-y-4">
                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-200">
                    {/* Core Header Data */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-700 uppercase">Event Number (##th, ##st, ##nd, ##rd)</label>
                            <input type="text" name="event_number" value={form.event_number} onChange={handleChange} placeholder="e.g., 19th" className="p-2 border rounded text-sm w-full" required />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-700 uppercase">UWG Day & Date </label>
                            <input type="text" name="uwg_day" value={form.uwg_day} onChange={handleChange} placeholder="e.g., Saturday, November 15th, 2025" className="p-2 border rounded text-sm w-full" required />
                        </div>
                    </div>

                    {/* Registration times */}
                    <div className="pt-4">
                        <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-3">
                            Registration Times (EDT)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                            
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-600">Registration Begins</label>
                                <input 
                                    type="datetime-local" 
                                    name="reg_begins" 
                                    value={utcToEasternInput(form.reg_begins)} 
                                    onChange={handleDateChange} 
                                    className="p-2 border rounded text-sm" 
                                    required 
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-600">Early Registration Ends</label>
                                <input 
                                    type="datetime-local" 
                                    name="early_reg_ends" 
                                    value={utcToEasternInput(form.early_reg_ends)} 
                                    onChange={handleDateChange} 
                                    className="p-2 border rounded text-sm" 
                                    required 
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-600">Late Registration Ends</label>
                                <input 
                                    type="datetime-local" 
                                    name="late_reg_ends" 
                                    value={utcToEasternInput(form.late_reg_ends)} 
                                    onChange={handleDateChange} 
                                    className="p-2 border rounded text-sm" 
                                    required 
                                />
                            </div>

                        </div>
                    </div>

                    {/* Event Times / Schedule */}
                    <div>
                        <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-3">Event Schedule (Leave blank for TBA)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Doors Open</label>
                                <input type="text" name="doors_open" value={form.doors_open} onChange={handleChange} className="p-2 border rounded text-sm" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Opening Ceremony</label>
                                <input type="text" name="opening_ceremony" value={form.opening_ceremony} onChange={handleChange} className="p-2 border rounded text-sm" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Competition Begin</label>
                                <input type="text" name="competition_begin" value={form.competition_begin} onChange={handleChange} className="p-2 border rounded text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Venue Details */}
                    <div>
                        <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-3">Venue & Parking Locations</h3>
                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-600">Venue Location Name</label>
                                    <input type="text" name="venue_location" value={form.venue_location} onChange={handleChange} className="p-2 border rounded text-sm" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-600">Recommended Parking Lots</label>
                                    <input type="text" name="parking_locations" value={form.parking_locations} onChange={handleChange} className="p-2 border rounded text-sm" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Full Map Street Address</label>
                                <input type="text" name="venue_address" value={form.venue_address} onChange={handleChange} className="p-2 border rounded text-sm w-full" />
                            </div>
                        </div>
                    </div>

                    {/* Livestream Links */}
                    <div>
                        <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-3">Livestream Links (Leave blank to hide)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Ring 1 URL</label>
                                <input type="url" name="livestream_ring_1" value={form.livestream_ring_1} onChange={handleChange} className="p-2 border rounded text-sm" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Ring 2 URL</label>
                                <input type="url" name="livestream_ring_2" value={form.livestream_ring_2} onChange={handleChange} className="p-2 border rounded text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Committee Directory */}
                    <div>
                        <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-3">UWG Committee (Leave blank if N/A)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Committee Chief</label>
                                <input type="text" name="committee_chief" value={form.committee_chief} onChange={handleChange} className="p-2 border rounded text-sm" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Collegiate Schools Liaison</label>
                                <input type="text" name="collegiate_liaison" value={form.collegiate_liaison} onChange={handleChange} className="p-2 border rounded text-sm" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Wushu Schools Liaison</label>
                                <input type="text" name="wushu_liaison" value={form.wushu_liaison} onChange={handleChange} className="p-2 border rounded text-sm" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Judges Liaison</label>
                                <input type="text" name="judges_liaison" value={form.judges_liaison} onChange={handleChange} className="p-2 border rounded text-sm" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Design Chair</label>
                                <input type="text" name="design_chair" value={form.design_chair} onChange={handleChange} className="p-2 border rounded text-sm" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Visual Tech Chair</label>
                                <input type="text" name="visual_tech_chair" value={form.visual_tech_chair} onChange={handleChange} className="p-2 border rounded text-sm" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Score Contesting</label>
                                <input type="text" name="score_contesting" value={form.score_contesting} onChange={handleChange} className="p-2 border rounded text-sm" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Registration Manager</label>
                                <input type="text" name="registration_manager" value={form.registration_manager} onChange={handleChange} className="p-2 border rounded text-sm" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Ring Event Coordinator</label>
                                <input type="text" name="ring_coordinator" value={form.ring_coordinator} onChange={handleChange} className="p-2 border rounded text-sm" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Webmaster</label>
                                <input type="text" name="webmaster" value={form.webmaster} onChange={handleChange} className="p-2 border rounded text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t flex justify-end">
                        <button type="submit" disabled={saving} className="bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition disabled:opacity-50 shadow-md">
                            {saving ? 'Saving Configurations...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
        </div>
    );
}