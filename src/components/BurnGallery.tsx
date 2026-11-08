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
  // - 0.00 to 0.35: "FOREST AND LAND FIRES" is front and center.
  // - 0.35 to 0.42: Burn Gallery fades & slides in from right to center.
  // - 0.40 to 0.80: Full interactive Coverflow browsing moving cards from right to left.
  // - 0.78 to 0.93: Title "EVERY EMBER BEARS ITS OWN SCAR" smoothly fades out.
  // - 0.80 to 0.95: On reaching the last photo, cards smoothly sweep away off to the left before Scene 4.
  const enterProg = Math.max(0, Math.min(1, (s3Prog - 0.35) / 0.07));

  // Scroll-driven active index (advances from 0 to items.length - 1 as user scrolls from 0.40 to 0.80)
  const scrollRatio = Math.max(0, Math.min(1, (s3Prog - 0.40) / 0.40));
  const scrollIndex = scrollRatio * Math.max(0, items.length - 1);

  // Combine scroll-driven index with manual arrow/drag navigation
  const targetIndex = manualOffset !== null ? manualOffset : scrollIndex;

  // Title dedicated fade-out as we approach Scene 4 (from 0.78 to 0.92)
  const rawTitleExit = s3Prog > 0.78 ? Math.max(0, Math.min(1, (s3Prog - 0.78) / 0.13)) : 0;
  const titleExitProg = rawTitleExit * rawTitleExit;
  const titleOpacity = enterProg * (1 - titleExitProg);
  const titleTranslateY = (1 - enterProg) * 20 - titleExitProg * 35;
  const titleBlur = titleExitProg * 10;

  // Cards sweeping off to the left transition (from 0.80 to 0.95)
  const rawCardExit = s3Prog > 0.80 ? Math.max(0, Math.min(1, (s3Prog - 0.80) / 0.14)) : 0;
  const cardExitProg = rawCardExit * rawCardExit * (3 - 2 * rawCardExit);
  const cardsShiftLeftVw = -cardExitProg * 85; // slide across all the way off the left edge
  const cardsOpacity = Math.max(0, 1 - cardExitProg * 1.25);

  // Overall component opacity
  const overallOpacity = activeChapter === 2 ? enterProg * (1 - cardExitProg) : 0;

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
        className="relative z-20 w-full max-w-5xl mx-auto pt-12 sm:pt-16 md:pt-20 text-center flex flex-col items-center justify-center will-change-transform"
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleTranslateY}px)`,
          filter: titleBlur > 0 ? `blur(${titleBlur}px)` : 'none',
          transition: 'opacity 0.2s ease-out, filter 0.2s ease-out',
        }}
      >
        {/* Editorial Title - Same typography & heat-shimmer as FOREST AND LAND FIRES */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white animate-heat-shimmer drop-shadow-[0_0_35px_rgba(255,87,34,0.8)] leading-[1.05] text-center px-4">
          EVERY EMBER BEARS ITS OWN SCAR
        </h2>
      </div>

      {/* ===================== CENTER 3D COVERFLOW STAGE ===================== */}
      <div
        className="relative z-10 w-full flex-1 flex items-center justify-center my-auto overflow-visible [perspective:1200px] will-change-transform"
        style={{
          transform: `translateX(${cardsShiftLeftVw}vw)`,
          opacity: cardsOpacity,
          transition: 'transform 0.1s ease-out, opacity 0.15s ease-out',
        }}
      >
        <div className="relative w-full max-w-5xl h-[340px] sm:h-[420px] md:h-[480px] flex items-center justify-center pointer-events-none">
          {items.map((item, index) => {
            // Distance from currently focused card
            const effectiveActive = targetIndex + dragOffset / 320;
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl pointer-events-auto transition-opacity duration-300"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-neutral-950/95 border border-orange-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_25px_80px_rgba(255,87,34,0.3)] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/25 text-white text-xs font-mono tracking-widest uppercase transition-colors cursor-pointer border border-white/20"
            >
              ✕ Close
            </button>

            {/* High-res Image Preview */}
            <div className="relative w-full max-h-[75vh] aspect-[16/10] overflow-hidden rounded-2xl bg-black border border-white/10 mt-6 sm:mt-8">
              <img
                src={`/burn/${selectedItem.file}`}
                alt={selectedItem.title}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/api/burn/')) {
                    target.src = `/api/burn/${selectedItem.file}`;
                  }
                }}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

