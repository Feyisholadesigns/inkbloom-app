import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DiscoverPage from './pages/DiscoverPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import WriterDashboard from './pages/WriterDashboard';
import BookReaderPage from './pages/BookReaderPage';
import ProfilePage from './pages/ProfilePage';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/writer-dashboard" element={<WriterDashboard />} />
        <Route path="/book/:id" element={<BookReaderPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <PWAInstallPrompt />
      <ScrollToTop />
    </Router>
  );
}

export default App;