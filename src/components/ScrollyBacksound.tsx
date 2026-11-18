'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Language } from '@/lib/i18n';

interface ScrollyBacksoundProps {
  activeChapter: number;
  isReady?: boolean;
  lang?: Language;
}

const TARGET_VOLUME = 0.45;
const CROSSFADE_MS = 950;
const TOGGLE_FADE_MS = 320;

const glassButtonStyle: CSSProperties = {
  backdropFilter: 'blur(18px) saturate(180%) brightness(1.06)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%) brightness(1.06)',
};

const EQUALIZER_BARS = [
  { staticHeight: 'h-[7px]', activeHeight: 'h-[12px]', durationMs: 720, delayMs: 0 },
  { staticHeight: 'h-[13px]', activeHeight: 'h-[18px]', durationMs: 560, delayMs: 140 },
  { staticHeight: 'h-[19px]', activeHeight: 'h-[21px]', durationMs: 650, delayMs: 260 },
  { staticHeight: 'h-[13px]', activeHeight: 'h-[17px]', durationMs: 520, delayMs: 90 },
  { staticHeight: 'h-[7px]', activeHeight: 'h-[13px]', durationMs: 780, delayMs: 210 },
] as const;

/**
 * Maps chapter index (0..7) to the assigned backsound track:
 * - Scenes 1 & 2 (0, 1) -> /backsound/1.mp3
 * - Scenes 3, 4, 5, 6 (2, 3, 4, 5) -> /backsound/2.mp3
 * - Scenes 7 & 8 (6, 7) -> /backsound/1.mp3
 */
function getTrackForChapter(chapter: number): 1 | 2 {
  return chapter >= 2 && chapter <= 5 ? 2 : 1;
}

