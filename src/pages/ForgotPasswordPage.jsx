import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await resetPassword(email);
      setMessage(`Reset link sent to ${email}. Please check your inbox and spam folder.`);
    } catch (err) {
      console.error(err);
      setMessage('Failed to send reset link. Please check the email address.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-brand-bg px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-brand-surface p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 text-center relative">
        
        <button onClick={() => navigate('/login')} className="absolute top-4 left-4 text-gray-500 hover:text-burgundy-900 dark:hover:text-burgundy-200 transition">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="bg-burgundy-100 dark:bg-burgundy-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-burgundy-900 dark:text-burgundy-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-serif">Reset Password</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && (
          <div className={`p-3 rounded-lg text-sm mb-4 flex items-center justify-center gap-2 ${
            message.includes('sent') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.includes('sent') && <CheckCircle2 className="h-4 w-4" />}
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">Email Address</label>
            <input 
              id="email" 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-burgundy-900 outline-none" 
              placeholder="you@example.com" 
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-burgundy-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-burgundy-800 transition disabled:opacity-50">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-600 dark:text-gray-300">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-burgundy-900 dark:text-burgundy-200 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}