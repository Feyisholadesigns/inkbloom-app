import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Skeleton from '../components/Skeleton';
import { Mail, Calendar, LogOut, PenTool, BookOpen, CheckCircle2, Library, Users, ArrowRight, BadgeCheck, LayoutDashboard, Quote, Trash2 } from 'lucide-react';

// Small reusable stat card
function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="bg-white dark:bg-brand-surface p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
      <Icon className={`h-5 w-5 mx-auto mb-2 ${tone}`} />
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mt-1">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { currentUser, userRole, isEmailVerified, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [myReads, setMyReads] = useState([]);
  const [myQuotes, setMyQuotes] = useState([]);
  const [publishedCount, setPublishedCount] = useState(0);
  const [readerCount, setReaderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingQuoteId, setDeletingQuoteId] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const loadData = async () => {
      try {
        // Profile details
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        setProfile(snap.exists() ? snap.data() : {});

        // My reading progress
        const readsQ = query(collection(db, "reads"), where("userId", "==", currentUser.uid));
        const readsSnap = await getDocs(readsQ);
        setMyReads(readsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // ✅ Fetch saved quotes
        const quotesQ = query(collection(db, "quotes"), where("userId", "==", currentUser.uid));
        const quotesSnap = await getDocs(quotesQ);
        setMyQuotes(quotesSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Writer-only stats
        if (userRole === 'writer') {
          const booksQ = query(collection(db, "books"), where("authorId", "==", currentUser.uid));
          const booksSnap = await getDocs(booksQ);
          const myBooks = booksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setPublishedCount(myBooks.length);

          // Count unique readers across my books
          const bookIds = myBooks.map(b => b.id);
          if (bookIds.length > 0 && bookIds.length <= 30) {
            const readersQ = query(collection(db, "reads"), where("bookId", "in", bookIds));
            const readersSnap = await getDocs(readersQ);
            setReaderCount(new Set(readersSnap.docs.map(d => d.data().userId)).size);
          }
        }
      } catch (err) {
        console.error(err);
        setProfile({});
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentUser, userRole, navigate]);

  const handleDeleteQuote = async (quoteId) => {
    if (!window.confirm('Delete this quote?')) return;
    try {
      setDeletingQuoteId(quoteId);
      await deleteDoc(doc(db, 'quotes', quoteId));
      setMyQuotes(prev => prev.filter(q => q.id !== quoteId));
    } catch (err) {
      console.error('Failed to delete quote:', err);
    } finally {
      setDeletingQuoteId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!currentUser) return null;

  const readingNow = myReads.filter(r => r.status === 'reading');
  const finished = myReads.filter(r => r.status === 'finished');
  const initial = currentUser.email ? currentUser.email[0].toUpperCase() : '';
  const joinedDate = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-bg px-4 pb-24 transition-colors duration-300">
      <Navbar />
      <div className="max-w-2xl mx-auto pt-24 sm:pt-28">
        
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-brand-surface rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
          <div className="bg-burgundy-900 dark:bg-burgundy-900/40 h-24"></div>
          <div className="px-6 pb-6 -mt-10">
            <div className="w-20 h-20 rounded-full bg-white dark:bg-brand-surface border-4 border-white dark:border-brand-surface shadow-lg flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-burgundy-900 dark:text-burgundy-300">{initial}</span>
            </div>

            <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">
                {loading ? <Skeleton className="h-8 w-40" /> : (profile?.displayName || 'Inkbloom Member')}
              </h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                userRole === 'writer' 
                  ? 'bg-burgundy-100 dark:bg-burgundy-900/30 text-burgundy-900 dark:text-burgundy-300' 
                  : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300'
              }`}>
                {userRole === 'writer' ? <PenTool className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                {userRole || 'member'}
              </span>
            </div>

            <div className="space-y-2 mt-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Mail className="h-4 w-4 text-gray-400" /> {currentUser.email}
                {isEmailVerified && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 dark:text-green-400">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Calendar className="h-4 w-4 text-gray-400" />
                {loading ? <Skeleton className="h-4 w-32" /> : (joinedDate ? `Joined ${joinedDate}` : 'Member')}
              </div>
            </div>
          </div>
        </div>

        {/* 📊 Stats Grid */}
        <div className={`grid grid-cols-2 ${userRole === 'writer' ? 'sm:grid-cols-4' : ''} gap-3 mb-6`}>
          {userRole === 'writer' && (
            <>
              <StatCard icon={Library} label="Published" value={loading ? '–' : publishedCount} tone="text-burgundy-900 dark:text-burgundy-300" />
              <StatCard icon={Users} label="Readers" value={loading ? '–' : readerCount} tone="text-burgundy-900 dark:text-burgundy-300" />
            </>
          )}
          <StatCard icon={BookOpen} label="Reading Now" value={loading ? '–' : readingNow.length} tone="text-blue-600 dark:text-blue-400" />
          <StatCard icon={CheckCircle2} label="Finished" value={loading ? '–' : finished.length} tone="text-green-600 dark:text-green-400" />
          <StatCard icon={Quote} label="Saved Quotes" value={loading ? '–' : myQuotes.length} tone="text-purple-600 dark:text-purple-400" />
        </div>

        {/* ✅ CONTINUE READING (Hidden for writers unless they have books in progress) */}
        {(userRole !== 'writer' || readingNow.length > 0) && (
          <div className="bg-white dark:bg-brand-surface rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Continue Reading</h2>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : readingNow.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No books in progress.{' '}
                <Link to="/discover" className="text-burgundy-900 dark:text-burgundy-300 font-medium hover:underline">
                  Discover something new →
                </Link>
              </p>
            ) : (
              <div className="space-y-2">
                {readingNow.map((read) => (
                  <Link 
                    key={read.id} 
                    to={`/book/${read.bookId}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-brand-bg border border-gray-100 dark:border-gray-700 hover:border-burgundy-200 dark:hover:border-burgundy-800 transition group"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate mr-3">{read.bookTitle}</span>
                    <ArrowRight className="h-4 w-4 text-burgundy-900 dark:text-burgundy-300 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ✅ SAVED QUOTES SECTION (Hidden for writers unless they have quotes) */}
        {(userRole !== 'writer' || myQuotes.length > 0) && (
          <div className="bg-white dark:bg-brand-surface rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Quote className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              My Saved Quotes
            </h2>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : myQuotes.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No quotes saved yet. Select text while reading to save your favorite passages!
              </p>
            ) : (
              <div className="space-y-3">
                {myQuotes.slice(0, 5).map((quote) => (
                  <div 
                    key={quote.id} 
                    className="p-4 bg-gray-50 dark:bg-brand-bg rounded-lg border border-gray-100 dark:border-gray-700 relative group"
                  >
                    <p className="text-sm text-gray-900 dark:text-white italic mb-2 pr-8">
                      "{quote.quoteText}"
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        — {quote.authorName}, {quote.bookTitle}
                      </p>
                      <button
                        onClick={() => handleDeleteQuote(quote.id)}
                        disabled={deletingQuoteId === quote.id}
                        className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition disabled:opacity-50"
                        title="Delete quote"
                      >
                        {deletingQuoteId === quote.id ? (
                          <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                {myQuotes.length > 5 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    + {myQuotes.length - 5} more quotes
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {userRole === 'writer' && (
            <button 
              onClick={() => navigate('/writer-dashboard')}
              className="w-full flex items-center justify-center gap-2 bg-burgundy-900 text-white py-3 rounded-lg text-sm font-semibold hover:bg-burgundy-800 transition"
            >
              <LayoutDashboard className="h-4 w-4" /> Go to My Dashboard
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}