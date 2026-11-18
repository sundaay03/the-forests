'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { CHAPTER_LABELS, type Language } from '@/lib/i18n';

interface ScrollyHUDProps {
  activeChapter: number;
  scrollProgress?: number;
  onJumpToChapter: (index: number, origin?: { x: number; y: number }) => void;
  lang?: Language;
  onToggleLanguage?: () => void;
}

interface ChapterItem {
  id: number;
  tag: string;
  title: string;
  label: string;
  icon: ReactNode;
}

const iconClassName =
  'w-3.5 h-3.5 min-[400px]:w-4 min-[400px]:h-4 min-[430px]:w-[18px] min-[430px]:h-[18px] sm:w-5 sm:h-5 transition-all duration-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]';

const glassBackdropStyle: CSSProperties = {
  backdropFilter: 'blur(18px) saturate(180%) brightness(1.06)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%) brightness(1.06)',
};

const tooltipGlassStyle: CSSProperties = {
  backdropFilter: 'blur(16px) saturate(170%)',
  WebkitBackdropFilter: 'blur(16px) saturate(170%)',
};

const CHAPTERS: ChapterItem[] = [
  {
    id: 1,
    tag: '01',
    title: 'THE GATEWAY',
    label: 'The Gateway',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClassName}
        aria-hidden="true"
      >
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
  {
    id: 2,
    tag: '02',
    title: 'THE CANOPY',
    label: 'The Canopy',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClassName}
        aria-hidden="true"
      >
        <path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z" />
        <path d="M12 22v-3" />
      </svg>
    ),
  },
  {
    id: 3,
    tag: '03',
    title: 'THE INFERNO',
    label: 'The Inferno',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClassName}
        aria-hidden="true"
      >
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
  },
  {
    id: 4,
    tag: '04',
    title: 'STATISTIC',
    label: 'Statistic',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClassName}
        aria-hidden="true"
      >
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
    ),
  },
  {
    id: 5,
    tag: '05',
    title: 'THE ASHES',
    label: 'The Ashes',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClassName}
        aria-hidden="true"
      >
        <path d="M12.8 19.6A2 2 0 1 0 14 16H2" />
        <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
        <path d="M9.8 4.4A2 2 0 1 1 11 8H2" />
      </svg>
    ),
  },
  {
    id: 6,
    tag: '06',
    title: 'THE HUMAN TOLL',
    label: 'Human Toll',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClassName}
        aria-hidden="true"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h5.27" />
      </svg>
    ),
  },
  {
    id: 7,
    tag: '07',
    title: 'THE REBIRTH',
    label: 'The Rebirth',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClassName}
        aria-hidden="true"
      >
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
      </svg>
    ),
  },
  {
    id: 8,
    tag: '08',
    title: 'THE CONTACT',
    label: 'Contact',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClassName}
        aria-hidden="true"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

