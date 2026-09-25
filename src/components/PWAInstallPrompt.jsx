import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if we already have a stored prompt (from previous session)
    const storedPrompt = window.deferredPWAPrompt;
    if (storedPrompt) {
      setDeferredPrompt(storedPrompt);
      setShowBanner(true);
    }

    const handler = (e) => {
      e.preventDefault();
      // Store globally so we don't lose it on remount
      window.deferredPWAPrompt = e;
      setDeferredPrompt(e);
      setShowBanner(true);
      console.log('✅ Install prompt captured!');
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowBanner(false);
      setDeferredPrompt(null);
      window.deferredPWAPrompt = null;
    }
  };

  if (!showBanner || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] bg-white dark:bg-brand-surface p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="bg-burgundy-900 text-white p-2 rounded-lg">
          <Download className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">Install Inkbloom</p>
          <p className="text-xs text-gray-500 dark:text-gray-300">Add to home screen for offline access</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={handleInstallClick}
          className="bg-burgundy-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-burgundy-800 transition"
        >
          Install
        </button>
        <button 
          onClick={() => setShowBanner(false)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}