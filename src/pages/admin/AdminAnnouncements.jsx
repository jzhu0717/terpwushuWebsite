import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    
    // Form State for creating a new post
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [content, setContent] = useState('');
    
    // Form State for editing an existing post
    const [selectedId, setSelectedId] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [editAuthor, setEditAuthor] = useState('');
    const [editContent, setEditContent] = useState('');

    const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

    // Fetch announcements from database
    const fetchAnnouncements = async () => {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error && data) setAnnouncements(data);
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    // Sync values whenever a user picks a post from the dropdown
    const handleSelectPost = (id) => {
        setSelectedId(id);
        if (!id) {
            setEditTitle('');
            setEditAuthor('');
            setEditContent('');
            return;
        }
        const post = announcements.find(a => a.id.toString() === id.toString());
        if (post) {
            setEditTitle(post.title);
            setEditAuthor(post.author);
            setEditContent(post.content);
        }
    };

    const showMessage = (text, isError = false) => {
        setStatusMessage({ text, isError });
        setTimeout(() => setStatusMessage({ text: '', isError: false }), 4000);
    };

    // CREATE POST
    const handleCreatePost = async (e) => {
        e.preventDefault();
        
        // Author Validation: Letters, numbers, and spaces only
        const alphaNumericSpace = /^[a-zA-Z0-9 ]*$/;
        if (!alphaNumericSpace.test(author)) {
            return showMessage("Author name can only contain letters, numbers, and spaces!", true);
        }

        const { error } = await supabase
            .from('announcements')
            .insert([{ title, author, content }]);

        if (error) {
            showMessage(error.message, true);
        } else {
            showMessage("New post successfully created!");
            setTitle(''); setAuthor(''); setContent('');
            fetchAnnouncements();
        }
    };

    // UPDATE POST
    const handleUpdatePost = async () => {
        if (!selectedId) return;

        const alphaNumericSpace = /^[a-zA-Z0-9 ]*$/;
        if (!alphaNumericSpace.test(editAuthor)) {
            return showMessage("Author name can only contain letters, numbers, and spaces!", true);
        }

        const { error } = await supabase
            .from('announcements')
            .update({ title: editTitle, author: editAuthor, content: editContent })
            .eq('id', selectedId);

        if (error) {
            showMessage(error.message, true);
        } else {
            showMessage("Post successfully updated!");
            fetchAnnouncements();
        }
    };

    // DELETE POST
    const handleDeletePost = async () => {
        if (!selectedId || !window.confirm("Are you sure you want to delete this post?")) return;

        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', selectedId);

        if (error) {
            showMessage(error.message, true);
        } else {
            showMessage("Post permanently removed.");
            setSelectedId(''); setEditTitle(''); setEditAuthor(''); setEditContent('');
            fetchAnnouncements();
        }
    };
    
    
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


            {/* Global Flash Alerts */}
            {statusMessage.text && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-md font-semibold text-sm border ${
                    statusMessage.isError ? 'bg-red-100 text-red-800 border-red-300' : 'bg-green-100 text-green-800 border-green-300'
                }`}>
                    {statusMessage.text}
                </div>
            )}

            {/* BLOCK 1: CREATE NEW ANNOUNCEMENT */}
            <div className="flex-1 bg-white/95 p-6 rounded-xl shadow-lg border border-red-900/10">
                <h3 className="text-xl font-extrabold text-[#611313] mb-1">New Post</h3>
                
                <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
                    <label className="flex flex-col text-xs font-bold text-gray-700 gap-1">
                        TITLE
                        <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Title..." className="p-2 border rounded font-normal text-sm outline-none focus:border-[#611313]" />
                    </label>
                    <label className="flex flex-col text-xs font-bold text-gray-700 gap-1">
                        AUTHOR <span className="font-normal text-gray-400 text-[10px]">(Letters, numbers, spaces only)</span>
                        <input type="text" required value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author..." className="p-2 border rounded font-normal text-sm outline-none focus:border-[#611313]" />
                    </label>
                    <label className="flex flex-col text-xs font-bold text-gray-700 gap-1">
                        CONTENT
                        <textarea required value={content} rows="4" onChange={e => setContent(e.target.value)} placeholder="Write your announcement message details..." className="p-2 border rounded font-normal text-sm outline-none resize-none focus:border-[#611313]" />
                    </label>
                    <button type="submit" className="bg-[#611313] hover:bg-[#801b1b] text-white font-bold text-sm py-2 rounded shadow transition-all">Save</button>
                </form>
            </div>

            {/* BLOCK 2: EDIT / DELETE EXISTING ANNOUNCEMENTS */}
            <div className="flex-1 bg-white/95 p-6 rounded-xl shadow-lg border border-red-900/10 flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-extrabold text-[#611313] mb-1">Edit Posts</h3>
                    <p className="text-xs text-gray-500 mb-4">Select an existing announcement to modify or delete it.</p>
                    
                    <label className="flex flex-col text-xs font-bold text-gray-700 gap-1 mb-4">
                        SELECT A POST TO EDIT:
                        <select value={selectedId} onChange={e => handleSelectPost(e.target.value)} className="p-2 border rounded font-normal text-sm bg-white outline-none">
                            <option value="">-- Choose a post --</option>
                            {announcements.map(a => (
                                <option key={a.id} value={a.id}>{a.title}</option>
                            ))}
                        </select>
                    </label>

                    {selectedId && (
                        <div className="flex flex-col gap-4 animate-fadeIn">
                            <label className="flex flex-col text-xs font-bold text-gray-700 gap-1">
                                UPDATE TITLE
                                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="p-2 border rounded font-normal text-sm outline-none focus:border-[#611313]" />
                            </label>
                            <label className="flex flex-col text-xs font-bold text-gray-700 gap-1">
                                UPDATE AUTHOR
                                <input type="text" value={editAuthor} onChange={e => setEditAuthor(e.target.value)} className="p-2 border rounded font-normal text-sm outline-none focus:border-[#611313]" />
                            </label>
                            <label className="flex flex-col text-xs font-bold text-gray-700 gap-1">
                                UPDATE CONTENT
                                <textarea value={editContent} rows="3" onChange={e => setEditContent(e.target.value)} className="p-2 border rounded font-normal text-sm outline-none resize-none focus:border-[#611313]" />
                            </label>
                        </div>
                    )}
                </div>

                {selectedId && (
                    <div className="flex gap-3 mt-6">
                        <button onClick={handleUpdatePost} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 rounded transition-all shadow">
                            Update Changes
                        </button>
                        <button onClick={handleDeletePost} className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold text-xs py-2 rounded transition-all shadow">
                            Delete Post
                        </button>
                    </div>
                )}
            </div>


        </div>
    );
}