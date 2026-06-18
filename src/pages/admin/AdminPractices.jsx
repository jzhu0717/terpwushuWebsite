import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const DAYS_OF_WEEK = [
   'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function AdminPractices() {
    const [schedule, setSchedule] = useState(
    DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = { checked: false, startTime: '', endTime: '', location: '' };
      return acc;
    }, {})
  );
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 1. Fetch current schedule from Supabase on mount
  useEffect(() => {
    async function fetchSchedule() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('practices')
          .select('*');

        if (error) throw error;

        if (data && data.length > 0) {
          // Clone our blank base schedule
          const updatedSchedule = { ...schedule };
          
          data.forEach(row => {
            if (updatedSchedule[row.day]) {
              // Split '6:00 PM - 8:00 PM' back into two textboxes if it fits our format
              const times = row.time_range.split(' - ');
              updatedSchedule[row.day] = {
                checked: true,
                startTime: times[0] || '',
                endTime: times[1] || '',
                location: row.location
              };
            }
          });
          setSchedule(updatedSchedule);
        }
      } catch (err) {
        console.error('Error fetching practices:', err);
        showStatus('Failed to load practice times.', 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
  }, []);

  // Helper to flash alert banners
  const showStatus = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // 2. Handle state updates when inputs change
  const handleCheckboxChange = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], checked: !prev[day].checked }
    }));
  };

  const handleInputChange = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  // 3. Save everything to the database
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Filter down to only the rows the user checked
      const activeRows = Object.entries(schedule)
        .filter(([_, data]) => data.checked)
        .map(([day, data]) => {
          // Combine the 2 time textboxes into our database's single string format
          const formattedTime = `${data.startTime.trim()} - ${data.endTime.trim()}`;
          return {
            day,
            time_range: formattedTime,
            location: data.location.trim()
          };
        });

      // Simple sync approach: clear out the old schedule and insert the fresh configured one
      const { error: deleteError } = await supabase
        .from('practices')
        .delete()
        .neq('id', -1); // Deletes all rows safely

      if (deleteError) throw deleteError;

      if (activeRows.length > 0) {
        const { error: insertError } = await supabase
          .from('practices')
          .insert(activeRows);

        if (insertError) throw insertError;
      }

      showStatus('Practice schedule updated successfully!', 'success');
    } catch (err) {
      console.error('Error saving schedule:', err);
      showStatus('Failed to save changes. Check permissions.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-zinc-400">Loading schedule configuration...</div>;
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
          <h2 className="text-l font-extrabold text-[#611313] mb-1">Practice Times</h2>
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
            {DAYS_OF_WEEK.map((day) => {
              const data = schedule[day];
              return (
                <div 
                  key={day} 
                  className={`p-4 flex flex-col md:flex-row md:items-center gap-4 transition-colors ${
                    data.checked ? 'bg-red-50/40' : 'hover:bg-zinc-50'
                  }`}
                >
                  {/* Checkbox and Day Label */}
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <input
                      type="checkbox"
                      id={`check-${day}`}
                      checked={data.checked}
                      onChange={() => handleCheckboxChange(day)}
                      className="w-4 h-4 rounded text-red-600 bg-white border-zinc-300 focus:ring-red-500"
                    />
                    <label 
                      htmlFor={`check-${day}`} 
                      className={`font-semibold cursor-pointer select-none transition-colors ${
                        data.checked ? 'text-black' : 'text-zinc-400'
                      }`}
                    >
                      {day}
                    </label>
                  </div>

                  {/* Input Matrix Fields */}
                  <div className={`flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 transition-all duration-200 ${
                    data.checked ? 'opacity-100' : 'opacity-30 pointer-events-none'
                  }`}>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-black mb-1 font-bold">Start Time</label>
                      <input
                        type="text"
                        value={data.startTime}
                        disabled={!data.checked}
                        required={data.checked}
                        onChange={(e) => handleInputChange(day, 'startTime', e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded px-3 py-1.5 text-sm text-black placeholder-zinc-400 focus:border-red-600 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-black mb-1 font-bold">End Time</label>
                      <input
                        type="text"
                        value={data.endTime}
                        disabled={!data.checked}
                        required={data.checked}
                        onChange={(e) => handleInputChange(day, 'endTime', e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded px-3 py-1.5 text-sm text-black placeholder-zinc-400 focus:border-red-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-black mb-1 font-bold">Location</label>
                      <input
                        type="text"
                        value={data.location}
                        disabled={!data.checked}
                        required={data.checked}
                        onChange={(e) => handleInputChange(day, 'location', e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded px-3 py-1.5 text-sm text-black placeholder-zinc-400 focus:border-red-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-red-700 hover:bg-red-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm"
            >
              {saving ? 'Saving changes...' : 'Save Practice Schedule'}
            </button>
          </div>
        </form>
      </div>
        </div>
    );
}