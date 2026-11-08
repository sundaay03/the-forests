'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface BurnGalleryItem {
  id: number;
  file: string;
  title: string;
  location: string;
  tags: string;
  status: string;
  temp: string;
}

export const DEFAULT_BURN_ITEMS: BurnGalleryItem[] = [
  { id: 1, file: '1.webp', title: 'Peatland Conflagration', location: 'Riau Biosphere Frontier', tags: 'Subsurface Fire • High Carbon • Smoldering', status: 'CRITICAL', temp: '820°C' },
  { id: 2, file: '2.webp', title: 'Canopy Crown Flare', location: 'Central Kalimantan Wilderness', tags: 'Treetop Fire • Rapid Spread • Thermal Surge', status: 'EXTREME', temp: '940°C' },
  { id: 3, file: '3.webp', title: 'Ember Firestorm', location: 'Sumatra Forest Boundary', tags: 'Windborne Embers • Spot Fires • Uncontained', status: 'ACTIVE', temp: '760°C' },
  { id: 4, file: '4.webp', title: 'Toxic Haze Corridor', location: 'Palangkaraya Lowland Basin', tags: 'Hazardous PM2.5 • Dense Aerosol • Zero Visibility', status: 'WARNING', temp: '680°C' },
  { id: 5, file: '5.webp', title: 'Charred Understory', location: 'Jambi Lowland Reserve', tags: 'Loss of Biodiversity • Root Burns • Ash Layer', status: 'BURNING', temp: '710°C' },
  { id: 6, file: '6.webp', title: 'Nocturnal Inferno', location: 'South Sumatra Peat Dome', tags: 'Thermal Flare • Satellite Hotspot • High Radiation', status: 'CRITICAL', temp: '890°C' },
  { id: 7, file: '7.webp', title: 'Scorched Peat Horizon', location: 'West Kalimantan Interior', tags: 'Ancient Carbon Loss • Smoldering Horizon', status: 'ACTIVE', temp: '750°C' },
  { id: 8, file: '8.webp', title: 'Breached Firebreak', location: 'Sebangau Peat Sanctuary', tags: 'Perimeter Failure • Flank Expansion • Hotspot', status: 'EXTREME', temp: '910°C' },
  { id: 9, file: '9.webp', title: 'Atmospheric Smoke Plume', location: 'Ketapang Forest Arc', tags: 'Vertical Convection • Stratospheric Drift', status: 'ALERT', temp: '640°C' },
  { id: 10, file: '10.webp', title: 'Ground Zero Desolation', location: 'Barito Basin Corridor', tags: 'Complete Biomass Loss • Sterilized Soil', status: 'AFTERMATH', temp: '420°C' },
  { id: 11, file: '11.webp', title: 'Subterranean Heat Trench', location: 'Muaro Jambi Forest', tags: 'Underground Burning • Deep Peat Horizon', status: 'CRITICAL', temp: '830°C' },
  { id: 12, file: '12.webp', title: 'Smoldering Ancient Roots', location: 'Tanjung Puting Buffer Zone', tags: 'Root Cavities • Hidden Embers • Persistent Heat', status: 'ACTIVE', temp: '770°C' },
  { id: 13, file: '13.webp', title: 'Ashen Remains & Smoke', location: 'Pulang Pisau Peatland', tags: 'Monochrome Wasteland • Ecological Trauma', status: 'AFTERMATH', temp: '380°C' },
];

interface BurnGalleryProps {
  activeChapter: number;
  scrollProgress: number; // Global scroll progress 0.0 to 1.0
}

