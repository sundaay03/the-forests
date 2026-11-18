'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import Lenis from 'lenis';
import ScrollyVideoBackground from './ScrollyVideoBackground';
import ScrollyChapter from './ScrollyChapter';
import ScrollyHUD from './ScrollyHUD';
import ScrollyBacksound from './ScrollyBacksound';
import LoadingScreen from './LoadingScreen';
import NavbarLiquidTransition, {
  type LiquidTransitionRequest,
} from './NavbarLiquidTransition';
import type { Language } from '@/lib/i18n';

const emptySubscribe = () => () => {};
const LANG_STORAGE_KEY = 'the-forest-lang';
const LANG_EVENT = 'the-forest-lang-change';

function subscribeLanguage(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(LANG_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(LANG_EVENT, callback);
  };
}

function getLanguageSnapshot(): Language {
  try {
    return window.localStorage.getItem(LANG_STORAGE_KEY) === 'id' ? 'id' : 'en';
  } catch {
    return 'en';
  }
}

// Exact scroll ratio (0.0 -> 1.0) landing squarely on each chapter's main showcase
// (past incoming crossfades, burn/portal transition overlays, with headline/cards at full opacity).
const CHAPTER_TARGET_RATIOS = [
  0.000, // 01 THE GATEWAY    -> "THE FOREST" headline + 1.webm
  0.138, // 02 THE CANOPY     -> "WONDERFUL OF INDONESIA" + 1st gallery photo + 2.webm
  0.270, // 03 THE INFERNO    -> "FOREST AND LAND FIRES" (burn overlay cleared) + 3.webm
  0.429, // 04 STATISTIC      -> Karhutla 3-card dashboard all entered + 4.webm
  0.525, // 05 THE ASHES      -> "WHAT REMAINS" + subtitle + 5.webm
  0.630, // 06 THE HUMAN TOLL -> "HEALTH IMPACTS" + card 01 + 6.webm
  0.788, // 07 THE REBIRTH    -> "REFOREST" + subtitle + 7.webm
  0.935, // 08 THE CONTACT    -> "LET'S BUILD" (portal cleared) + 8new.webm
] as const;

