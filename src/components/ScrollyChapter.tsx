'use client';

import IndonesiaGallery from './IndonesiaGallery';
import BurnTransition from './BurnTransition';
import BurnGallery from './BurnGallery';
import HealthImpacts from './HealthImpacts';
import PortalTransition from './PortalTransition';
import KarhutlaDashboard from './KarhutlaDashboard';

interface ScrollyChapterProps {
  activeChapter: number;
  scrollProgress?: number;
}

export default function ScrollyChapter({
  activeChapter,
  scrollProgress = 0,
}: ScrollyChapterProps) {
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

  // Scene 3 scroll-choreographed opacity and transform
  // Stage 1 (0.00 to 0.18): "FOREST AND LAND FIRES" entrance and center stage
  // Stage 2 (0.18 to 0.26): Title dissolves, lifts into smoke and is 100% gone by 0.26
  // Stage 3 (0.29 onwards): BurnGallery 3D Cover Flow photos & "BURNING THE FUTURE" enter from right
  const s3TitleEnter = Math.min(1, s3Prog / 0.06);
  const s3TitleExit = s3Prog > 0.18 ? Math.min(1, (s3Prog - 0.18) / 0.08) : 0;
  const s3TitleOpacity = activeChapter === 2 ? s3TitleEnter * (1 - s3TitleExit) : 0;
  const s3TitleTranslateY = -s3TitleExit * 45;
  const s3TitleBlur = s3TitleExit * 10;
  const s3TitleScale = 1 - s3TitleExit * 0.08;

  // Scene 4 (STATISTIC): local progress 0.429 to 0.571
  const s4Prog = Math.max(0, Math.min(1, (scrollProgress - 0.429) / 0.143));
  // Stage 1 (0.00 to 0.16): "STATISTIC" title enters and stays centered on screen
  const s4TitleEnter = Math.min(1, s4Prog / 0.08);
  // Stage 2 (0.16 to 0.26): Title dissolves and is 100% GONE before cards appear
  const s4TitleExit = s4Prog > 0.16 ? Math.min(1, (s4Prog - 0.16) / 0.10) : 0;
  const s4TitleOpacity = activeChapter === 3 ? s4TitleEnter * (1 - s4TitleExit) : 0;
  const s4TitleTranslateY = -s4TitleExit * 28;
  const s4TitleBlur = s4TitleExit * 8;
  const s4TitleScale = 1.06 - s4TitleExit * 0.06;

  // Stage 3 (0.29 to 0.45): Cards enter ONLY AFTER title has completely disappeared
  const s4CardsEnter = Math.max(0, Math.min(1, (s4Prog - 0.29) / 0.16));

  // Stage 4 (0.80 to 1.00): Scene 4 exits into Scene 5
  const s4ExitProg = s4Prog > 0.80 ? Math.max(0, Math.min(1, (s4Prog - 0.80) / 0.20)) : 0;
  const s4SceneOpacity = activeChapter === 3 ? 1 - s4ExitProg : 0;
  const s4TranslateY = -s4ExitProg * 35;
  const s4Blur = s4ExitProg * 8;

  // Scene 5 (THE ASHES): local progress 0.571 to 0.714
  // Fast fade out starting at 0.48 so it is completely gone before Scene 6 crossfades in
  const s5Prog = Math.max(0, Math.min(1, (scrollProgress - 0.571) / 0.143));
  const s5ExitProg = s5Prog > 0.48 ? Math.max(0, Math.min(1, (s5Prog - 0.48) / 0.22)) : 0;
  const s5Opacity = activeChapter === 4 ? 1 - s5ExitProg : 0;
  const s5TranslateY = -s5ExitProg * 35;
  const s5Blur = s5ExitProg * 8;

  // Scene 6 (THE HUMAN TOLL): local progress 0.714 to 0.857
  // Active viewing range for 3 pairs is 0.00 to 0.70.
  // Fast fade out starting at 0.70 so it is completely gone before Scene 7 crossfades in at 0.829
  const s6Prog = Math.max(0, Math.min(1, (scrollProgress - 0.714) / 0.143));
  const s6ExitProg = s6Prog > 0.70 ? Math.max(0, Math.min(1, (s6Prog - 0.70) / 0.12)) : 0;
  const s6Opacity = activeChapter === 5 ? 1 - s6ExitProg : 0;
  const s6TranslateY = -s6ExitProg * 35;
  const s6Blur = s6ExitProg * 8;

  // Global Burn / Erosion Transition Progress between Scene 2 and Scene 3
  // Scene 2 photos finish before scrollProgress = 0.245 (s2Prog ≈ 0.70)
  // Transition starts at 0.246, peaks at 0.286 (Scene 3 entrance), and dissolves smoothly by 0.305
  let globalBurnProgress = 0;
  if (scrollProgress >= 0.246 && scrollProgress <= 0.286) {
    globalBurnProgress = (scrollProgress - 0.246) / (0.286 - 0.246);
  } else if (scrollProgress > 0.286 && scrollProgress <= 0.305) {
    globalBurnProgress = Math.max(0, 1 - (scrollProgress - 0.286) / (0.305 - 0.286));
  }

  // Scene 7 (THE REBIRTH): local progress 0.857 to 1.000
  // Gets sucked into the portal vortex at the end of Scene 7 (s7Prog > 0.64)
  const s7Prog = Math.max(0, Math.min(1, (scrollProgress - 0.857) / 0.143));
  const s7SuctionRaw = s7Prog > 0.64 ? Math.max(0, Math.min(1, (s7Prog - 0.64) / 0.32)) : 0;
  const s7SuctionEase = s7SuctionRaw * s7SuctionRaw;
  const s7Opacity = activeChapter === 6 ? Math.max(0, 1 - s7SuctionEase * 1.15) : 0;
  const s7Scale = 1 - s7SuctionEase * 0.85;
  const s7Rotate = -s7SuctionEase * 14;
  const s7Blur = s7SuctionEase * 12;

  // Global Portal Suction Transition between end of Scene 7 (0.945) and start of Scene 8 (1.038)
  let globalPortalProgress = 0;
  if (scrollProgress >= 0.945 && scrollProgress <= 1.038) {
    globalPortalProgress = (scrollProgress - 0.945) / (1.038 - 0.945);
  }

  // Scene 8 (THE CONTACT): local progress 1.000 to 1.143
  // Emerges smoothly out from the portal vortex after s8Prog = 0.14
  const s8Prog = Math.max(0, Math.min(1, (scrollProgress - 1.0) / 0.143));
  const s8EnterRaw = Math.max(0, Math.min(1, (s8Prog - 0.14) / 0.22));
  const s8EnterEase = 1 - Math.pow(1 - s8EnterRaw, 2.5);
  const s8Opacity = activeChapter === 7 ? s8EnterEase : 0;
  const s8Scale = 0.84 + s8EnterEase * 0.16;
  const s8Blur = (1 - s8EnterEase) * 12;

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
            {/* Headline with Vertical Mask Slide-up & Letter Stagger */}
            <h1 className="relative text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight leading-[0.88] text-white flex flex-wrap justify-center py-3 sm:py-5 text-cinematic-shadow">
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

      {/* ===================== SCENE 2: THE CANOPY (WONDERFUL OF INDONESIA & R2 GALLERY) ===================== */}
      <IndonesiaGallery
        activeChapter={activeChapter}
        scrollProgress={scrollProgress}
      />

      {/* ===================== TRANSISI TERBAKAR / TERKIKIS (DISSOLVE / EROSION) ===================== */}
      <BurnTransition progress={globalBurnProgress} />

      {/* ===================== SCENE 3: THE INFERNO (CENTER TITLE: FOREST AND LAND FIRES) ===================== */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 pointer-events-none"
        style={{
          opacity: s3TitleOpacity,
          transform: `translateY(${s3TitleTranslateY}px) scale(${s3TitleScale})`,
          filter: s3TitleBlur > 0 ? `blur(${s3TitleBlur}px)` : 'none',
          transition: 'opacity 0.15s ease-out, transform 0.2s ease-out, filter 0.2s ease-out',
        }}
      >
        {/* Fast kinetic reveal with heat-shimmer & orange-amber text glow */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight text-white animate-heat-shimmer drop-shadow-[0_0_35px_rgba(255,87,34,0.8)]">
          FOREST AND LAND FIRES
        </h1>
      </div>

      {/* ===================== SCENE 3: BURN GALLERY (3D COVER FLOW PHOTO STREAM) ===================== */}
      <BurnGallery
        activeChapter={activeChapter}
        scrollProgress={scrollProgress}
      />

      {/* ===================== SCENE 4: STATISTIC ===================== */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 pointer-events-none"
        style={{
          opacity: s4SceneOpacity,
          transform: `translateY(${s4TranslateY}px)`,
          filter: s4Blur > 0 ? `blur(${s4Blur}px)` : 'none',
          transition: 'opacity 0.2s ease-out, filter 0.2s ease-out, transform 0.2s ease-out',
        }}
      >
        {/* Phase 1: Center Title "STATISTIC" (appears first in center, dissolves when cards arrive) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none will-change-transform"
          style={{
            opacity: s4TitleOpacity,
            transform: `translateY(${s4TitleTranslateY}px) scale(${s4TitleScale})`,
            filter: s4TitleBlur > 0.1 ? `blur(${s4TitleBlur}px)` : 'none',
            transition: 'opacity 0.15s ease-out, transform 0.15s ease-out, filter 0.15s ease-out',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" />
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-wider text-white text-cinematic-shadow">
            STATISTIC
          </h1>
        </div>

        {/* Phase 2: 2-Card 3D Glassmorphism KARHUTLA Data Dashboard centered */}
        <div className="relative z-10 w-full flex items-center justify-center">
          <KarhutlaDashboard
            isActive={activeChapter === 3 && s4ExitProg < 0.35}
            cardsProgress={s4CardsEnter}
          />
        </div>
      </div>

      {/* ===================== SCENE 5: THE ASHES ===================== */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 pointer-events-none"
        style={{
          opacity: s5Opacity,
          transform: `translateY(${s5TranslateY}px)`,
          filter: s5Blur > 0 ? `blur(${s5Blur}px)` : 'none',
          transition: 'opacity 0.2s ease-out, filter 0.2s ease-out, transform 0.2s ease-out',
        }}
      >
        {/* Letter-by-letter opacity fade mimicking settling ash */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight text-neutral-200 flex flex-wrap justify-center py-2">
          {'WHAT REMAINS'.split('').map((char, i) => (
            <span
              key={i}
              style={{
                transitionDelay: `${100 + i * 40}ms`,
              }}
              className={`inline-block transform transition-all duration-700 ease-out ${
                activeChapter === 4 && s5ExitProg < 0.1
                  ? 'opacity-100 filter-none translate-y-0'
                  : 'opacity-0 blur-sm -translate-y-2'
              }`}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          className="mt-6 sm:mt-8 text-sm sm:text-lg md:text-xl font-light text-neutral-400 tracking-widest max-w-xl italic transition-all duration-300"
          style={{
            opacity: s5ExitProg > 0.05 ? 0 : 0.85,
          }}
        >
          Where ancient canopies stood, silence and ash.
        </p>
      </div>

      {/* ===================== SCENE 6: THE HUMAN TOLL ===================== */}
      <div
        className="absolute inset-0 flex items-center justify-start px-8 sm:px-14 md:px-20 lg:px-24 pointer-events-none"
        style={{
          opacity: s6Opacity,
          transform: `translateY(${s6TranslateY}px)`,
          filter: s6Blur > 0 ? `blur(${s6Blur}px)` : 'none',
          transition: 'opacity 0.2s ease-out, filter 0.2s ease-out, transform 0.2s ease-out',
        }}
      >
        <div className="text-left max-w-xl md:max-w-2xl flex flex-col gap-3 sm:gap-4 pointer-events-auto">
          {/* Headline with cinematic tracking and smoke blur-to-sharp */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-[0.92] py-1 drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            <span className="block">HEALTH</span>
            <span className="block">IMPACTS</span>
          </h1>

          {/* Subtitles: 3 at a time, scroll/group driven, with hover reveal for descriptions */}
          <HealthImpacts s6Prog={s6Prog} />
        </div>
      </div>

      {/* ===================== SCENE 7: THE REBIRTH ===================== */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 pointer-events-none"
        style={{
          opacity: s7Opacity,
          transform: `scale(${s7Scale}) rotate(${s7Rotate}deg)`,
          filter: s7Blur > 0.1 ? `blur(${s7Blur}px)` : 'none',
          transition: 'opacity 0.15s ease-out, transform 0.15s ease-out, filter 0.15s ease-out',
        }}
      >
        {/* Headline */}
        <h1
          className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-[0.05em] text-white py-2 transition-all duration-1000 ease-out text-cinematic-shadow ${
            activeChapter === 6
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-6 scale-95'
          }`}
        >
          REFOREST
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-6 sm:mt-8 text-sm sm:text-lg md:text-xl font-light text-neutral-200 tracking-wide max-w-xl transition-all duration-1000 delay-300 subtitle-cinematic-shadow ${
            activeChapter === 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          From the ashes of yesterday, human hands plant the seeds of tomorrow.
        </p>
      </div>

      {/* ===================== TRANSISI TERSEDOT KE PORTAL (SCENE 7 -> SCENE 8) ===================== */}
      <PortalTransition progress={globalPortalProgress} />

      {/* ===================== SCENE 8: THE CONTACT ===================== */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center px-6 ${
          activeChapter === 7 && s8Opacity > 0.2 ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{
          opacity: s8Opacity,
          transform: `scale(${s8Scale})`,
          filter: s8Blur > 0.1 ? `blur(${s8Blur}px)` : 'none',
          transition: 'opacity 0.2s ease-out, transform 0.2s ease-out, filter 0.2s ease-out',
        }}
      >
        <div className="relative flex flex-col items-center justify-center max-w-3xl mx-auto text-center">

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight leading-[0.9] text-white text-cinematic-shadow">
            CONTACT
          </h1>

          {/* Subtitle */}
          <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg font-light text-white/90 tracking-wide max-w-xl leading-relaxed subtitle-cinematic-shadow">
            Every voice, action, and collaboration helps protect Indonesia&apos;s ancient rainforests and restore what was lost.
          </p>

          {/* Interactive Contact Links / Action Pills */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
            <a
              href="mailto:contact@theforest.id"
              className="group relative flex items-center gap-3 px-6 py-3.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 hover:border-white/80 hover:bg-white/15 text-white text-xs sm:text-sm font-mono uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              <span className="h-2 w-2 rounded-full bg-white group-hover:animate-ping" />
              <span>EMAIL US</span>
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 hover:border-white/50 hover:bg-white/10 text-white/90 hover:text-white text-xs sm:text-sm font-mono uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              <span>INSTAGRAM</span>
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 hover:border-white/50 hover:bg-white/10 text-white/90 hover:text-white text-xs sm:text-sm font-mono uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              <span>COLLABORATE</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
