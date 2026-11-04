'use client';

import { useEffect, useState } from 'react';
import { soundscape } from './AudioAtmosphere';

interface ScrollyHUDProps {
  activeChapter: number;
  scrollProgress: number;
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
  scrollProgress,
  onJumpToChapter,
}: ScrollyHUDProps) {
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [timecode, setTimecode] = useState('00:00:00:00');

  // Dynamic Timecode Generator
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0');
      setTimecode(`${h}:${m}:${s}:${ms}`);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // Update audio mood whenever active chapter changes
  useEffect(() => {
    if (soundscape && isAudioActive) {
      soundscape.updateMoodByChapter(activeChapter);
    }
  }, [activeChapter, isAudioActive]);

  const toggleAudio = () => {
    if (!soundscape) return;
    const nextState = !isAudioActive;
    setIsAudioActive(nextState);
    soundscape.setPlaying(nextState);
    if (nextState) {
      soundscape.updateMoodByChapter(activeChapter);
    }
  };

  const currentChapter = CHAPTERS[activeChapter] || CHAPTERS[0];

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none flex flex-col justify-between p-6 sm:p-10">
      {/* Top Bar HUD */}
      <header className="flex items-center justify-between w-full pointer-events-auto">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <span
            className={`h-2.5 w-2.5 rounded-full transition-colors duration-500 ${
              activeChapter === 2 || activeChapter === 3
                ? 'bg-red-500 shadow-[0_0_12px_#ef4444]'
                : activeChapter === 4
                ? 'bg-neutral-400'
                : 'bg-emerald-400 shadow-[0_0_12px_#10b981]'
            }`}
          />
          <span className="text-xs sm:text-sm font-mono tracking-[0.3em] uppercase text-white font-bold">
            THE FORESTS
          </span>
        </div>

        {/* Center Chapter Pill */}
        <div className="hidden sm:flex items-center gap-2 border border-white/15 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] font-mono tracking-widest text-neutral-300">
          <span className="text-emerald-400 font-bold">{currentChapter.tag}</span>
          <span>/</span>
          <span className="text-white">{currentChapter.title}</span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={toggleAudio}
          className="flex items-center gap-2 border border-white/20 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest text-neutral-300 hover:text-white hover:border-white/40 transition-all cursor-pointer"
        >
          <div className="flex items-end gap-[2px] h-3">
            <span
              className={`w-[2px] bg-emerald-400 transition-all duration-300 ${
                isAudioActive ? 'h-3 animate-pulse' : 'h-1'
              }`}
            />
            <span
              className={`w-[2px] bg-emerald-400 transition-all duration-300 ${
                isAudioActive ? 'h-2 animate-bounce' : 'h-1'
              }`}
            />
            <span
              className={`w-[2px] bg-emerald-400 transition-all duration-300 ${
                isAudioActive ? 'h-3.5 animate-pulse' : 'h-1'
              }`}
            />
          </div>
          <span>{isAudioActive ? 'ATMOSPHERE ON' : 'AUDIO OFF'}</span>
        </button>
      </header>

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

      {/* Bottom Status HUD */}
      <footer className="flex flex-col sm:flex-row items-start sm:items-end justify-between w-full gap-3 text-[10px] sm:text-xs font-mono tracking-[0.2em] text-neutral-400 pointer-events-auto">
        {/* Bottom Left: Timecode and Coordinates */}
        <div className="flex flex-col gap-1 bg-black/30 backdrop-blur-md px-3 py-2 rounded border border-white/10">
          <div className="flex items-center gap-3 text-white">
            <span className="text-emerald-400 font-bold">TIMECODE:</span>
            <span>{timecode}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            <span>LAT: 47°33&apos;14&quot;N</span>
            <span>•</span>
            <span>LON: 121°44&apos;31&quot;W</span>
          </div>
        </div>

        {/* Bottom Right: Scroll Indicator & Progress */}
        <div className="flex items-center gap-4 bg-black/30 backdrop-blur-md px-3 py-2 rounded border border-white/10">
          <span className="text-neutral-500">PROGRESS</span>
          <span className="text-white font-bold">{Math.round(scrollProgress * 100)}%</span>
          <span className="inline-block animate-bounce text-emerald-400">↓</span>
        </div>
      </footer>
    </div>
  );
}