export default function ScrollyHUD({
  activeChapter,
  scrollProgress = 0,
  onJumpToChapter,
  lang = 'en',
  onToggleLanguage,
}: ScrollyHUDProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Convert scaled scrollProgress (0..1.143 across 8 scenes) back to normalized scroll ratio (0..1)
  const rawScrollRatio = Math.max(0, Math.min(1, scrollProgress * (7 / 8)));
  const thumbHeightPct = 14;
  const thumbTopPct = rawScrollRatio * (100 - thumbHeightPct);

  const chapterLabels = CHAPTER_LABELS[lang];
  const currentChap = CHAPTERS[activeChapter] ?? CHAPTERS[0];
  const currentChapLabel = chapterLabels[activeChapter] ?? currentChap.label;

  return (
    <>
      {/* ===================== TOP-LEFT LANGUAGE SWITCHER (EN / ID) ===================== */}
      <div className="fixed top-4 left-[72px] sm:top-7 sm:left-10 lg:left-14 xl:left-16 z-40 select-none pointer-events-auto">
        <button
          type="button"
          onClick={onToggleLanguage}
          aria-label={
            lang === 'en'
              ? 'Ganti bahasa ke Bahasa Indonesia'
              : 'Switch language to English'
          }
          title={lang === 'en' ? 'Switch to Indonesia (ID)' : 'Ganti ke English (EN)'}
          className="group relative flex items-center gap-2.5 sm:gap-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 rounded-full"
        >
          {/* Frosted Circular Globe Glass Button */}
          <span
            style={glassBackdropStyle}
            className="relative flex items-center justify-center w-11 h-11 sm:w-[48px] sm:h-[48px] rounded-full bg-white/[0.14] border border-white/35 text-white shadow-[0_14px_32px_rgba(0,0,0,0.45),inset_0_1.5px_1.5px_rgba(255,255,255,0.65),inset_0_-2px_6px_rgba(0,0,0,0.22)] transition-all duration-300 ease-out group-hover:border-white/70 group-hover:bg-white/[0.22] group-hover:scale-105 active:scale-95"
          >
            {/* Specular Curved Glass Highlight */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.04)_45%,rgba(255,255,255,0.1)_100%)]"
            />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.85}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative z-10 w-[18px] h-[18px] sm:w-5 sm:h-5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </span>

          {/* Active Language Code beside icon */}
          <span className="inline-flex sm:hidden lg:inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-medium tracking-[0.18em] sm:tracking-[0.2em] uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
            <span className={lang === 'id' ? 'text-white font-bold' : 'text-white/45'}>ID</span>
            <span className="text-white/30">/</span>
            <span className={lang === 'en' ? 'text-white font-bold' : 'text-white/45'}>EN</span>
          </span>

          {/* Tablet Tooltip */}
          <span
            role="tooltip"
            style={tooltipGlassStyle}
            className="hidden sm:block lg:hidden absolute top-full left-0 mt-2.5 px-2.5 py-1 rounded-full bg-white/[0.14] border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),0_8px_20px_rgba(0,0,0,0.45)] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-[10px] font-medium tracking-wider uppercase whitespace-nowrap pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
          >
            {lang === 'id' ? 'Bahasa: ID' : 'Language: EN'}
          </span>
        </button>
      </div>

      {/* ===================== MOBILE: SINGLE GLASS BUBBLE + EXPANDABLE MENU (< sm) ===================== */}
      {isMobileMenuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px] sm:hidden"
        />
      )}

      <div className="fixed top-4 left-4 z-40 sm:hidden select-none pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          style={glassBackdropStyle}
          aria-label={
            isMobileMenuOpen
              ? lang === 'id'
                ? 'Tutup menu navigasi'
                : 'Close navigation menu'
              : lang === 'id'
                ? `Buka menu navigasi (${currentChapLabel})`
                : `Open navigation menu (${currentChapLabel})`
          }
          aria-expanded={isMobileMenuOpen}
          className={`relative flex items-center justify-center w-11 h-11 rounded-full cursor-pointer transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 ${
            isMobileMenuOpen
              ? 'text-white bg-white/[0.22] border border-white/60 shadow-[0_18px_40px_rgba(0,0,0,0.55),inset_0_1.5px_1.5px_rgba(255,255,255,0.8),0_0_18px_rgba(255,255,255,0.22)] scale-105'
              : 'text-white bg-white/[0.14] border border-white/35 shadow-[0_16px_36px_rgba(0,0,0,0.45),inset_0_1.5px_1.5px_rgba(255,255,255,0.65),inset_0_-2px_6px_rgba(0,0,0,0.22)] active:scale-95'
          }`}
        >
          {/* Specular 3D Glass Curved Reflection Overlay */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.32)_0%,rgba(255,255,255,0.06)_42%,rgba(255,255,255,0.12)_100%)]"
          />
          <span className="relative z-10 flex items-center justify-center">
            {isMobileMenuOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              currentChap.icon
            )}
          </span>
        </button>

        {/* Expandable Glass Options List */}
        {isMobileMenuOpen && (
          <nav
            aria-label="Mobile Chapter Navigation"
            style={glassBackdropStyle}
            className="mt-2.5 w-[230px] max-w-[calc(100vw-2rem)] rounded-3xl p-2 bg-black/50 border border-white/30 shadow-[0_24px_55px_rgba(0,0,0,0.65),inset_0_1.5px_1.5px_rgba(255,255,255,0.45),inset_0_-2px_8px_rgba(0,0,0,0.3)] flex flex-col gap-1 animate-fadeIn"
          >
            {CHAPTERS.map((chap, idx) => {
              const isActive = activeChapter === idx;
              return (
                <button
                  key={chap.id}
                  type="button"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setIsMobileMenuOpen(false);
                    onJumpToChapter(idx, {
                      x: rect.left + rect.width * 0.5,
                      y: rect.top + rect.height * 0.5,
                    });
                  }}
                  aria-current={isActive ? 'step' : undefined}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white/[0.20] border border-white/50 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.55)]'
                      : 'bg-transparent border border-transparent text-white/80 hover:bg-white/[0.10] hover:text-white'
                  }`}
                >
                  <span className="flex items-center justify-center shrink-0 w-7 h-7 rounded-full bg-white/[0.12] border border-white/25">
                    {chap.icon}
                  </span>
                  <span className="flex-1 text-xs font-semibold uppercase tracking-wider truncate">
                    {chapterLabels[idx] ?? chap.label}
                  </span>
                  <span className="text-[10px] font-mono text-white/45 tabular-nums">
                    {chap.tag}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* ===================== DESKTOP / TABLET: FULL PILL NAVBAR (sm+) ===================== */}
      <header className="hidden sm:block fixed top-6 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-16px)] select-none pointer-events-auto">
        <nav
          aria-label="Chapter Navigation"
          style={glassBackdropStyle}
          className="relative flex flex-row items-center justify-center rounded-full px-[12px] py-[8px] gap-[12px] bg-white/[0.12] border border-white/30 shadow-[0_20px_44px_rgba(0,0,0,0.45),0_4px_14px_rgba(0,0,0,0.28),inset_0_1.5px_1.5px_rgba(255,255,255,0.65),inset_0_-2px_6px_rgba(0,0,0,0.22)]"
        >
          {/* Specular 3D Glass Curved Reflection Overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.06)_38%,rgba(255,255,255,0)_65%,rgba(255,255,255,0.10)_100%)]"
          />

          {CHAPTERS.map((chap, idx) => {
            const isActive = activeChapter === idx;
            const isFirst = idx === 0;
            const isLast = idx === CHAPTERS.length - 1;
            const chapLabel = chapterLabels[idx] ?? chap.label;

            const tooltipHorizontalAlign = isFirst
              ? 'left-0 sm:left-1/2 sm:-translate-x-1/2'
              : isLast
                ? 'right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2'
                : 'left-1/2 -translate-x-1/2';

            return (
              <button
                key={chap.id}
                type="button"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  onJumpToChapter(idx, {
                    x: rect.left + rect.width * 0.5,
                    y: rect.top + rect.height * 0.5,
                  });
                }}
                aria-label={`${chap.tag} ${chapLabel}`}
                aria-current={isActive ? 'step' : undefined}
                className={`group relative z-10 flex items-center justify-center shrink-0 w-[44px] h-[44px] rounded-full cursor-pointer transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 ${
                  isActive
                    ? 'text-white border border-white/65 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.52)_0%,rgba(255,255,255,0.20)_55%,rgba(255,255,255,0.12)_100%)] shadow-[inset_0_2px_2px_rgba(255,255,255,0.85),inset_0_-2px_5px_rgba(0,0,0,0.25),0_6px_18px_rgba(0,0,0,0.32),0_0_18px_rgba(255,255,255,0.26)] scale-[1.07]'
                    : 'text-white/85 border border-white/25 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.30)_0%,rgba(255,255,255,0.08)_55%,rgba(255,255,255,0.03)_100%)] shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.52),inset_0_-2px_4px_rgba(0,0,0,0.20),0_4px_10px_rgba(0,0,0,0.20)] hover:text-white hover:border-white/50 hover:bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.44)_0%,rgba(255,255,255,0.15)_55%,rgba(255,255,255,0.08)_100%)] hover:shadow-[inset_0_2px_2px_rgba(255,255,255,0.72),inset_0_-2px_4px_rgba(0,0,0,0.22),0_6px_14px_rgba(0,0,0,0.28),0_0_14px_rgba(255,255,255,0.18)] hover:-translate-y-0.5 hover:scale-105'
                }`}
              >
                {chap.icon}

                {/* Floating 3D Glass Tooltip Below Icon */}
                <span
                  role="tooltip"
                  style={tooltipGlassStyle}
                  className={`absolute top-full mt-2.5 ${tooltipHorizontalAlign} px-2.5 py-1 rounded-full bg-white/[0.14] border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),0_8px_20px_rgba(0,0,0,0.45)] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-[10px] font-medium tracking-wider uppercase whitespace-nowrap pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition-all duration-200`}
                >
                  {chapLabel}
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* ===================== BOTTOM-LEFT COPYRIGHT NOTICE ===================== */}
      <footer className="fixed bottom-3.5 left-4 sm:bottom-5 sm:left-6 z-40 pointer-events-none select-none">
        <p className="text-[9px] sm:text-[10.5px] font-mono uppercase tracking-[0.14em] text-white/55 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
          {lang === 'id'
            ? '\u00A9 2026 THE FOREST. Seluruh hak cipta dilindungi.'
            : '\u00A9 2026 THE FOREST. All rights reserved.'}
        </p>
      </footer>

      {/* ===================== RIGHT-EDGE THIN WHITE SCROLLBAR (NON-INTERACTIVE) ===================== */}
      <div
        aria-hidden="true"
        className="fixed top-3 bottom-3 right-1 sm:right-1.5 z-40 w-[3px] pointer-events-none select-none"
      >
        <div className="relative h-full w-full rounded-full bg-white/15 overflow-hidden">
          <div
            style={{
              height: `${thumbHeightPct}%`,
              top: `${thumbTopPct.toFixed(2)}%`,
            }}
            className="absolute left-0 right-0 rounded-full bg-white/85 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
          />
        </div>
      </div>
    </>
  );
}
