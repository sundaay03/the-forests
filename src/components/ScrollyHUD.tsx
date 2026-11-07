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
  { id: 4, tag: '04', title: 'THE FRONTLINE' },
  { id: 5, tag: '05', title: 'THE ASHES' },
];

export default function ScrollyHUD({
  activeChapter,
  onJumpToChapter,
}: ScrollyHUDProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none">
      {/* Right Progress Rail with Click-to-Jump Navigation */}
      <div className="fixed right-6 sm:right-10 top-1/2 -translate-y-1/2 flex flex-col items-end gap-5 pointer-events-auto">
        {CHAPTERS.map((chap, idx) => {
          const isActive = activeChapter === idx;
          return (
            <button
              key={chap.id}
              onClick={() => onJumpToChapter(idx)}
              className="group flex items-center gap-3 cursor-pointer py-1"
            >
              <span
                className={`text-[10px] font-mono tracking-widest transition-all duration-300 ${
                  isActive
                    ? 'text-white opacity-100 translate-x-0'
                    : 'text-neutral-500 opacity-0 group-hover:opacity-100 -translate-x-2'
                }`}
              >
                {chap.title}
              </span>
              <div
                className={`h-2 transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-7 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                    : 'w-2 bg-neutral-600 group-hover:bg-neutral-400 group-hover:w-3'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
