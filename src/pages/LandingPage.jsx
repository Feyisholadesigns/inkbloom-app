import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Skeleton from '../components/Skeleton';
import { Feather, Users, PenTool, ArrowRight, Sparkles, Heart, Send, BookOpen, LayoutDashboard, UserCircle } from 'lucide-react';
import bgVideo from '../assets/bg-video.mp4';
import instagramIcon from '../assets/instagram.svg';
import facebookIcon from '../assets/facebook.svg';
import xIcon from '../assets/x.svg';
import gmailIcon from '../assets/gmail.svg';

export default function LandingPage() {
  const { currentUser, userRole } = useAuth();
  const [loading, setLoading] = useState(true);

  // Simulate content loading (replace with real API call later)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-brand-bg transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden min-h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src={bgVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-burgundy-900/85 dark:bg-black/70"></div>
        </div>

        <div className="relative z-10 w-full">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-white/20">
            <Feather className="h-5 w-5 text-white flex-shrink-0" />
            <span className="text-white font-medium text-sm sm:text-base">Where writers blossom</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Every great story <br />
            <span className="italic">deserves a reader.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-100 mb-10 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
            Inkbloom is a <strong>100% free platform</strong> built to support upcoming writers and passionate readers. 
            If you're an author looking for a safe place to publish your first book, or a reader eager to discover fresh voices, you're in the right place.
          </p>
          
          {/* ✅ AUTH-AWARE CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4 sm:px-0">
            {currentUser ? (
              <>
                <Link 
                  to={userRole === 'writer' ? '/writer-dashboard' : '/discover'} 
                  className="bg-white text-burgundy-900 px-10 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2 shadow-lg"
                >
                  {userRole === 'writer' ? (
                    <><LayoutDashboard className="h-5 w-5" /> Go to My Dashboard</>
                  ) : (
                    <><BookOpen className="h-5 w-5" /> Start Reading</>
                  )}
                </Link>
                <Link 
                  to="/profile" 
                  className="border border-white/40 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition flex items-center justify-center gap-2"
                >
                  <UserCircle className="h-5 w-5" /> My Profile
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/signup" 
                  className="bg-white text-burgundy-900 px-10 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2 shadow-lg"
                >
                  Join for Free <ArrowRight className="h-5 w-5" />
                </Link>
                <Link 
                  to="/login" 
                  className="border border-white/40 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section with Skeletons */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-brand-bg p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                  <Skeleton className="w-16 h-16 rounded-full mx-auto mb-6" />
                  <Skeleton className="h-8 w-3/4 mx-auto mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mx-auto" />
                </div>
              ))
            ) : (
              <>
                <div className="bg-white dark:bg-brand-bg p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center hover:shadow-md transition">
                  <div className="bg-burgundy-100 dark:bg-burgundy-900/30 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-burgundy-900 dark:text-burgundy-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 dark:text-white">Discover Fresh Voices</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Find hand-picked recommendations and hidden gems across Leadership, Health, Fiction, and more.</p>
                </div>
                
                <div className="bg-white dark:bg-brand-bg p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center hover:shadow-md transition">
                  <div className="bg-burgundy-100 dark:bg-burgundy-900/30 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-7 w-7 sm:h-8 sm:w-8 text-burgundy-900 dark:text-burgundy-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 dark:text-white">A Supportive Community</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Connect with fellow readers, share your thoughts, and leave encouraging reviews to help authors grow.</p>
                </div>
                
                <div className="bg-white dark:bg-brand-bg p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center hover:shadow-md transition">
                  <div className="bg-burgundy-100 dark:bg-burgundy-900/30 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PenTool className="h-7 w-7 sm:h-8 sm:w-8 text-burgundy-900 dark:text-burgundy-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 dark:text-white">A Free Launchpad for Writers</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Not sure if your book is ready for big publishers? Publish your original work here for free and build your confidence.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Our Promise Section */}
      <section className="py-16 bg-white dark:bg-brand-bg border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-burgundy-50 dark:bg-white rounded-xl p-8 sm:p-10 border border-burgundy-100 dark:border-gray-200 transition-colors duration-300">
            <Heart className="h-10 w-10 text-burgundy-900 dark:text-burgundy-900 mx-auto mb-6" />
            <h3 className="text-2xl sm:text-3xl font-bold text-burgundy-900 dark:text-burgundy-900 mb-4 font-serif">
              Our Promise to You
            </h3>
            <p className="text-base sm:text-lg text-gray-900 dark:text-gray-900 leading-relaxed">
              Inkbloom is dedicated to empowering the next generation of storytellers. 
              We provide a <strong>100% free, safe space</strong> for upcoming authors to publish their original work 
              and for readers to discover hidden gems. No paywalls, no pressure—just a community helping each other grow.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white dark:bg-brand-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-burgundy-900 dark:text-white mb-6 font-serif">About Inkbloom</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            We believe that every writer deserves a safe space to share their work without the pressure of traditional publishing. 
            Inkbloom is more than just an app; it's a movement to empower the next generation of storytellers and connect them with readers who crave authentic, fresh perspectives.
          </p>
        </div>
      </section>

      {/* Support / Contact Section */}
      <section className="py-20 bg-gray-50 dark:bg-brand-surface">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-burgundy-900 dark:text-white mb-4 font-serif">Need Help? Get in Touch</h2>
            <p className="text-gray-600 dark:text-gray-300">Have a question, feedback, or need support? Send us a message!</p>
          </div>
          
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input type="text" id="name" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-burgundy-900 outline-none" placeholder="Your Name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" id="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-burgundy-900 outline-none" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea id="message" rows="4" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-burgundy-900 outline-none" placeholder="How can we help you?"></textarea>
            </div>
            <button type="submit" className="w-full bg-burgundy-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-burgundy-800 transition flex items-center justify-center gap-2">
              Send Message <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-burgundy-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                <span className="text-2xl font-bold font-serif">Inkbloom</span>
              </div>
              <p className="text-burgundy-200 text-sm">© 2026 Inkbloom. All rights reserved.</p>
            </div>

            <div className="flex gap-6">
              <a href="#" className="text-burgundy-200 hover:text-white transition transform hover:scale-110">
                <img src={instagramIcon} alt="Instagram" className="h-6 w-6" />
              </a>
              <a href="#" className="text-burgundy-200 hover:text-white transition transform hover:scale-110">
                <img src={facebookIcon} alt="Facebook" className="h-6 w-6" />
              </a>
              <a href="#" className="text-burgundy-200 hover:text-white transition transform hover:scale-110">
                <img src={xIcon} alt="Twitter/X" className="h-6 w-6" />
              </a>
              <a href="#" className="text-burgundy-200 hover:text-white transition transform hover:scale-110">
                <img src={gmailIcon} alt="Email" className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-burgundy-800 text-center">
            <p className="text-burgundy-300 text-xs">© 2026 Feyisholadesigns. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}