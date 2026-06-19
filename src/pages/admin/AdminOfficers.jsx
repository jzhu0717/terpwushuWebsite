import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Adjust path if necessary

const POSITION_MAP = {
  "President": { order: 1, prefix: "1President" },
  "Vice President": { order: 2, prefix: "2VP" },
  "Treasurer": { order: 3, prefix: "3Treasurer" },
  "Secretary": { order: 4, prefix: "4Secretary" },
  "IRC": { order: 5, prefix: "5IRC" },
  "Public Relations": { order: 5, prefix: "5PRC" }
};

export default function AdminOfficers() {
  // Initialize with the current year as a string
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [position, setPosition] = useState("President");
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 1. Dynamically build the year options array
  const nextYear = new Date().getFullYear() + 1;
  const singleYears = [];
  for (let y = nextYear; y >= 2013; y--) {
    singleYears.push(String(y));
  }

  const historicalTerms = [
    "2011-2012", "2010-2011", "2009-2010", "2008-2009", "2007-2008", 
    "2006-2007", "2005-2006", "2004-2005", "2003-2004", "2002-2003", "2001-2002"
  ];

  const yearOptions = [...singleYears, ...historicalTerms];

  // 2. Safely parse the year string to check the 2026 role-swap threshold
  useEffect(() => {
    const numericYear = year.includes('-') ? parseInt(year.split('-')[0]) : parseInt(year);
    
    if (numericYear >= 2026 && position === "IRC") {
      setPosition("Public Relations");
    } else if (numericYear < 2026 && position === "Public Relations") {
      setPosition("IRC");
    }
  }, [year]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !file) {
      setMessage("Please fill out all fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
        const { data: existingOfficer } = await supabase
        .from('officers')
        .select('image_url')
        .eq('year', year)
        .eq('position', position)
        .maybeSingle(); // Returns data or null without throwing an error

        // 2. If a record exists with an old image, delete it from the bucket first
        if (existingOfficer && existingOfficer.image_url) {
        const oldStoragePath = existingOfficer.image_url.split('/officers/')[1];
        
        if (oldStoragePath) {
            await supabase.storage
            .from('officers')
            .remove([oldStoragePath]);
        }
        }
      
      
        const formattedName = name.trim().replace(/\s+/g, '_');
      const posData = POSITION_MAP[position];
      const fileExt = file.name.split('.').pop();
      const customFileName = `${posData.prefix}-${formattedName}.${fileExt}`;
      const filePath = `${year}/${customFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('officers')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('officers')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('officers')
        .upsert(
          {
            year: year, // Stored as text now
            position,
            name: name.trim(),
            image_url: publicUrl,
            sort_order: posData.order
          },
          { onConflict: 'year,position' }
        );

      if (dbError) throw dbError;

      setMessage("Saved successfully!");
      setName("");
      setFile(null);
      e.target.reset();
    } catch (err) {
      console.error(err);
      setMessage(`Execution Failure: ${err.message || "Unknown Error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Determine if the PR or IRC role applies to the currently selected option
  const currentNumericYear = year.includes('-') ? parseInt(year.split('-')[0]) : parseInt(year);

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
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add / Modify Officer</h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Year</label>
            <select 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 border"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Position</label>
            <select 
              value={position} 
              onChange={(e) => setPosition(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 border"
            >
              <option value="President">President</option>
              <option value="Vice President">Vice President</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Secretary">Secretary</option>
              {currentNumericYear >= 2026 ? (
                <option value="Public Relations">Public Relations</option>
              ) : (
                <option value="IRC">IRC</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 border"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Portrait Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-700 text-white font-bold p-2.5 rounded-md hover:bg-red-800 transition disabled:opacity-50"
          >
            {loading ? "Processing Upload..." : "Save Changes"}
          </button>
        </form>

        {message && <div className="mt-4 text-center font-medium text-sm">{message}</div>}
      </div>
    </div>
  );
}