'use client';

interface LoadingScreenProps {
  progress: number; // 0 to 100
  isExiting: boolean;
}

export default function LoadingScreen({
  progress,
  isExiting,
}: LoadingScreenProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading THE FOREST experience"
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center px-6 bg-[#040506] select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isExiting
          ? 'opacity-0 scale-[1.03] pointer-events-none'
          : 'opacity-100 scale-100 pointer-events-auto'
      }`}
    >
      {/* Subtle dark atmospheric forest glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 46%, rgba(28, 44, 34, 0.28) 0%, rgba(10, 14, 12, 0.72) 48%, rgba(3, 4, 5, 0.98) 100%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Brand Wordmark */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
          THE FOREST
        </h1>

        <p className="mt-2.5 text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-white/55">
          Preparing Experience
        </p>

        {/* Minimal Glass Progress Track */}
        <div className="mt-7 w-52 sm:w-64 h-[2px] rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)] transition-[width] duration-200 ease-out"
            style={{ width: `${clamped}%` }}
          />
        </div>

        {/* Numeric Percentage */}
        <span className="mt-3 text-[11px] font-mono tabular-nums tracking-[0.22em] text-white/70">
          {String(clamped).padStart(2, '0')}%
        </span>
      </div>
    </div>
  );
}

