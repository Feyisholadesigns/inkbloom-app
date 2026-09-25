import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, BUCKET_NAME } from '../r2Config';
import { Document, Page, pdfjs } from 'react-pdf';
import Navbar from '../components/Navbar';
import Skeleton from '../components/Skeleton';
import { ArrowLeft, Lock, CheckCircle2, BookOpenCheck, ChevronUp, ChevronDown } from 'lucide-react';

// ✅ pdf.js worker (Vite bundles it automatically)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function BookReaderPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [marking, setMarking] = useState(false);

  // Reader state
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [range, setRange] = useState({ start: 1, end: 3 });
  const [containerWidth, setContainerWidth] = useState(0);

  const containerRef = useRef(null);
  const pageRefs = useRef({});
  const resumePageRef = useRef(0);
  const resumedRef = useRef(false);
  const trackRef = useRef(false);      // false for authors (don't track own books)
  const readIdRef = useRef(null);
  const currentPageRef = useRef(1);
  const numPagesRef = useRef(0);

  // ✅ GUESTS: save intent, send to landing page
  useEffect(() => {
    if (!currentUser) {
      sessionStorage.setItem('inkbloom_redirect', `/book/${id}`);
      navigate('/', { replace: true });
    }
  }, [currentUser, id, navigate]);

  // Load book + reading progress + secure blob
  useEffect(() => {
    const load = async () => {
      if (!currentUser || !id) return;
      try {
        setLoading(true);
        const docSnap = await getDoc(doc(db, 'books', id));
        if (!docSnap.exists()) { setError('Book not found.'); return; }
        const bookData = { id: docSnap.id, ...docSnap.data() };
        setBook(bookData);

        // Reading tracking setup (skip author's own books)
        if (bookData.authorId !== currentUser.uid) {
          trackRef.current = true;
          const readId = `${currentUser.uid}_${bookData.id}`;
          readIdRef.current = readId;
          const readSnap = await getDoc(doc(db, 'reads', readId));
          if (!readSnap.exists()) {
            await setDoc(doc(db, 'reads', readId), {
              userId: currentUser.uid,
              bookId: bookData.id,
              bookTitle: bookData.title,
              status: 'reading',
              lastPage: 1,
              startedAt: serverTimestamp(),
              finishedAt: null,
            });
          } else {
            const data = readSnap.data();
            setIsFinished(data.status === 'finished');
            resumePageRef.current = data.lastPage || 0; // ✅ Where they stopped last time
          }
        }

        // Secure signed URL (dev = local signing, prod = Vercel API)
        let url = '';
        if (import.meta.env.DEV && r2Client && bookData.r2Key) {
          const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: bookData.r2Key, ResponseContentType: 'application/pdf' });
          url = await getSignedUrl(r2Client, command, { expiresIn: 604800 }); // ✅ 7 days max
        } else if (bookData.r2Key) {
          const res = await fetch(`/api/get-signed-url?key=${encodeURIComponent(bookData.r2Key)}`);
          if (!res.ok) throw new Error('Failed to generate secure link');
          url = (await res.json()).url;
        } else if (bookData.pdfUrl) {
          url = bookData.pdfUrl;
        } else {
          throw new Error('This book has no readable file.');
        }

        const pdfRes = await fetch(url);
        if (!pdfRes.ok) throw new Error('Could not fetch the book file');
        setFileUrl(URL.createObjectURL(await pdfRes.blob()));
      } catch (err) {
        console.error('Reader error:', err);
        setError('Unable to load this book securely. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, currentUser]);

  // Cleanup blob from memory
  useEffect(() => () => { if (fileUrl.startsWith('blob:')) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  // Measure reader width (responsive)
  useEffect(() => {
    const measure = () => { if (containerRef.current) setContainerWidth(containerRef.current.clientWidth); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [loading]);

  currentPageRef.current = currentPage;
  numPagesRef.current = numPages;

  // ✅ Scroll handler: detect visible pages (lazy render) + current page
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || !numPagesRef.current) return;
    const cRect = container.getBoundingClientRect();
    let first = null, last = null;
    for (let i = 1; i <= numPagesRef.current; i++) {
      const el = pageRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom > cRect.top + 40 && r.top < cRect.bottom - 40) {
        if (first === null) first = i;
        last = i;
      }
    }
    if (first !== null) {
      setCurrentPage(first);
      setRange((prev) => {
        const start = Math.max(1, first - 2);
        const end = Math.min(numPagesRef.current, (last || first) + 2);
        return prev.start === start && prev.end === end ? prev : { start, end };
      });
    }
  }, []);

  // ✅ SAVE PROGRESS (debounced 1.5s after they stop scrolling)
  useEffect(() => {
    if (!trackRef.current || !readIdRef.current || !numPages) return;
    const t = setTimeout(() => {
      updateDoc(doc(db, 'reads', readIdRef.current), {
        lastPage: currentPageRef.current,
        totalPages: numPages,
      }).catch((e) => console.warn('Progress save failed:', e));
    }, 1500);
    return () => clearTimeout(t);
  }, [currentPage, numPages]);

  // ✅ Save one final time when leaving the page
  useEffect(() => {
    return () => {
      if (trackRef.current && readIdRef.current && numPagesRef.current) {
        updateDoc(doc(db, 'reads', readIdRef.current), {
          lastPage: currentPageRef.current,
          totalPages: numPagesRef.current,
        }).catch(() => {});
      }
    };
  }, []);

  // ✅ RESUME: jump to saved page once layout is ready
  useEffect(() => {
    if (!numPages || resumedRef.current || !resumePageRef.current) return;
    const target = Math.min(resumePageRef.current, numPages);
    const el = pageRefs.current[target];
    if (el && containerRef.current) {
      resumedRef.current = true;
      containerRef.current.scrollTop = el.offsetTop - 8;
      setCurrentPage(target);
    }
  }, [numPages, range]);

  const onDocumentLoadSuccess = ({ numPages: n }) => {
    setNumPages(n);
    setRange({ start: 1, end: Math.min(n, 3) });
  };

  const scrollToPage = (p) => {
    const el = pageRefs.current[Math.max(1, Math.min(numPages, p))];
    if (el && containerRef.current) containerRef.current.scrollTo({ top: el.offsetTop - 8, behavior: 'smooth' });
  };

  const handleMarkFinished = async () => {
    try {
      setMarking(true);
      await updateDoc(doc(db, 'reads', `${currentUser.uid}_${id}`), { status: 'finished', finishedAt: serverTimestamp() });
      setIsFinished(true);
    } catch (err) {
      console.error('Failed to update progress:', err);
    } finally {
      setMarking(false);
    }
  };

  if (!currentUser || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-brand-bg px-4 transition-colors duration-300">
        <Navbar />
        <div className="max-w-4xl mx-auto pt-24">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-[70vh] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-brand-bg px-4 transition-colors duration-300">
        <Navbar />
        <div className="max-w-md mx-auto pt-40 text-center">
          <Lock className="h-12 w-12 mx-auto text-burgundy-900 dark:text-burgundy-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Restricted</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button onClick={() => navigate('/discover')} className="bg-burgundy-900 text-white px-6 py-2 rounded-lg hover:bg-burgundy-800 transition">
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-bg pb-24 px-4 transition-colors duration-300">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-24">
        
        <button onClick={() => navigate('/discover')} className="flex items-center gap-2 text-burgundy-900 dark:text-burgundy-200 mb-6 hover:underline group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to Discover
        </button>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-serif mb-2 leading-tight">{book.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>By {book.authorName || "Anonymous"}</span>
              <span>•</span>
              <span>{book.genre}</span>
            </div>
          </div>
          
          {book.authorId !== currentUser.uid && (
            isFinished ? (
              <span className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold whitespace-nowrap">
                <CheckCircle2 className="h-4 w-4" /> Finished
              </span>
            ) : (
              <button onClick={handleMarkFinished} disabled={marking}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-burgundy-900 text-white text-xs font-semibold hover:bg-burgundy-800 transition whitespace-nowrap disabled:opacity-50">
                <BookOpenCheck className="h-4 w-4" /> 
                {marking ? 'Saving...' : 'Mark as Finished'}
              </button>
            )
          )}
        </div>

        {/* ✅ CUSTOM IN-APP READER — scrolls perfectly on mobile, no downloads possible */}
        <div className="relative bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
          <Document 
            file={fileUrl} 
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="h-[70vh] flex items-center justify-center text-gray-500">Loading secure reader...</div>}
          >
            <div 
              ref={containerRef} 
              onScroll={handleScroll}
              className="relative overflow-y-auto h-[70vh] sm:h-[80vh] bg-gray-200 dark:bg-black/40"
            >
              {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                <div key={p} ref={(el) => (pageRefs.current[p] = el)} className="flex justify-center py-2">
                  {p >= range.start && p <= range.end && containerWidth > 0 ? (
                    <Page 
                      pageNumber={p} 
                      width={containerWidth - 16} 
                      renderTextLayer={false} 
                      renderAnnotationLayer={false} 
                    />
                  ) : (
                    <div 
                      style={{ aspectRatio: '1 / 1.414', width: containerWidth ? containerWidth - 16 : '95%' }}
                      className="bg-white dark:bg-white/10 rounded shadow animate-pulse"
                    />
                  )}
                </div>
              ))}
            </div>
          </Document>

          {/* Floating page indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-[11px] px-3 py-1.5 rounded-full pointer-events-none">
            📖 Page {currentPage} of {numPages || '…'}
          </div>

          {/* Page jump buttons */}
          <div className="absolute right-3 bottom-3 flex flex-col gap-2">
            <button onClick={() => scrollToPage(currentPage - 1)} className="p-2 rounded-full bg-white/90 dark:bg-white/20 backdrop-blur-sm shadow hover:bg-white transition" aria-label="Previous page">
              <ChevronUp className="h-4 w-4 text-gray-800 dark:text-white" />
            </button>
            <button onClick={() => scrollToPage(currentPage + 1)} className="p-2 rounded-full bg-white/90 dark:bg-white/20 backdrop-blur-sm shadow hover:bg-white transition" aria-label="Next page">
              <ChevronDown className="h-4 w-4 text-gray-800 dark:text-white" />
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          🔒 Your reading position is saved automatically. Downloading is disabled to protect the author's work.
        </p>
      </div>
    </div>
  );
}