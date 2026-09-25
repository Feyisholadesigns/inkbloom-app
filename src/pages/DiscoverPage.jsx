import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { GENRES } from '../constants/genres'; // ✅ Shared genre list
import Navbar from '../components/Navbar';
import Skeleton from '../components/Skeleton';
import { BookOpen, PenTool } from 'lucide-react';

export default function DiscoverPage() {
  const { currentUser, userRole } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  // ✅ Built from the shared genres file — always in sync with Writer Dashboard
  const genres = ['All', ...GENRES];

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "books"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const booksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBooks(booksData);
      } catch (err) {
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const filteredBooks = filter === 'All' 
    ? books 
    : books.filter(book => book.genre === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-bg pb-24 px-4 transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-24 sm:pt-28">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-burgundy-900 dark:text-white mb-2 font-serif">
            Discover Fresh Voices
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto px-2">
            Explore original works from upcoming writers across every genre.
          </p>
        </div>

        {/* Genre Filters - Wrap Layout (mobile friendly) */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-10">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setFilter(genre)}
              className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-[10px] sm:text-sm font-medium transition border ${
                filter === genre
                  ? 'bg-burgundy-900 text-white border-burgundy-900 dark:bg-white dark:text-burgundy-900 dark:border-white'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-burgundy-900 dark:bg-brand-surface dark:text-gray-300 dark:border-gray-700 dark:hover:border-burgundy-400'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-brand-surface p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <Skeleton className="h-32 w-full rounded-lg mb-3" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-3" />
                <div className="flex items-center justify-between mt-3">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-7 w-16 rounded-full" />
                </div>
              </div>
            ))
          ) : filteredBooks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No books found</h3>
              
              {/* ✅ ONLY WRITERS SEE THE PUBLISH CTA */}
              {currentUser && userRole === 'writer' ? (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400 px-4 mb-6 max-w-md mx-auto">
                    {filter === 'All' 
                      ? "The library is empty! Be the first to share your story with the world." 
                      : `No books in ${filter} yet. Why not write the first one?`}
                  </p>
                  <Link 
                    to="/writer-dashboard" 
                    className="inline-flex items-center gap-2 bg-burgundy-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-burgundy-800 transition shadow-lg active:scale-95"
                  >
                    <PenTool className="h-4 w-4" />
                    Publish Your First Book
                  </Link>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 px-4 max-w-md mx-auto">
                  {filter === 'All' 
                    ? "Our library is still growing. Check back soon for amazing new stories!" 
                    : `We're still collecting ${filter} titles. Stay tuned!`}
                </p>
              )}
            </div>
          ) : (
            filteredBooks.map((book) => (
              <div 
                key={book.id} 
                className="group bg-white dark:bg-brand-surface p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-burgundy-200 dark:hover:border-burgundy-900/50 transition-all duration-300 flex flex-col active:scale-[0.98]"
              >
                {/* Book Cover Placeholder */}
                <div className="h-32 w-full bg-gradient-to-br from-burgundy-100 to-burgundy-200 dark:from-burgundy-900/40 dark:to-burgundy-900/20 rounded-lg mb-3 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                  <BookOpen className="h-8 w-8 text-burgundy-900/30 dark:text-burgundy-400/30" />
                </div>

                <div className="flex-1">
                  <span className="inline-block px-2 py-1 bg-burgundy-50 dark:bg-burgundy-900/20 text-burgundy-900 dark:text-burgundy-300 text-[10px] rounded-md mb-2 font-medium">
                    {book.genre}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 font-serif leading-tight">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                    {book.description || "No description available."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[60%]">
                    By {book.authorName || "Anonymous"}
                  </span>
                  {/* ✅ SECURE: Routes through the reader page, never exposes raw URLs */}
                  <Link 
                    to={`/book/${book.id}`}
                    className="text-[10px] font-semibold text-burgundy-900 dark:text-burgundy-300 hover:underline flex items-center gap-1 flex-shrink-0"
                  >
                    Read Now →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}