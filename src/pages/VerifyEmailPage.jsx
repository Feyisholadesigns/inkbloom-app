import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Mail, RefreshCw, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const { currentUser, resendVerification, isEmailVerified, verifyEmailCode } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const verifiedRef = useRef(false);

  // ✅ Redirect helper: invite-link first, then role-based
  const redirectBasedOnRole = useCallback(async () => {
    const pendingRedirect = sessionStorage.getItem('inkbloom_redirect');
    if (pendingRedirect) {
      sessionStorage.removeItem('inkbloom_redirect');
      navigate(pendingRedirect);
      return;
    }
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      if (userData.role === 'writer') {
        navigate('/writer-dashboard');
      } else {
        navigate('/discover');
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
      navigate('/discover');
    }
  }, [currentUser, navigate]);

  const handleAutoVerify = useCallback(async (oobCode) => {
    if (verifiedRef.current) return;
    verifiedRef.current = true;
    
    setMessage({ type: 'info', text: 'Verifying your email...' });
    try {
      const success = await verifyEmailCode(oobCode);
      if (success) {
        setMessage({ type: 'success', text: 'Email verified! Redirecting...' });
        setTimeout(() => redirectBasedOnRole(), 1500);
      } else {
        setMessage({ type: 'error', text: 'Invalid or expired verification link.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred during verification.' });
    }
  }, [verifyEmailCode, redirectBasedOnRole]);

  useEffect(() => {
    const oobCode = searchParams.get('oobCode');
    
    if (oobCode && !verifiedRef.current) {
      handleAutoVerify(oobCode);
    } else if (isEmailVerified && !verifiedRef.current) {
      verifiedRef.current = true;
      redirectBasedOnRole();
    }
  }, [isEmailVerified, searchParams, handleAutoVerify, redirectBasedOnRole]);

  const handleResend = async () => {
    try {
      setResending(true);
      setMessage({ type: '', text: '' });
      await resendVerification();
      setMessage({ type: 'success', text: 'New verification email sent! Check Spam folder.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to resend. Try again later.' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-brand-bg px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-brand-surface p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 text-center relative">
        
        <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-gray-500 hover:text-burgundy-900 dark:hover:text-burgundy-200 transition">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="bg-burgundy-100 dark:bg-burgundy-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-burgundy-900 dark:text-burgundy-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-serif">Verify Your Email</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
          We sent a verification link to <br/>
          <strong className="text-burgundy-900 dark:text-burgundy-200">{currentUser?.email}</strong>
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 flex items-start gap-3 text-left">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-800 dark:text-yellow-200">
            <p className="font-semibold mb-1">Can't find the email?</p>
            <p>It likely landed in your <strong>Spam/Junk folder</strong>. Please check there first.</p>
          </div>
        </div>

        {message.text && (
          <div className={`p-3 rounded-lg text-sm mb-4 flex items-center justify-center gap-2 ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 
            message.type === 'error' ? 'bg-red-100 text-red-700' : 
            'bg-blue-100 text-blue-700'
          }`}>
            {message.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full bg-burgundy-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-burgundy-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {resending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
          {resending ? 'Sending...' : 'Resend Verification Email'}
        </button>
        
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Didn't receive it? Wait 2 minutes and check Spam again.
        </p>
      </div>
    </div>
  );
}