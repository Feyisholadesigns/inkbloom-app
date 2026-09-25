// src/components/QuoteShare.jsx
import { useState, useRef } from 'react';
import { X, Download, Share2, Palette } from 'lucide-react';
import html2canvas from 'html2canvas';

// ✅ 5 Premium Templates
const TEMPLATES = [
  {
    name: 'Sunset Glow',
    cardClass: 'bg-gradient-to-br from-rose-500 to-orange-400',
    textClass: 'text-white',
    quoteClass: 'text-white',
    authorClass: 'text-white/90',
    brandClass: 'text-white/70',
    borderClass: 'border-white/20',
    quoteMark: '"',
  },
  {
    name: 'Midnight Ink',
    cardClass: 'bg-slate-900 border border-slate-700',
    textClass: 'text-gray-100',
    quoteClass: 'text-gray-100',
    authorClass: 'text-gray-300',
    brandClass: 'text-gray-500',
    borderClass: 'border-slate-700',
    quoteMark: '"',
  },
  {
    name: 'Cream Paper',
    cardClass: 'bg-[#f8f5f2]',
    textClass: 'text-stone-800',
    quoteClass: 'text-stone-900',
    authorClass: 'text-stone-600',
    brandClass: 'text-stone-400',
    borderClass: 'border-stone-200',
    quoteMark: '"',
  },
  {
    name: 'Neon Highlight',
    cardClass: 'bg-white border border-gray-200',
    textClass: 'text-gray-900',
    quoteClass: 'text-gray-900',
    authorClass: 'text-gray-600',
    brandClass: 'text-gray-400',
    borderClass: 'border-gray-200',
    quoteMark: '"',
    highlight: true, // Special flag for highlighter effect
  },
  {
    name: 'Forest Mist',
    cardClass: 'bg-gradient-to-b from-emerald-900 to-teal-800',
    textClass: 'text-white',
    quoteClass: 'text-white',
    authorClass: 'text-emerald-100',
    brandClass: 'text-emerald-200/60',
    borderClass: 'border-emerald-700/50',
    quoteMark: '"',
  },
];

export default function QuoteShare({ quoteText, bookTitle, authorName, onClose }) {
  const [template, setTemplate] = useState(0);
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef(null);

  const currentTemplate = TEMPLATES[template];

  const generateImage = async () => {
    if (!cardRef.current) return null;
    try {
      setGenerating(true);
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // High resolution for crisp text
        useCORS: true,
        backgroundColor: null,
      });
      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error('Failed to generate image:', err);
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;
    
    const link = document.createElement('a');
    link.download = `${bookTitle.replace(/\s+/g, '_')}_quote.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleShareWhatsApp = async () => {
    // Generate image first, then share (or just share text if image fails)
    const text = `"${quoteText}"\n\n— ${authorName}, ${bookTitle}\n\nShared via Inkbloom 📚\ninkbloom-app.vercel.app`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-brand-surface rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-brand-surface z-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="h-5 w-5 text-burgundy-900 dark:text-burgundy-400" /> 
            Choose a Style
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Template Selector */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-5 gap-2">
            {TEMPLATES.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setTemplate(i)}
                className={`h-10 rounded-lg text-[10px] font-bold transition border-2 ${
                  template === i
                    ? 'border-burgundy-900 dark:border-white scale-105'
                    : 'border-transparent hover:scale-105'
                } ${t.cardClass} ${t.textClass} flex items-center justify-center overflow-hidden`}
                title={t.name}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
            {TEMPLATES[template].name}
          </p>
        </div>

        {/* Quote Card Preview */}
        <div className="p-6 bg-gray-50 dark:bg-black/20">
          <div
            ref={cardRef}
            className={`${currentTemplate.cardClass} ${currentTemplate.textClass} p-8 sm:p-10 rounded-xl shadow-2xl aspect-[4/5] flex flex-col justify-between relative overflow-hidden`}
          >
            {/* Decorative large quote mark */}
            <div className={`absolute top-4 left-6 text-[120px] leading-none opacity-20 font-serif select-none ${currentTemplate.quoteClass}`}>
              {currentTemplate.quoteMark}
            </div>

            <div className="relative z-10 mt-12">
              {currentTemplate.highlight ? (
                // Special highlighter effect
                <p className="text-xl sm:text-2xl leading-snug font-serif font-medium inline bg-yellow-300/80 px-2 py-1 rounded-sm">
                  {quoteText}
                </p>
              ) : (
                <p className="text-xl sm:text-2xl leading-snug font-serif italic">
                  {quoteText}
                </p>
              )}
            </div>
            
            <div className={`relative z-10 border-t ${currentTemplate.borderClass} pt-6 mt-6`}>
              <p className={`text-sm font-bold ${currentTemplate.authorClass} mb-1`}>
                — {authorName}
              </p>
              <p className={`text-xs ${currentTemplate.brandClass} italic`}>
                {bookTitle}
              </p>
              
              {/* Inkbloom branding */}
              <div className={`mt-8 pt-4 border-t ${currentTemplate.borderClass} flex items-center gap-3`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentTemplate.highlight ? 'bg-burgundy-900 text-white' : 'bg-current/20'}`}>
                  <span className="text-sm font-bold">📚</span>
                </div>
                <div>
                  <p className={`text-xs font-bold ${currentTemplate.brandClass} tracking-wider uppercase`}>Inkbloom</p>
                  <p className={`text-[10px] ${currentTemplate.brandClass} opacity-70`}>Where writers blossom</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2 sticky bottom-0 bg-white dark:bg-brand-surface">
          <button
            onClick={handleShareWhatsApp}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            <Share2 className="h-5 w-5" />
            Share to WhatsApp
          </button>
          <button
            onClick={handleDownload}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 bg-burgundy-900 text-white py-3 rounded-lg font-semibold hover:bg-burgundy-800 transition disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            {generating ? 'Generating...' : 'Download Image'}
          </button>
        </div>
      </div>
    </div>
  );
}