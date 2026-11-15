'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollyVideoBackground from './ScrollyVideoBackground';
import ScrollyChapter from './ScrollyChapter';
import ScrollyHUD from './ScrollyHUD';
import NavbarLiquidTransition, {
  type LiquidTransitionRequest,
} from './NavbarLiquidTransition';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ScrollyExperience() {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const transitionLockRef = useRef(false);
  const transitionIdRef = useRef(0);
  const updateMetricsRef = useRef<(prog: number) => void>(() => {});

  const [activeChapter, setActiveChapter] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [liquidTransition, setLiquidTransition] =
    useState<LiquidTransitionRequest | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    const updateScrollMetrics = (prog: number) => {
      if (typeof prog !== 'number' || isNaN(prog)) return;
      const clampedProg = Math.max(0, Math.min(1, prog));
      if (Math.abs(clampedProg - lastProg) < 0.00005) return;
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
      ScrollTrigger.update();
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
      ScrollTrigger.getAll().forEach((t) => t.kill());
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isMounted]);

  // Executed behind 100% liquid coverage during Scene 3 of NavbarLiquidTransition
  const handleSwapChapter = useCallback((chapterIndex: number) => {
    if (!containerRef.current || !lenisRef.current) return;
    const containerHeight = containerRef.current.offsetHeight - window.innerHeight;
    const targetRatio = chapterIndex === 7 ? 7.25 / 8 : chapterIndex / 8;
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
    ScrollTrigger.update();
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
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-black" />
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
        />
      </div>
    </div>
  );
}
