import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Moon, Sun, LogOut, ChevronDown, LayoutDashboard, UserCircle } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);      // Mobile menu
  const [menuOpen, setMenuOpen] = useState(false);  // Profile dropdown
  const [dark, setDark] = useState(() => localStorage.getItem('inkbloom_theme') === 'dark');
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('inkbloom_theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const isWriter = currentUser && userRole === 'writer';
  const isReader = currentUser && userRole !== 'writer';
  const initial = currentUser?.email ? currentUser.email[0].toUpperCase() : '';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-brand-surface backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <img src="/logo.png" alt="Inkbloom Logo" className="h-8 w-8" />
            <span className="text-xl font-bold font-serif text-burgundy-900 dark:text-white">Inkbloom</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Guests see both links */}
            {!currentUser && (
              <>
                <Link to="/discover" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-burgundy-900 dark:hover:text-burgundy-200 transition">Discover</Link>
                <Link to="/writer-dashboard" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-burgundy-900 dark:hover:text-burgundy-200 transition">For Writers</Link>
              </>
            )}
            {/* Readers only see Discover */}
            {isReader && (
              <Link to="/discover" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-burgundy-900 dark:hover:text-burgundy-200 transition">Discover</Link>
            )}
            {/* ✅ Writers see NO links — their tools live in the profile menu */}

            <button onClick={() => setDark(!dark)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition" aria-label="Toggle dark mode">
              {dark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-burgundy-900" />}
            </button>

            {currentUser ? (
              /* ✅ Profile Dropdown */
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition"
                >
                  <span className="w-8 h-8 rounded-full bg-burgundy-900 dark:bg-burgundy-400 text-white dark:text-burgundy-900 flex items-center justify-center text-sm font-bold">
                    {initial}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-300 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-brand-surface rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{currentUser.email}</p>
                      <p className="text-[10px] uppercase tracking-wide text-burgundy-900 dark:text-burgundy-300 font-bold mt-0.5">{userRole || 'member'}</p>
                    </div>
                    {isWriter && (
                      <Link to="/writer-dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                        <LayoutDashboard className="h-4 w-4" /> My Dashboard
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                      <UserCircle className="h-4 w-4" /> My Profile
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition border-t border-gray-100 dark:border-gray-700">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-burgundy-900 dark:text-burgundy-200 hover:underline">Sign In</Link>
                <Link to="/signup" className="bg-burgundy-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-burgundy-800 transition">Register Now</Link>
              </div>
            )}
          </div>

          {/* Mobile Buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setDark(!dark)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition" aria-label="Toggle dark mode">
              {dark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-burgundy-900" />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition" aria-label="Toggle menu">
              {isOpen ? <X className="h-6 w-6 text-gray-700 dark:text-gray-200" /> : <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-brand-surface border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-1">
          {/* Guests */}
          {!currentUser && (
            <>
              <Link to="/discover" onClick={() => setIsOpen(false)} className="block py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200">Discover</Link>
              <Link to="/writer-dashboard" onClick={() => setIsOpen(false)} className="block py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200">For Writers</Link>
              <Link to="/login" onClick={() => setIsOpen(false)} className="block py-2.5 text-sm font-medium text-burgundy-900 dark:text-burgundy-200">Sign In</Link>
              <Link to="/signup" onClick={() => setIsOpen(false)} className="block w-full bg-burgundy-900 text-white text-center py-3 rounded-lg text-sm font-semibold hover:bg-burgundy-800 transition mt-2">Register Now</Link>
            </>
          )}
          {/* Readers */}
          {isReader && (
            <>
              <Link to="/discover" onClick={() => setIsOpen(false)} className="block py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200">Discover</Link>
              <Link to="/profile" onClick={() => setIsOpen(false)} className="block py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200">My Profile</Link>
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition mt-2">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </>
          )}
          {/* ✅ Writers: no Discover, no For Writers */}
          {isWriter && (
            <>
              <Link to="/writer-dashboard" onClick={() => setIsOpen(false)} className="block py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200">My Dashboard</Link>
              <Link to="/profile" onClick={() => setIsOpen(false)} className="block py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200">My Profile</Link>
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition mt-2">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}