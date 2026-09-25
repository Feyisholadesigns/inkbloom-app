// src/components/ReaderWatermark.jsx
// Subtle diagonal branding stamp on every page: © Author Name • Inkbloom
// pointer-events-none = never interferes with highlighting/quotes.

export default function ReaderWatermark({ text }) {
  if (!text) return null;
  const stamp = `© ${text} • Inkbloom`;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10" aria-hidden="true">
      {[18, 48, 78].map((top) => (
        <div key={top} className="absolute w-full flex justify-center" style={{ top: `${top}%` }}>
          <span
            className="text-black/25 text-[12px] font-mono whitespace-nowrap select-none"
            style={{ transform: 'rotate(-30deg)' }}
          >
            {stamp}
          </span>
        </div>
      ))}
    </div>
  );
}