export default function ScrollyBacksound({
  activeChapter,
  isReady = true,
  lang = 'en',
}: ScrollyBacksoundProps) {
  void isReady;
  const [isEnabled, setIsEnabled] = useState(true);
  const [isActuallyPlaying, setIsActuallyPlaying] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  const audio1Ref = useRef<HTMLAudioElement | null>(null);
  const audio2Ref = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const vol1Ref = useRef(0);
  const vol2Ref = useRef(0);
  const targetVol1Ref = useRef(0);
  const targetVol2Ref = useRef(0);
  const fadeDurationRef = useRef(CROSSFADE_MS);

  const isEnabledRef = useRef(isEnabled);
  const activeChapterRef = useRef(activeChapter);
  const audioUnlockedRef = useRef(false);

  useEffect(() => {
    isEnabledRef.current = isEnabled;
    activeChapterRef.current = activeChapter;
  }, [isEnabled, activeChapter]);

  const startFadeLoop = (durationMs = CROSSFADE_MS) => {
    fadeDurationRef.current = durationMs;
    if (rafRef.current !== null) return;

    let lastTs: number | null = null;
    const step = (now: number) => {
      if (lastTs === null) lastTs = now;
      const dt = Math.min(64, Math.max(1, now - lastTs));
      lastTs = now;

      const alpha = Math.min(1, dt / Math.max(80, fadeDurationRef.current));
      const a1 = audio1Ref.current;
      const a2 = audio2Ref.current;

      const next1 = vol1Ref.current + (targetVol1Ref.current - vol1Ref.current) * alpha;
      const next2 = vol2Ref.current + (targetVol2Ref.current - vol2Ref.current) * alpha;

      vol1Ref.current = Math.abs(targetVol1Ref.current - next1) < 0.003 ? targetVol1Ref.current : next1;
      vol2Ref.current = Math.abs(targetVol2Ref.current - next2) < 0.003 ? targetVol2Ref.current : next2;

      if (a1) {
        a1.volume = Math.max(0, Math.min(1, vol1Ref.current));
        if (vol1Ref.current === 0 && targetVol1Ref.current === 0 && !a1.paused) {
          a1.pause();
        }
      }
      if (a2) {
        a2.volume = Math.max(0, Math.min(1, vol2Ref.current));
        if (vol2Ref.current === 0 && targetVol2Ref.current === 0 && !a2.paused) {
          a2.pause();
        }
      }

      const done1 = vol1Ref.current === targetVol1Ref.current;
      const done2 = vol2Ref.current === targetVol2Ref.current;

      if (done1 && done2) {
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  };

  const syncTracks = (chapter: number, enabled: boolean, fadeMs = CROSSFADE_MS) => {
    const a1 = audio1Ref.current;
    const a2 = audio2Ref.current;
    if (!a1 || !a2) return;

    if (!enabled) {
      targetVol1Ref.current = 0;
      targetVol2Ref.current = 0;
      startFadeLoop(fadeMs);
      setIsActuallyPlaying(false);
      return;
    }

    const desiredTrack = getTrackForChapter(chapter);
    const activeAudio = desiredTrack === 1 ? a1 : a2;

    if (desiredTrack === 1) {
      if (a1.paused && vol1Ref.current === 0) {
        a1.currentTime = 0;
      }
      targetVol1Ref.current = TARGET_VOLUME;
      targetVol2Ref.current = 0;
    } else {
      if (a2.paused && vol2Ref.current === 0) {
        a2.currentTime = 0;
      }
      targetVol1Ref.current = 0;
      targetVol2Ref.current = TARGET_VOLUME;
    }

    if (activeAudio.paused) {
      const p = activeAudio.play();
      if (p !== undefined) {
        p.then(() => {
          audioUnlockedRef.current = true;
          setIsAudioUnlocked(true);
          setIsActuallyPlaying(true);
        }).catch(() => {
          // Waiting for user gesture unlock
        });
      } else {
        audioUnlockedRef.current = true;
        setIsAudioUnlocked(true);
        setIsActuallyPlaying(true);
      }
    } else {
      audioUnlockedRef.current = true;
      setIsAudioUnlocked(true);
      setIsActuallyPlaying(true);
    }

    startFadeLoop(fadeMs);
  };

  // Initialize persistent looping Audio elements & browser autoplay gesture unlock
  useEffect(() => {
    const a1 = new Audio('/backsound/1.mp3');
    a1.loop = true;
    a1.preload = 'auto';
    a1.volume = 0;

    const a2 = new Audio('/backsound/2.mp3?v=2');
    a2.loop = true;
    a2.preload = 'auto';
    a2.volume = 0;
    a2.load();

    audio1Ref.current = a1;
    audio2Ref.current = a2;

    // Attempt initial playback (works if browser allows autoplay)
    if (isEnabledRef.current) {
      syncTracks(activeChapterRef.current, true, CROSSFADE_MS);
    }

    const unlockAudio = () => {
      if (audioUnlockedRef.current || !isEnabledRef.current) return;
      syncTracks(activeChapterRef.current, true, CROSSFADE_MS);
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      a1.pause();
      a2.pause();
      a1.src = '';
      a2.src = '';
      audio1Ref.current = null;
      audio2Ref.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Crossfade cleanly whenever user transitions between scene track groups
  useEffect(() => {
    if (!isEnabled) return;
    if (!audioUnlockedRef.current) return;
    syncTracks(activeChapter, true, CROSSFADE_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChapter]);

  const handleToggleSound = () => {
    // If browser blocked autoplay initially and user clicks the button to hear audio,
    // unlock & start playing cleanly while keeping sound ON.
    if (isEnabled && !audioUnlockedRef.current) {
      syncTracks(activeChapter, true, TOGGLE_FADE_MS);
      return;
    }

    const nextEnabled = !isEnabled;
    setIsEnabled(nextEnabled);
    syncTracks(activeChapter, nextEnabled, TOGGLE_FADE_MS);
  };

  const showActiveUi = isEnabled && (isActuallyPlaying || !isAudioUnlocked);

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-5 lg:right-6 z-40 select-none pointer-events-auto">
      <button
        type="button"
        onClick={handleToggleSound}
        aria-label={
          showActiveUi
            ? lang === 'id'
              ? 'Bisukan musik latar'
              : 'Mute backsound'
            : lang === 'id'
              ? 'Putar musik latar'
              : 'Play backsound'
        }
        aria-pressed={showActiveUi}
        className="group flex items-center gap-2.5 sm:gap-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 rounded-full"
      >
        {/* SOUND / SUARA ON / OFF Label (shown beside bubble on mobile & desktop >= 1024px) */}
        <span className="inline-flex sm:hidden lg:inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-medium tracking-[0.18em] sm:tracking-[0.2em] uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] transition-opacity duration-300">
          <span className="text-white/55">{lang === 'id' ? 'SUARA' : 'SOUND'}</span>
          <span className={showActiveUi ? 'text-white' : 'text-white/45'}>
            {showActiveUi ? 'ON' : 'OFF'}
          </span>
        </span>

        {/* Frosted Circular Equalizer Circle */}
        <span
          style={glassButtonStyle}
          className={`relative flex items-center justify-center gap-[3px] w-11 h-11 sm:w-[48px] sm:h-[48px] rounded-full transition-all duration-300 ease-out ${
            showActiveUi
              ? 'bg-white/[0.14] border border-white/40 shadow-[0_14px_32px_rgba(0,0,0,0.45),inset_0_1.5px_1.5px_rgba(255,255,255,0.65),inset_0_-2px_6px_rgba(0,0,0,0.22)] group-hover:border-white/70 group-hover:bg-white/[0.22] group-hover:scale-105'
              : 'bg-white/[0.08] border border-white/25 shadow-[0_12px_28px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-2px_5px_rgba(0,0,0,0.25)] group-hover:border-white/50 group-hover:bg-white/[0.15] group-hover:scale-105'
          }`}
        >
          {/* Specular Curved Glass Highlight */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.04)_45%,rgba(255,255,255,0.1)_100%)]"
          />

          {/* 5-Bar Equalizer Waveform Icon */}
          <span className="relative z-10 flex items-center justify-center gap-[3px] h-6" aria-hidden="true">
            {EQUALIZER_BARS.map((bar, idx) => (
              <span
                key={idx}
                style={
                  showActiveUi
                    ? {
                        animationDuration: `${bar.durationMs}ms`,
                        animationDelay: `${bar.delayMs}ms`,
                      }
                    : undefined
                }
                className={`block w-[2.5px] rounded-full transition-colors duration-200 ${
                  showActiveUi
                    ? `${bar.activeHeight} bg-white animate-sound-wave shadow-[0_0_8px_rgba(255,255,255,0.5)]`
                    : `${bar.staticHeight} bg-white/55`
                }`}
              />
            ))}
          </span>
        </span>
      </button>
    </div>
  );
}

