import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; 

const getOrdinalSuffix = (num) => {
  const j = num % 10, k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};


export default function AdminTournamentArchives() {
  const [eventNumber, setEventNumber] = useState(""); 
  const [eventDate, setEventDate] = useState(""); 
  const [scoresFile, setScoresFile] = useState(null); 
  const [customFileName, setCustomFileName] = useState(""); 
  const [videosUrl, setVideosUrl] = useState("");
  const [photosRaw, setPhotosRaw] = useState(""); 
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState([]);

  const refreshHighestEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_archives')
        .select('event_number')
        .order('event_number', { ascending: false })
        .limit(1);

      let highest = 19; 
      if (!error && data && data.length > 0) {
        highest = data[0].event_number;
      }

      const nextDefault = highest + 1;
      setEventNumber(String(nextDefault));

      const options = [];
      for (let i = nextDefault + 3; i >= 1; i--) {
        options.push(i);
      }
      setDropdownOptions(options);
    } catch (err) {
      console.error("Error setting up automatic event numbers:", err);
    }
  };

  useEffect(() => {
    refreshHighestEvent();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!eventNumber || !eventDate) {
      setMessage("Please select an Event Number and enter an Event Date.");
      return;
    }

    setLoading(true);
    setMessage("");

    const numericEventVal = parseInt(eventNumber);
    const suffix = getOrdinalSuffix(numericEventVal);
    const computedEdition = `${numericEventVal}${suffix} UWG`;

    const photosArray = photosRaw
      ? photosRaw.split(',').map(url => url.trim()).filter(url => url.length > 0)
      : [];

    try {
      const { data: existingArchive } = await supabase
        .from('tournament_archives')
        .select('scores_url')
        .eq('event_number', numericEventVal)
        .maybeSingle();

      let finalScoresUrl = null;

      if (scoresFile) {
        if (existingArchive && existingArchive.scores_url) {
          const oldStoragePath = existingArchive.scores_url.split('/archives/')[1];
          if (oldStoragePath) {
            await supabase.storage.from('archives').remove([oldStoragePath]);
          }
        }

        const fileExt = scoresFile.name.split('.').pop();
        
        const sanitizedBaseName = customFileName.trim()
          ? customFileName.trim().replace(/\s+/g, '_')
          : `${computedEdition.replace(/\s+/g, '_')}_scores`;
          
        const finalFileName = `${sanitizedBaseName}.${fileExt}`;
        const filePath = `scores/${finalFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('archives')
          .upload(filePath, scoresFile, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('archives')
          .getPublicUrl(filePath);

        finalScoresUrl = publicUrl;
      } else if (existingArchive) {
        finalScoresUrl = existingArchive.scores_url;
      }

      const { error: dbError } = await supabase
        .from('tournament_archives')
        .upsert(
          {
            edition: computedEdition,
            event_date: eventDate.trim(),
            event_number: numericEventVal, 
            scores_url: finalScoresUrl, 
            videos_url: videosUrl.trim() || null,
            photos_urls: photosArray,
            notes: notes.trim() || null
          },
          { onConflict: 'edition' }
        );

      if (dbError) throw dbError;

      setMessage(`Saved ${computedEdition} entry successfully!`);
      setEventDate("");
      setScoresFile(null);
      setCustomFileName("");
      setVideosUrl("");
      setPhotosRaw("");
      setNotes("");
      e.target.reset(); 
      
      await refreshHighestEvent();
    } catch (err) {
      console.error(err);
      setMessage(`Execution Failure: ${err.message || "Unknown Error"}`);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(to right, #611313 0%, #a12222 6%, #e58e8e 18%, #E8C5C5 35%, #E8C5C5 65%, #e58e8e 82%, #a12222 94%, #611313 100%)",
      }}
    >
      <div className="flex justify-center pt-8 pb-2">
        <span className="tracking-[0.2em] text-[11px] font-semibold uppercase text-[#7A1A1A]">
          Admin Panel
        </span>
      </div>
      
      <div className="max-w-4xl mx-auto bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add / Modify Tournament Archive</h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Tournament Edition</label>
              <select
                value={eventNumber}
                onChange={(e) => setEventNumber(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 border text-black font-medium"
              >
                {dropdownOptions.map(num => (
                  <option key={num} value={num}>
                    {num}{getOrdinalSuffix(num)} UWG
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Event Date</label>
              <input 
                type="text" 
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="e.g., December ##, 20##"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 border text-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Upload Scores File</label>
              <input 
                type="file" 
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setScoresFile(e.target.files[0])}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700"> File Name</label>
              <input 
                type="text" 
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 border text-black text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Videos Link</label>
              <input 
                type="url" 
                value={videosUrl}
                onChange={(e) => setVideosUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 border text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Special Exception Status / Notes (Optional)</label>
              <input 
                type="text" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Canceled due to COVID-19"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 border text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Photo Links (Separated by commas)</label>
            <textarea 
              value={photosRaw}
              onChange={(e) => setPhotosRaw(e.target.value)}
              placeholder="link1, link2"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 border text-black h-20 resize-y"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-700 text-white font-bold p-2.5 rounded-md hover:bg-red-800 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Save Archive Entry"}
          </button>
        </form>

        {message && <div className="mt-4 text-center font-medium text-sm text-gray-700">{message}</div>}
      </div>
    </div>
  );
}