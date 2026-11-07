'use client';

import { useEffect, useState } from 'react';

interface ScrollyChapterProps {
  activeChapter: number;
  scrollProgress?: number;
}

export default function ScrollyChapter({
  activeChapter,
  scrollProgress = 0,
}: ScrollyChapterProps) {
  // Live containment counter for Scene 4
  const [containment, setContainment] = useState(0);

  // Scene 1 Video Playback Time (mapped from scrollProgress 0.0 to 0.09 across 9.93s duration)
  const s1Time = Math.min(9.93, Math.max(0, (scrollProgress / 0.09) * 9.93));

  // Scene 1: "THE FOREST" title and subtitle fade out away between detik 4 and 5
  let s1TitleOpacity = 1;
  let s1TitleTranslateY = 0;
  let s1TitleBlur = 0;
  if (s1Time >= 5.0) {
    s1TitleOpacity = 0;
    s1TitleTranslateY = -35;
    s1TitleBlur = 8;
  } else if (s1Time >= 4.0) {
    const fadeRatio = (s1Time - 4.0) / 1.0;
    s1TitleOpacity = Math.max(0, Math.min(1, 1 - fadeRatio));
    s1TitleTranslateY = -fadeRatio * 35;
    s1TitleBlur = fadeRatio * 8;
  }

  // Scene 1: "About" appears at detik 7, remains visible, and fades out away before transition to Scene 2
  let s1AboutOpacity = 0;
  let s1AboutTranslateY = 24;
  let s1AboutBlur = 0;

  if (s1Time < 6.8) {
    // Before detik 7: hidden
    s1AboutOpacity = 0;
    s1AboutTranslateY = 24;
    s1AboutBlur = 4;
  } else if (s1Time < 7.6) {
    // Fade in between detik 6.8 and 7.6
    const enterRatio = (s1Time - 6.8) / 0.8;
    s1AboutOpacity = Math.max(0, Math.min(1, enterRatio));
    s1AboutTranslateY = (1 - s1AboutOpacity) * 24;
    s1AboutBlur = (1 - s1AboutOpacity) * 4;
  } else if (scrollProgress < 0.095) {
    // Stays fully visible throughout Scene 1 until the video concludes
    s1AboutOpacity = 1;
    s1AboutTranslateY = 0;
    s1AboutBlur = 0;
  } else {
    // Fades out away before transition to Scene 2 (scrollProgress 0.095 to 0.115)
    const exitRatio = Math.min(1, Math.max(0, (scrollProgress - 0.095) / 0.02));
    s1AboutOpacity = Math.max(0, 1 - exitRatio);
    s1AboutTranslateY = -exitRatio * 35; // floats upward as it fades away
    s1AboutBlur = exitRatio * 8;
  }

  // Local progress inside Scene 3 (0.286 to 0.429 mapped to 0.0 -> 1.0)
  const s3Prog = Math.max(0, Math.min(1, (scrollProgress - 0.286) / 0.143));

  useEffect(() => {
    if (activeChapter === 3) {
      setContainment(0);
      const interval = setInterval(() => {
        setContainment((prev) => {
          if (prev >= 42) {
            clearInterval(interval);
            return 42;
          }
          return prev + 3;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [activeChapter]);

  // Scene 3 scroll-choreographed opacity and transform
  // Stage 1 (0.0 to 0.20): Fade in & entrance
  // Stage 2 (0.20 to 0.65): Center stage & telemetry reveal
  // Stage 3 (0.65 to 0.95): Dissolve and lift into smoke as text finishes
  const s3EnterOpacity = Math.min(1, s3Prog / 0.18);
  const s3ExitOpacity = s3Prog > 0.65 ? Math.max(0, 1 - (s3Prog - 0.65) / 0.28) : 1;
  const s3OverallOpacity = activeChapter === 2 ? s3EnterOpacity * s3ExitOpacity : 0;
  const s3TranslateY = s3Prog > 0.65 ? -(s3Prog - 0.65) * 80 : 0;

  return (
    <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-center select-none pointer-events-none w-full">
      {/* ===================== SCENE 1: THE ENTRANCE & ABOUT ===================== */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-out px-4 pointer-events-none ${
          activeChapter === 0
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
        }`}
      >
        {/* Phase 1: "THE FOREST" and subtitle (fades out between detik 4 and 5) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-4 transition-all duration-200 ease-out pointer-events-none"
          style={{
            opacity: s1TitleOpacity,
            transform: `translateY(${s1TitleTranslateY}px)`,
            filter: `blur(${s1TitleBlur}px)`,
          }}
        >
          <div className="relative flex flex-col items-center justify-center">
            {/* Cinematic Ambient Dark Shadow behind text (feathered soft radial shadow, no box borders) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -m-8 sm:-m-16 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0) 75%)',
                filter: 'blur(35px)',
                transform: 'translate3d(0, 0, 0)',
              }}
            />

            {/* Headline with Vertical Mask Slide-up & Letter Stagger */}
            <h1 className="relative text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight leading-[0.88] text-white flex flex-wrap justify-center overflow-hidden py-3 sm:py-5 text-cinematic-shadow">
              {'THE FOREST'.split('').map((char, i) => (
                <span
                  key={i}
                  style={{
                    transitionDelay: `${120 + i * 45}ms`,
                  }}
                  className={`inline-block transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    activeChapter === 0
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-full opacity-0'
                  }`}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>

            {/* Subtitle */}
            <p
              className={`relative mt-6 sm:mt-8 text-xs sm:text-sm md:text-base font-semibold text-white/95 tracking-[0.25em] uppercase max-w-xl transition-all duration-700 delay-500 subtitle-cinematic-shadow ${
                activeChapter === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Before civilization, silence reigned.
            </p>
          </div>
        </div>

        {/* Phase 2: "About" Section (appears at detik 7 and fades out away before transition to Scene 2) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 transition-all duration-200 ease-out pointer-events-none max-w-4xl mx-auto"
          style={{
            opacity: s1AboutOpacity,
            transform: `translateY(${s1AboutTranslateY}px)`,
            filter: `blur(${s1AboutBlur}px)`,
          }}
        >
          <div className="relative flex flex-col items-center justify-center w-full">
            {/* Cinematic Ambient Dark Shadow behind About */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -m-8 sm:-m-12 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0) 80%)',
                filter: 'blur(35px)',
                transform: 'translate3d(0, 0, 0)',
              }}
            />

            {/* Headline */}
            <h2 className="relative text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight text-white text-cinematic-shadow">
              ABOUT
            </h2>

            {/* Narrative Overview */}
            <p className="relative mt-5 sm:mt-6 text-sm sm:text-base md:text-lg font-normal text-white/95 tracking-wide max-w-2xl leading-relaxed subtitle-cinematic-shadow">
              An interactive cinematic journey into ancient woodlands — witnessing their primordial majesty, the sudden terror of wildfire, and nature&apos;s quiet resilience toward rebirth.
            </p>
          </div>
        </div>
      </div>

      {/* ===================== SCENE 2: THE CANOPY ===================== */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-out px-4 pointer-events-none ${
          activeChapter === 1
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
        }`}
      >
        {/* Split-word blur-to-sharp focus with horizontal tracking expansion */}
        <h1
          className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.9] text-white transform transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            activeChapter === 1
              ? 'filter-none tracking-[0.12em] opacity-100'
              : 'blur-md tracking-tighter opacity-0'
          }`}
        >
          WONDERFULL OF INDONESIAN
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-6 sm:mt-8 text-sm sm:text-lg md:text-xl font-light text-neutral-200 tracking-wider max-w-xl transition-all duration-700 delay-500 ${
            activeChapter === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Billions of respirations sustaining the biosphere.
        </p>
      </div>

      {/* ===================== SCENE 3: THE INFERNO (SCROLL CHOREOGRAPHED OBJECTS) ===================== */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 pointer-events-none"
        style={{
          opacity: s3OverallOpacity,
          transform: `translateY(${s3TranslateY}px)`,
          filter: s3Prog > 0.7 ? `blur(${(s3Prog - 0.7) * 20}px)` : 'none',
          transition: 'opacity 0.15s ease-out, filter 0.2s ease-out',
        }}
      >

        {/* Fast kinetic reveal with heat-shimmer & orange-amber text glow */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight text-white animate-heat-shimmer drop-shadow-[0_0_35px_rgba(255,87,34,0.8)]">
          FOREST AND LAND FIRES
        </h1>
      </div>

      {/* ===================== SCENE 4: THE RESISTANCE ===================== */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-out px-4 pointer-events-none ${
          activeChapter === 3
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
        }`}
      >
        <div
          className={`flex items-center gap-3 mb-4 transition-all duration-500 delay-100 ${
            activeChapter === 3 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" />
        </div>

        {/* High-contrast Red/White Stencil Typography */}
        <h1
          className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-wider text-white border-y-2 border-red-600/80 py-2 sm:py-4 px-6 animate-emergency-beacon bg-black/40 backdrop-blur-sm transition-all duration-500 ${
            activeChapter === 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <span className="text-red-500">THE</span> FRONTLINE
        </h1>

        {/* Animated Numeric Containment Counter */}
        <div
          className={`mt-6 flex items-center gap-3 font-mono text-xs sm:text-sm tracking-widest text-red-400 bg-red-950/40 border border-red-800/60 rounded-full px-5 py-2 transition-all duration-500 delay-200 ${
            activeChapter === 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span>FIRE CONTAINMENT STATUS:</span>
          <span className="text-white font-bold text-base">{containment}%</span>
        </div>

        {/* Subtitle */}
        <p
          className={`mt-4 sm:mt-6 text-sm sm:text-lg font-mono text-neutral-300 tracking-wide max-w-lg transition-all duration-500 delay-300 ${
            activeChapter === 3 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Holding the perimeter in the dark.
        </p>
      </div>

      {/* ===================== SCENE 5: THE ASHES ===================== */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-out px-4 pointer-events-none ${
          activeChapter === 4
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
        }`}
      >
        <span
          className={`text-[11px] sm:text-xs font-mono tracking-[0.35em] uppercase text-neutral-400 mb-4 transition-all duration-700 delay-100 ${
            activeChapter === 4 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
          }`}
        >
          ACT V • THE ASHES
        </span>

        {/* Letter-by-letter opacity fade mimicking settling ash */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight text-neutral-200 flex flex-wrap justify-center py-2">
          {'WHAT REMAINS'.split('').map((char, i) => (
            <span
              key={i}
              style={{
                transitionDelay: `${150 + i * 70}ms`,
              }}
              className={`inline-block transform transition-all duration-1000 ease-out ${
                activeChapter === 4
                  ? 'opacity-100 filter-none translate-y-0'
                  : 'opacity-0 blur-sm -translate-y-3'
              }`}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-6 sm:mt-8 text-sm sm:text-lg md:text-xl font-light text-neutral-400 tracking-widest max-w-xl italic transition-all duration-1000 delay-700 ${
            activeChapter === 4 ? 'opacity-85 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Where ancient canopies stood, silence and ash.
        </p>
      </div>

      {/* ===================== SCENE 6: THE HUMAN TOLL ===================== */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-out px-4 pointer-events-none ${
          activeChapter === 5
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
        }`}
      >
        <span
          className={`text-[11px] sm:text-xs font-mono tracking-[0.35em] uppercase text-amber-400 mb-4 transition-all duration-700 delay-100 ${
            activeChapter === 5 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
          }`}
        >
          ACT VI • THE HUMAN TOLL
        </span>

        {/* Headline with cinematic tracking and smoke blur-to-sharp */}
        <h1
          className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight text-white py-2 transform transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            activeChapter === 5
              ? 'opacity-100 scale-100 filter-none'
              : 'opacity-0 scale-95 blur-md'
          }`}
        >
          <span className="text-amber-400">CHOKING</span> HORIZON
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-6 sm:mt-8 text-sm sm:text-lg md:text-xl font-light text-neutral-300 tracking-wide max-w-xl transition-all duration-1000 delay-300 ${
            activeChapter === 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Toxic smoke knows no boundaries. Every breath becomes a struggle for survival.
        </p>
      </div>

      {/* ===================== SCENE 7: THE REBIRTH ===================== */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-out px-4 pointer-events-none ${
          activeChapter === 6
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
        }`}
      >
        <span
          className={`text-[11px] sm:text-xs font-mono tracking-[0.35em] uppercase text-emerald-400 mb-4 transition-all duration-700 delay-100 ${
            activeChapter === 6 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
          }`}
        >
          ACT VII • THE REBIRTH
        </span>

        {/* Headline with glowing emerald aura */}
        <h1
          className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-[0.05em] text-white py-2 transition-all duration-1000 ease-out drop-shadow-[0_0_40px_rgba(16,185,129,0.5)] ${
            activeChapter === 6
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-6 scale-95'
          }`}
        >
          <span className="text-emerald-400">NEW</span> ROOTS
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-6 sm:mt-8 text-sm sm:text-lg md:text-xl font-light text-neutral-200 tracking-wide max-w-xl transition-all duration-1000 delay-300 ${
            activeChapter === 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          From the ashes of yesterday, human hands plant the seeds of tomorrow.
        </p>
      </div>
    </div>
  );
}
