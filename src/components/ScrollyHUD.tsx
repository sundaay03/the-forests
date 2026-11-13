'use client';

interface ScrollyHUDProps {
  activeChapter: number;
  scrollProgress?: number;
  onJumpToChapter: (index: number) => void;
}

const CHAPTERS = [
  { id: 1, tag: '01', title: 'THE GATEWAY' },
  { id: 2, tag: '02', title: 'THE CANOPY' },
  { id: 3, tag: '03', title: 'THE INFERNO' },
  { id: 4, tag: '04', title: 'STATISTIC' },
  { id: 5, tag: '05', title: 'THE ASHES' },
  { id: 6, tag: '06', title: 'THE HUMAN TOLL' },
  { id: 7, tag: '07', title: 'THE REBIRTH' },
  { id: 8, tag: '08', title: 'THE CONTACT' },
];

export default function ScrollyHUD({
  activeChapter,
  onJumpToChapter,
}: ScrollyHUDProps) {
  const currentChap = CHAPTERS[activeChapter] ?? CHAPTERS[0];

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none">
      {/* Top Navigation Rail with Click-to-Jump Navigation */}
      <div className="fixed top-6 sm:top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto">
        {/* Active Chapter Indicator */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] transition-all duration-300">
          <span className="text-neutral-400">{currentChap.tag}</span>
          <span className="text-neutral-600">/</span>
          <span className="font-semibold text-white tracking-widest">
            {currentChap.title}
          </span>
        </div>

        {/* Horizontal Navigation Dots Rail */}
        <div className="flex items-center gap-2.5 sm:gap-3 py-1">
          {CHAPTERS.map((chap, idx) => {
            const isActive = activeChapter === idx;
            return (
              <button
                key={chap.id}
                onClick={() => onJumpToChapter(idx)}
                aria-label={chap.title}
                className="group relative flex flex-col items-center justify-center py-2 px-1 cursor-pointer"
              >
                <div
                  className={`h-1.5 transition-all duration-300 rounded-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] ${
                    isActive
                      ? 'w-7 sm:w-9 bg-white shadow-[0_0_12px_rgba(255,255,255,0.95)]'
                      : 'w-2 bg-neutral-500/70 group-hover:bg-white group-hover:w-3.5'
                  }`}
                />

                {/* Hover Tooltip for Quick Chapter Preview */}
                {!isActive && (
                  <div className="absolute top-full mt-2 hidden group-hover:flex flex-col items-center pointer-events-none z-40">
                    <span className="text-white text-[9px] font-mono tracking-widest uppercase whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                      {chap.tag} {chap.title}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
