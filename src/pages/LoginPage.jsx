import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { browserLocalPersistence, browserSessionPersistence, setPersistence } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);

      // ✅ Remember Me: local = stays signed in, session = clears when browser closes
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      const userCred = await login(email, password);
      const user = userCred.user;

      // 1. Unverified users go to verification page
      if (!user.emailVerified) {
        navigate('/verify-email');
        return;
      }

      // 2. ✅ Invite-link redirect: reader came from a shared book link
      const pendingRedirect = sessionStorage.getItem('inkbloom_redirect');
      if (pendingRedirect) {
        sessionStorage.removeItem('inkbloom_redirect');
        navigate(pendingRedirect);
        return;
      }

      // 3. Role-based redirect
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const role = userDoc.exists() ? userDoc.data().role : null;

      if (role === 'writer') {
        navigate('/writer-dashboard');
      } else {
        navigate('/discover');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to sign in. Please check your email and password.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-brand-bg px-4 py-12 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-brand-surface p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 text-burgundy-900 dark:text-burgundy-200 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Inkbloom Logo" className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-serif">Welcome Back</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-200">Sign in to continue your reading journey</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center">{error}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email Address</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-burgundy-900 outline-none" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
              <div className="relative mt-1">
                <input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-burgundy-900 outline-none" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-300 hover:text-burgundy-900 dark:hover:text-burgundy-200">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-burgundy-900 focus:ring-burgundy-900 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-burgundy-900 dark:text-burgundy-200 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-burgundy-900 hover:bg-burgundy-800 disabled:opacity-50 transition">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600 dark:text-gray-300">Don't have an account? </span>
          <Link to="/signup" className="font-medium text-burgundy-900 dark:text-burgundy-200 hover:underline">Register now</Link>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-gray-500 dark:text-gray-300">© 2026 Feyisholadesigns. All rights reserved.</p>
    </div>
  );
}