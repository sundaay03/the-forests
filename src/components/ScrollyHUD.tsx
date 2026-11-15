'use client';

import type { CSSProperties, ReactNode } from 'react';

interface ScrollyHUDProps {
  activeChapter: number;
  scrollProgress?: number;
  onJumpToChapter: (index: number, origin?: { x: number; y: number }) => void;
}

interface ChapterItem {
  id: number;
  tag: string;
  title: string;
  label: string;
  icon: ReactNode;
}

const iconClassName =
  'w-4 h-4 min-[430px]:w-[18px] min-[430px]:h-[18px] sm:w-5 sm:h-5 transition-all duration-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]';

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
  onJumpToChapter,
}: ScrollyHUDProps) {
  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-16px)] select-none pointer-events-auto">
      <nav
        aria-label="Chapter Navigation"
        style={glassBackdropStyle}
        className="relative flex flex-row items-center justify-center rounded-full px-2 py-1.5 min-[430px]:px-2.5 min-[430px]:py-2 sm:px-[12px] sm:py-[8px] gap-1.5 min-[430px]:gap-2 sm:gap-[12px] bg-white/[0.12] border border-white/30 shadow-[0_20px_44px_rgba(0,0,0,0.45),0_4px_14px_rgba(0,0,0,0.28),inset_0_1.5px_1.5px_rgba(255,255,255,0.65),inset_0_-2px_6px_rgba(0,0,0,0.22)]"
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
              aria-label={`${chap.tag} ${chap.label}`}
              aria-current={isActive ? 'step' : undefined}
              className={`group relative z-10 flex items-center justify-center shrink-0 w-9 h-9 min-[430px]:w-10 min-[430px]:h-10 sm:w-[44px] sm:h-[44px] rounded-full cursor-pointer transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 ${
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
                {chap.label}
              </span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