export default function BurnGallery({
  activeChapter,
  scrollProgress,
}: BurnGalleryProps) {
  const [items, setItems] = useState<BurnGalleryItem[]>(DEFAULT_BURN_ITEMS);
  const [selectedItem, setSelectedItem] = useState<BurnGalleryItem | null>(null);

  // Manual override index (when user clicks arrows or drags)
  const [manualOffset, setManualOffset] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const currentDragOffsetRef = useRef(0);

  // 1. Fetch dynamic file list from R2 bucket "burn" via /api/burn
  useEffect(() => {
    let isMounted = true;
    async function fetchBurnList() {
      try {
        const res = await fetch('/api/burn');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.images) && data.images.length > 0) {
          if (!isMounted) return;
          const mapped: BurnGalleryItem[] = data.images.map((key: string, idx: number) => {
            const match = DEFAULT_BURN_ITEMS.find((d) => d.file === key);
            return (
              match || {
                id: idx + 1,
                file: key,
                title: `Burn Site Record #${idx + 1}`,
                location: 'Indonesian Peatland Frontier',
                tags: 'Thermal Anomaly • High Heat',
                status: 'ACTIVE',
                temp: `${720 + ((idx * 33) % 220)}°C`,
              }
            );
          });
          setItems(mapped);
        }
      } catch {
        // Fallback to DEFAULT_BURN_ITEMS
      }
    }
    fetchBurnList();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Scene 3 Scroll Progress Calculation (range: 0.286 to 0.429)
  const s3Prog = Math.max(0, Math.min(1, (scrollProgress - 0.286) / 0.143));

  // Gallery appearance timing inside Scene 3:
  // - 0.00 to 0.26: "FOREST AND LAND FIRES" is front and center, then dissolves completely by 0.26.
  // - 0.26 to 0.29: Clean atmospheric fire pause (zero text on screen).
  // - 0.29 to 0.38: "FOREST AND LAND FIRES" is 100% GONE.
  //                 Now "BURNING THE FUTURE" animates in from top,
  //                 AND the photo cards glide in together from the far right corner (+75vw -> 0vw).
  // - 0.38 to 0.86: Calm, unhurried 3D Coverflow browsing traversing all 13 photos (index 0 to 12).
  // - 0.86 to 0.94: Extra 1 to 2 scrolls allowing the last photo (card #13) to continue gliding to the LEFT side.
  // - 0.88 to 0.96: Title "BURNING THE FUTURE" softly fades out.
  // - 0.94 to 1.00: Smooth dissolve into Scene 4 after the last photo has traveled to the left.
  const enterProg = Math.max(0, Math.min(1, (s3Prog - 0.29) / 0.09));
  const enterEase = 1 - Math.pow(1 - enterProg, 2.5);

  // Cards start from the far right corner (+75vw) and glide in to center
  const cardsEnterShiftVw = (1 - enterEase) * 75;

  // Scroll-driven active index:
  // Starts strictly after cards and title have arrived in center (0.38 onwards).
  // Runway spans to 0.94 and includes +2.0 steps past the last item (index 12 -> 14)
  // so the user gets 1 to 2 extra scrolls to glide the last image to the left before exiting!
  const scrollRatio = Math.max(0, Math.min(1, (s3Prog - 0.38) / 0.56));
  const totalScrollSteps = Math.max(0, items.length - 1) + 2.0;
  const scrollIndex = scrollRatio * totalScrollSteps;

  // Combine scroll-driven index with manual arrow/drag navigation
  const targetIndex = manualOffset !== null ? manualOffset : scrollIndex;

  // Deeply cushioned smooth momentum lerp for ultra-calm card transitions
  const [smoothIndex, setSmoothIndex] = useState(0);
  const targetIndexRef = useRef(targetIndex);
  targetIndexRef.current = targetIndex;

  useEffect(() => {
    let animId: number;
    const lerpLoop = () => {
      setSmoothIndex((prev) => {
        const diff = targetIndexRef.current - prev;
        if (Math.abs(diff) < 0.0005) return targetIndexRef.current;
        return prev + diff * 0.05; // calm, silky, responsive momentum
      });
      animId = requestAnimationFrame(lerpLoop);
    };
    animId = requestAnimationFrame(lerpLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Title entrance animation (drops down, scales up, deblurs)
  const titleEnterEase = 1 - Math.pow(1 - enterProg, 2.5);
  const titleEnterTranslateY = (1 - titleEnterEase) * -40;
  const titleEnterScale = 0.90 + titleEnterEase * 0.10;
  const titleEnterBlur = (1 - titleEnterEase) * 14;

  // Title dedicated fade-out as we approach Scene 4 (from 0.88 to 0.96)
  const rawTitleExit = s3Prog > 0.88 ? Math.max(0, Math.min(1, (s3Prog - 0.88) / 0.08)) : 0;
  const titleExitProg = rawTitleExit * rawTitleExit;
  const titleOpacity = Math.min(1, enterProg * 1.6) * (1 - titleExitProg);
  const titleTranslateY = titleEnterTranslateY - titleExitProg * 40;
  const titleBlur = titleEnterBlur + titleExitProg * 12;
  const titleScale = titleEnterScale - titleExitProg * 0.08;

  // Cards sweeping off to the left transition (from 0.94 to 1.00)
  // Only activates after the last card has moved past center to the left!
  const rawCardExit = s3Prog > 0.94 ? Math.max(0, Math.min(1, (s3Prog - 0.94) / 0.06)) : 0;
  const cardExitProg = rawCardExit * rawCardExit * (3 - 2 * rawCardExit);
  const cardsExitShiftVw = -cardExitProg * 35; // gentle natural leftward drift

  // Total horizontal shift: entrance from right corner (+75vw -> 0) + exit drift (0 -> -35vw)
  const cardsTotalShiftVw = cardsEnterShiftVw + cardsExitShiftVw;
  const cardsOpacity = Math.min(1, enterProg * 1.5) * Math.max(0, 1 - cardExitProg * 1.25);

  // Overall component opacity
  const overallOpacity = activeChapter === 2 ? Math.min(1, enterProg * 1.5) * (1 - cardExitProg) : 0;

  // Reset manual offset if user scrolls significantly (syncing back to scroll flow)
  const lastScrollProgRef = useRef(scrollProgress);
  useEffect(() => {
    if (Math.abs(scrollProgress - lastScrollProgRef.current) > 0.015) {
      setManualOffset(null);
      lastScrollProgRef.current = scrollProgress;
    }
  }, [scrollProgress]);

  // Arrow button handlers
  const handlePrev = useCallback(() => {
    setManualOffset((prev) => {
      const cur = prev !== null ? prev : Math.round(scrollIndex);
      return Math.max(0, cur - 1);
    });
  }, [scrollIndex]);

  const handleNext = useCallback(() => {
    setManualOffset((prev) => {
      const cur = prev !== null ? prev : Math.round(scrollIndex);
      return Math.min(items.length - 1, cur + 1);
    });
  }, [items.length, scrollIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (activeChapter !== 2) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedItem) {
        if (e.key === 'Escape') setSelectedItem(null);
        return;
      }
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeChapter, selectedItem, handlePrev, handleNext]);

  // Drag / swipe handlers for fluid horizontal interaction
  const handlePointerDown = (clientX: number) => {
    isDraggingRef.current = true;
    dragStartXRef.current = clientX;
    currentDragOffsetRef.current = 0;
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDraggingRef.current) return;
    const delta = clientX - dragStartXRef.current;
    currentDragOffsetRef.current = delta;
    setDragOffset(-delta);
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const delta = currentDragOffsetRef.current;
    const cardStep = 180;
    if (Math.abs(delta) > 50) {
      const stepChange = -Math.round(delta / cardStep);
      setManualOffset((prev) => {
        const base = prev !== null ? prev : scrollIndex;
        return Math.max(0, Math.min(items.length - 1, Math.round(base + stepChange)));
      });
    }
    setDragOffset(0);
    currentDragOffsetRef.current = 0;
  };

  if (overallOpacity <= 0.001) return null;

  return (
    <div
      className="absolute inset-0 z-30 pointer-events-auto w-full h-full flex flex-col justify-between p-4 sm:p-8 md:p-12 overflow-hidden select-none transition-opacity duration-300"
      style={{
        opacity: overallOpacity,
      }}
      onMouseDown={(e) => handlePointerDown(e.clientX)}
      onMouseMove={(e) => handlePointerMove(e.clientX)}
      onMouseUp={handlePointerUp}
      onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
      onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
      onTouchEnd={handlePointerUp}
    >
      {/* Subtle Dot Matrix Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(#ffffff14_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none"
      />

      {/* ===================== TOP HEADER ===================== */}
      <div
        className="relative z-20 w-full max-w-5xl mx-auto pt-16 sm:pt-24 md:pt-28 lg:pt-32 text-center flex flex-col items-center justify-center will-change-transform"
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleTranslateY}px) scale(${titleScale})`,
          filter: titleBlur > 0.1 ? `blur(${titleBlur}px)` : 'none',
          transition: 'opacity 0.15s ease-out, filter 0.15s ease-out',
        }}
      >
        {/* Editorial Title - Same typography & heat-shimmer as FOREST AND LAND FIRES */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white animate-heat-shimmer drop-shadow-[0_0_35px_rgba(255,87,34,0.8)] leading-[1.05] text-center px-4">
          BURNING THE FUTURE
        </h2>
      </div>

      {/* ===================== CENTER 3D COVERFLOW STAGE ===================== */}
      <div
        className="relative z-10 w-full flex-1 flex items-center justify-center my-auto overflow-visible [perspective:1200px] will-change-transform"
        style={{
          transform: `translateX(${cardsTotalShiftVw}vw)`,
          opacity: cardsOpacity,
          transition: 'transform 0.1s ease-out, opacity 0.15s ease-out',
        }}
      >
        <div className="relative w-full max-w-5xl h-[340px] sm:h-[420px] md:h-[480px] flex items-center justify-center pointer-events-none">
          {items.map((item, index) => {
            // Distance from currently focused card using smooth momentum index
            const effectiveActive = smoothIndex + dragOffset / 320;
            const offset = index - effectiveActive;
            const absOffset = Math.abs(offset);

            // Hide cards that are far outside the viewport to maximize performance
            if (absOffset > 4.2) return null;

            // 3D Cover Flow layout calculations
            const spacingX = typeof window !== 'undefined' && window.innerWidth < 640 ? 210 : 310;
            const translateX = offset * spacingX;
            const rotateY = Math.max(-42, Math.min(42, -offset * 26));
            const translateZ = -absOffset * 95;
            const scale = Math.max(0.68, 1 - absOffset * 0.12);
            const opacity = Math.max(0.12, 1 - absOffset * 0.28);
            const zIndex = Math.round(50 - absOffset * 8);

            const isCenter = absOffset < 0.55;

            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCenter) {
                    setSelectedItem(item);
                  } else {
                    setManualOffset(index);
                  }
                }}
                style={{
                  transform: `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[380px] md:w-[460px] lg:w-[500px] aspect-[16/11] rounded-3xl p-2 sm:p-2.5 bg-neutral-950/80 backdrop-blur-xl border transition-[border-color,box-shadow] duration-300 pointer-events-auto cursor-pointer group will-change-transform ${
                  isCenter
                    ? 'border-orange-500/60 shadow-[0_20px_60px_rgba(255,87,34,0.35)] ring-1 ring-orange-400/30'
                    : 'border-white/15 hover:border-white/35 shadow-[0_15px_40px_rgba(0,0,0,0.6)]'
                }`}
              >
                {/* Image Container with Rounded Corners - Pure Clean Photos */}
                <div className="relative w-full h-full overflow-hidden rounded-2xl bg-neutral-900">
                  <img
                    src={`/burn/${item.file}`}
                    alt={item.title}
                    loading={absOffset <= 2 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('/api/burn/')) {
                        target.src = `/api/burn/${item.file}`;
                      }
                    }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================== FULLSCREEN LIGHTBOX MODAL ===================== */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 md:p-12 bg-black/50 backdrop-blur-md pointer-events-auto transition-opacity duration-300 cursor-pointer animate-fadeIn"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl h-[56vh] sm:h-[64vh] overflow-hidden rounded-3xl bg-black/50 backdrop-blur-md border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.6)] flex items-center justify-center p-2.5 sm:p-3"
            onClick={() => setSelectedItem(null)}
          >
            <img
              src={`/burn/${selectedItem.file}`}
              alt={selectedItem.title}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('/api/burn/')) {
                  target.src = `/api/burn/${selectedItem.file}`;
                }
              }}
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

