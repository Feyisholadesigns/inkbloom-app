import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, PenTool, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [role, setRole] = useState('reader');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // New state
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validation checks
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");
    
    try {
      setError('');
      setLoading(true);
      await signup(email, password, name, role);
      navigate('/verify-email');
    } catch (err) {
      console.error(err);
      setError('Failed to create an account. ' + err.message);
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-serif">Join Inkbloom</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-200">Create your account to get started</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={() => setRole('reader')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition ${role === 'reader' ? 'border-burgundy-900 bg-burgundy-50 dark:bg-burgundy-900/20 text-burgundy-900 dark:text-burgundy-200' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}>
            <User className="h-6 w-6 mb-2" />
            <span className="font-medium">Reader</span>
          </button>
          <button type="button" onClick={() => setRole('writer')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition ${role === 'writer' ? 'border-burgundy-900 bg-burgundy-50 dark:bg-burgundy-900/20 text-burgundy-900 dark:text-burgundy-200' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}>
            <PenTool className="h-6 w-6 mb-2" />
            <span className="font-medium">Writer</span>
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Full Name {role === 'writer' ? '/ Pen Name' : ''}</label>
            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-burgundy-900 outline-none" placeholder="John Doe" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email Address</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-burgundy-900 outline-none" placeholder="you@example.com" />
          </div>
          
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
            <div className="relative mt-1">
              <input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-burgundy-900 outline-none" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-300 hover:text-burgundy-900 dark:hover:text-burgundy-200">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* ✅ NEW: Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Confirm Password</label>
            <div className="relative mt-1">
              <input id="confirmPassword" type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="block w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-burgundy-900 outline-none" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-300 hover:text-burgundy-900 dark:hover:text-burgundy-200">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-burgundy-900 hover:bg-burgundy-800 disabled:opacity-50 transition">
            {loading ? 'Creating Account...' : `Create ${role === 'reader' ? 'Reader' : 'Writer'} Account`}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600 dark:text-gray-300">Already have an account? </span>
          <Link to="/login" className="font-medium text-burgundy-900 dark:text-burgundy-200 hover:underline">Sign in</Link>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-gray-500 dark:text-gray-300">© 2026 Feyisholadesigns. All rights reserved.</p>
    </div>
  );
}