export default function ScrollyExperience() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const lang = useSyncExternalStore<Language>(
    subscribeLanguage,
    getLanguageSnapshot,
    () => 'en'
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const transitionLockRef = useRef(false);
  const transitionIdRef = useRef(0);
  const updateMetricsRef = useRef<(prog: number) => void>(() => {});

  const [activeChapter, setActiveChapter] = useState(0);
  const activeChapterRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [liquidTransition, setLiquidTransition] =
    useState<LiquidTransitionRequest | null>(null);

  // Initial Loading Screen states
  const [loadProgress, setLoadProgress] = useState(12);
  const [isLoaderExiting, setIsLoaderExiting] = useState(false);
  const [isLoaderDone, setIsLoaderDone] = useState(false);

  useEffect(() => {
    activeChapterRef.current = activeChapter;
  }, [activeChapter]);

  const handleToggleLanguage = useCallback(() => {
    const next: Language = getLanguageSnapshot() === 'en' ? 'id' : 'en';
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
      window.dispatchEvent(new Event(LANG_EVENT));
    } catch {
      // Ignore storage access errors
    }
  }, []);

  // Coordinate real asset readiness (fonts + opening scene videos) before dismissing LoadingScreen
  useEffect(() => {
    if (!isMounted) return;

    let cancelled = false;
    let rafId = 0;
    let exitTimer: number | null = null;
    let doneTimer: number | null = null;

    const mountStart = performance.now();
    const MIN_DISPLAY_MS = 3200; // Minimum ~3.2s cinematic loading window
    const MAX_WAIT_MS = 5000; // Hard cap at 5.0s total wait

    let fontsDone = false;
    let currentDisplayProg = 12;
    let finished = false;

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          fontsDone = true;
        })
        .catch(() => {
          fontsDone = true;
        });
    } else {
      fontsDone = true;
    }

    const triggerCompletion = () => {
      if (cancelled || finished) return;
      finished = true;
      setLoadProgress(100);

      exitTimer = window.setTimeout(() => {
        if (cancelled) return;
        setIsLoaderExiting(true);
        doneTimer = window.setTimeout(() => {
          if (cancelled) return;
          setIsLoaderDone(true);
        }, 700);
      }, 220);
    };

    const tickProgress = (now: number) => {
      if (cancelled || finished) return;

      const elapsed = now - mountStart;
      const allVideos = Array.from(document.querySelectorAll('video'));
      const activeVideos = allVideos.filter((v) => Boolean(v.getAttribute('src')));
      const videos = activeVideos.length > 0 ? activeVideos : allVideos;
      const primaryVideo = videos[0];
      const primaryReady = !primaryVideo || primaryVideo.readyState >= 2;

      let readyCount = 0;
      const checkCount = Math.min(4, videos.length);
      for (let i = 0; i < checkCount; i++) {
        if (videos[i].readyState >= (i === 0 ? 2 : 1)) {
          readyCount += 1;
        }
      }

      const videoRatio = checkCount > 0 ? readyCount / checkCount : 1;
      const fontRatio = fontsDone ? 1 : 0;
      const timeRatio = Math.min(1, elapsed / MIN_DISPLAY_MS);

      const targetProg = Math.min(
        98,
        12 + timeRatio * 55 + fontRatio * 13 + videoRatio * 18
      );
      currentDisplayProg += (targetProg - currentDisplayProg) * 0.08;
      setLoadProgress(currentDisplayProg);

      const assetsReady = fontsDone && primaryReady && videoRatio >= 0.5;
      if ((assetsReady && elapsed >= MIN_DISPLAY_MS) || elapsed >= MAX_WAIT_MS) {
        triggerCompletion();
        return;
      }

      rafId = requestAnimationFrame(tickProgress);
    };

    rafId = requestAnimationFrame(tickProgress);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (exitTimer !== null) window.clearTimeout(exitTimer);
      if (doneTimer !== null) window.clearTimeout(doneTimer);
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    // 1. Initialize Lenis Smooth Momentum Scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      autoRaf: true, // Let Lenis manage its internal requestAnimationFrame
    });
    lenisRef.current = lenis;

    let lastProg = -1;
    const minProgDelta =
      window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches
        ? 0.00025
        : 0.00005;
    const updateScrollMetrics = (prog: number) => {
      if (typeof prog !== 'number' || isNaN(prog)) return;
      const clampedProg = Math.max(0, Math.min(1, prog));
      if (Math.abs(clampedProg - lastProg) < minProgDelta) return;
      lastProg = clampedProg;

      // Scale progress by (8 / 7) so Scenes 1–7 preserve their exact 0.0 -> 1.0 checkpoints
      // while Scene 8 (Contact) occupies 1.000 -> 1.143
      const scaledProg = clampedProg * (8 / 7);
      setScrollProgress(scaledProg);

      // Map progress to 8 chapters (0 to 7)
      const rawChapter = Math.min(7, Math.floor(clampedProg * 8));
      setActiveChapter((prev) => (prev === rawChapter ? prev : rawChapter));
    };
    updateMetricsRef.current = updateScrollMetrics;

    // 2. Synchronize Lenis with State
    lenis.on('scroll', (e: { progress?: number; scroll?: number; limit?: number }) => {
      let p = 0;
      if (typeof e?.progress === 'number' && !isNaN(e.progress)) {
        p = e.progress;
      } else if (typeof e?.scroll === 'number' && typeof e?.limit === 'number' && e.limit > 0) {
        p = e.scroll / e.limit;
      } else if (containerRef.current) {
        const maxScroll = containerRef.current.offsetHeight - window.innerHeight;
        p = maxScroll > 0 ? (window.scrollY || window.pageYOffset || 0) / maxScroll : 0;
      }
      updateScrollMetrics(p);
    });

    // 3. Native scroll listener fallback to guarantee updates from pixel 0
    const handleNativeScroll = () => {
      if (!containerRef.current) return;
      const maxScroll = containerRef.current.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const currentScroll = window.scrollY || window.pageYOffset || 0;
      updateScrollMetrics(currentScroll / maxScroll);
    };

    window.addEventListener('scroll', handleNativeScroll, { passive: true });
    // Initial check on load
    handleNativeScroll();

    // 4. Teardown on unmount
    return () => {
      window.removeEventListener('scroll', handleNativeScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isMounted]);

  // Prevent scroll position drift until initial loading screen finishes
  useEffect(() => {
    if (!isMounted) return;
    const lenis = lenisRef.current;
    if (!isLoaderDone) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenis?.start();
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMounted, isLoaderDone]);

  // Prevent browser pinch-zoom, Ctrl+Scroll zoom, and Ctrl +/-/0 keyboard zoom
  useEffect(() => {
    if (!isMounted) return;

    const handleWheelZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    const handleKeyZoom = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (
        e.key === '+' ||
        e.key === '=' ||
        e.key === '-' ||
        e.key === '_' ||
        e.key === '0' ||
        e.code === 'NumpadAdd' ||
        e.code === 'NumpadSubtract' ||
        e.code === 'Numpad0'
      ) {
        e.preventDefault();
      }
    };

    const handleGesture = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener('wheel', handleWheelZoom, { passive: false });
    window.addEventListener('keydown', handleKeyZoom);
    window.addEventListener('gesturestart', handleGesture);
    window.addEventListener('gesturechange', handleGesture);
    window.addEventListener('gestureend', handleGesture);

    return () => {
      window.removeEventListener('wheel', handleWheelZoom);
      window.removeEventListener('keydown', handleKeyZoom);
      window.removeEventListener('gesturestart', handleGesture);
      window.removeEventListener('gesturechange', handleGesture);
      window.removeEventListener('gestureend', handleGesture);
    };
  }, [isMounted]);

  // Executed behind 100% liquid coverage during Scene 3 of NavbarLiquidTransition
  const handleSwapChapter = useCallback((chapterIndex: number) => {
    if (!containerRef.current || !lenisRef.current) return;
    const containerHeight = containerRef.current.offsetHeight - window.innerHeight;
    const safeIdx = Math.max(0, Math.min(CHAPTER_TARGET_RATIOS.length - 1, chapterIndex));
    const targetRatio = CHAPTER_TARGET_RATIOS[safeIdx];
    const targetScroll = targetRatio * containerHeight;

    lenisRef.current.scrollTo(targetScroll, {
      immediate: true,
      force: true,
    });
    window.scrollTo({
      top: targetScroll,
      behavior: 'instant' as ScrollBehavior,
    });
    updateMetricsRef.current(targetRatio);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setLiquidTransition(null);
    transitionLockRef.current = false;
  }, []);

  // Trigger Liquid Morphing Transition whenever a navbar button is clicked
  const handleJumpToChapter = useCallback(
    (chapterIndex: number, origin?: { x: number; y: number }) => {
      if (transitionLockRef.current) return;
      transitionLockRef.current = true;

      const defaultX = typeof window !== 'undefined' ? window.innerWidth * 0.5 : 640;
      const defaultY = 48;

      transitionIdRef.current += 1;
      setLiquidTransition({
        id: transitionIdRef.current,
        sourceChapter: activeChapterRef.current,
        targetChapter: chapterIndex,
        originX: origin?.x ?? defaultX,
        originY: origin?.y ?? defaultY,
      });
    },
    []
  );

  if (!isMounted) {
    return (
      <div className="relative w-full h-[2300vh] bg-black">
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-black">
          <LoadingScreen progress={12} isExiting={false} />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-[2300vh] bg-black">
      {/* Fixed Sticky Viewport (100vh) */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        {/* Cinematic Video Backgrounds (Scroll-driven Scrubbing Engine) */}
        <ScrollyVideoBackground
          activeChapter={activeChapter}
          scrollProgress={scrollProgress}
        />

        {/* Narrative Chapter Content & Advanced Typography */}
        <ScrollyChapter
          activeChapter={activeChapter}
          scrollProgress={scrollProgress}
          isReady={isLoaderExiting || isLoaderDone}
          lang={lang}
        />

        {/* Liquid Morphing Transition Overlay (Navbar Navigation) */}
        <NavbarLiquidTransition
          request={liquidTransition}
          onSwapPage={handleSwapChapter}
          onComplete={handleTransitionComplete}
        />

        {/* Fixed HUD Interface */}
        <ScrollyHUD
          activeChapter={activeChapter}
          scrollProgress={scrollProgress}
          onJumpToChapter={handleJumpToChapter}
          lang={lang}
          onToggleLanguage={handleToggleLanguage}
        />

        {/* Top-Right Backsound Controller & Toggle */}
        <ScrollyBacksound
          activeChapter={activeChapter}
          isReady={isLoaderExiting || isLoaderDone}
          lang={lang}
        />

        {/* Initial Preloader Covering Component & Video Hydration */}
        {!isLoaderDone && (
          <LoadingScreen progress={loadProgress} isExiting={isLoaderExiting} />
        )}
      </div>
    </div>
  );
}
