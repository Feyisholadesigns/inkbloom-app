import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';
import { db } from '../firebaseConfig';
import { r2Client, BUCKET_NAME } from '../r2Config';
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { collection, addDoc, query, where, getDocs, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { GENRES } from '../constants/genres';
import { ArrowLeft, Upload, BookOpen, Loader2, FileText, Trash2, Share2, Copy, Check, Lock } from 'lucide-react';

export default function WriterDashboard() {
  const { currentUser, isEmailVerified, userRole } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState(GENRES[0]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [myBooks, setMyBooks] = useState([]);

  // Guard 1: Must be logged in
  useEffect(() => { if (!currentUser) navigate('/login'); }, [currentUser, navigate]);

  // Guard 2: Must be verified
  useEffect(() => { 
    if (currentUser && !isEmailVerified) navigate('/verify-email'); 
  }, [currentUser, isEmailVerified, navigate]);

  // Guard 3: Readers cannot enter the writer dashboard
  useEffect(() => {
    if (currentUser && userRole !== 'writer') {
      navigate('/discover');
    }
  }, [currentUser, userRole, navigate]);

  // Fetch books
  useEffect(() => {
    const fetchMyBooks = async () => {
      if (!currentUser) return;
      try {
        setLoadingBooks(true);
        const q = query(collection(db, "books"), where("authorId", "==", currentUser.uid));
        const snapshot = await getDocs(q);
        setMyBooks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); } 
      finally { setLoadingBooks(false); }
    };
    fetchMyBooks();
  }, [currentUser]);

  // ✅ SECURE PUBLISH (dev = direct R2, prod = pre-signed URL via API)
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title || !description || !file) return setError("Fill all fields & select PDF");
    if (file.type !== 'application/pdf') return setError("PDFs only");
    if (file.size > 50 * 1024 * 1024) return setError("Max 50MB");

    try {
      setError(''); 
      setUploading(true);
      const fileName = `${currentUser.uid}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      
      if (import.meta.env.DEV && r2Client) {
        console.log("📦 Uploading locally via r2Client...");
        await r2Client.send(new PutObjectCommand({
          Bucket: BUCKET_NAME, 
          Key: fileName, 
          Body: new Uint8Array(await file.arrayBuffer()), 
          ContentType: 'application/pdf'
        }));
      } else {
        console.log("☁️ Uploading securely via Vercel API...");
        const response = await fetch('/api/upload-book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName, contentType: file.type })
        });
        
        if (!response.ok) throw new Error("Failed to get upload URL");
        const { uploadUrl } = await response.json();
        
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type }
        });
      }

      // Save metadata to Firestore (r2Key only - NO public URLs)
      await addDoc(collection(db, "books"), {
        title, description, genre,
        r2Key: fileName,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || "Anonymous",
        createdAt: serverTimestamp()
      });

      setSuccess("Published! Share your invite link below.");
      setTitle(''); setDescription(''); setFile(null);
      
      const q = query(collection(db, "books"), where("authorId", "==", currentUser.uid));
      const snapshot = await getDocs(q);
      setMyBooks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { 
      console.error("Upload error:", err); 
      setError("Upload failed. Please try again."); 
    } finally { 
      setUploading(false); 
    }
  };

  // ✅ SECURE DELETE (dev = direct R2, prod = ownership-verified API)
  const handleDelete = async (bookId, r2Key) => {
    if (!window.confirm("Permanently delete this book? This cannot be undone.")) return;
    try {
      setDeletingId(bookId);
      
      if (import.meta.env.DEV && r2Client) {
        // Local dev: delete directly from R2
        await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: r2Key }));
      } else {
        // Production: secure delete via Vercel API (verifies ownership server-side)
        const token = await currentUser.getIdToken();
        const res = await fetch('/api/delete-book', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ r2Key }),
        });
        if (!res.ok) throw new Error('Failed to delete book file');
      }
      
      await deleteDoc(doc(db, "books", bookId));
      setSuccess("Book deleted successfully");
      setMyBooks(prev => prev.filter(b => b.id !== bookId));
    } catch (err) { 
      console.error(err); setError("Delete failed"); 
    } finally { setDeletingId(null); }
  };

  const copyInviteLink = (bookId) => {
    const link = `${window.location.origin}/book/${bookId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(bookId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-bg py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition">
            <ArrowLeft className="h-6 w-6 text-burgundy-900 dark:text-burgundy-200" />
          </button>
          <h1 className="text-3xl font-bold text-burgundy-900 dark:text-white font-serif">Writer Dashboard</h1>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm mb-4">{success}</div>}

        {/* Publish Form */}
        <div className="bg-white dark:bg-brand-surface p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Upload className="h-5 w-5" /> Publish New Book
          </h2>
          <form onSubmit={handlePublish} className="space-y-6">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} 
              placeholder="Book Title" required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-burgundy-900 outline-none" />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Genre</label>
              <select value={genre} onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-burgundy-900 outline-none">
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} 
              placeholder="Brief description of your book..." required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-burgundy-900 outline-none" />

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center relative hover:border-burgundy-900 dark:hover:border-burgundy-400 transition">
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-burgundy-900 dark:text-burgundy-200">
                  <FileText className="h-6 w-6" /><span className="font-medium truncate">{file.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-300">Click or drag to upload PDF (max 50MB)</p>
                </>
              )}
            </div>

            <button type="submit" disabled={uploading} 
              className="w-full bg-burgundy-900 text-white py-3 rounded-lg font-semibold hover:bg-burgundy-800 transition flex items-center justify-center gap-2 disabled:opacity-50">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <BookOpen className="h-5 w-5" />}
              {uploading ? 'Uploading...' : 'Publish Book'}
            </button>
          </form>
        </div>

        {/* My Books List */}
        <div className="bg-white dark:bg-brand-surface p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">My Published Books</h2>
          
          {loadingBooks ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-brand-bg rounded-lg border border-gray-200 dark:border-gray-700">
                  <Skeleton className="h-5 w-3/4 mb-2"/><Skeleton className="h-4 w-1/2"/>
                </div>
              ))}
            </div>
          ) : myBooks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300 text-center py-8">No books published yet.</p>
          ) : (
            <div className="space-y-4">
              {myBooks.map((book) => (
                <div key={book.id} className="p-4 bg-gray-50 dark:bg-brand-bg rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{book.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-300">{book.genre}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(book.id, book.r2Key)}
                      disabled={deletingId === book.id}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition disabled:opacity-50 p-1"
                      title="Delete Book"
                    >
                      {deletingId === book.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Invite Link */}
                  <div className="flex items-center gap-2 bg-white dark:bg-brand-surface p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Share2 className="h-4 w-4 text-burgundy-900 dark:text-burgundy-400 flex-shrink-0" />
                    <code className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1 font-mono">
                      {window.location.origin}/book/{book.id}
                    </code>
                    <button 
                      onClick={() => copyInviteLink(book.id)}
                      className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition text-burgundy-900 dark:text-burgundy-300"
                      title="Copy invite link"
                    >
                      {copiedId === book.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Readers must sign in to access this book
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}