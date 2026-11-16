'use client';

import { useState, useEffect } from 'react';
import CursorTiltCard from './CursorTiltCard';
import CursorParallaxText from './CursorParallaxText';

interface GalleryItem {
  id: number;
  file: string;
  title: string;
  location: string;
}

const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  { id: 1, file: '1.webp', title: 'Tropical Canopy', location: 'Borneo Rainforest' },
  { id: 2, file: '2.webp', title: 'Ancient Biosphere', location: 'Sumatra Wilderness' },
  { id: 3, file: '3.webp', title: 'Endemic Flora', location: 'Papua Highlands' },
  { id: 4, file: '4.webp', title: 'Emerald Archipelago', location: 'Raja Ampat Islands' },
  { id: 5, file: '5.webp', title: 'Primordial Mist', location: 'Mount Leuser Sanctuary' },
  { id: 6, file: '6.webp', title: 'Living Sanctuary', location: 'Tanjung Puting National Park' },
  { id: 7, file: '7.webp', title: 'Rainforest River', location: 'Mahakam Basin, Kalimantan' },
  { id: 8, file: '8.webp', title: 'Biodiversity Haven', location: 'Lore Lindu, Sulawesi' },
  { id: 9, file: '9.webp', title: 'Verdant Cascades', location: 'Way Kambas, Sumatra' },
  { id: 10, file: '10.webp', title: 'Heritage Woodlands', location: 'Kerinci Seblat, Sumatra' },
];

interface IndonesiaGalleryProps {
  activeChapter: number;
  scrollProgress: number;
}

export default function IndonesiaGallery({
  activeChapter,
  scrollProgress,
}: IndonesiaGalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>(DEFAULT_GALLERY_ITEMS);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Dynamically query R2 images on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchR2List() {
      try {
        const res = await fetch('/api/gallery');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.images) && data.images.length > 0) {
          if (!isMounted) return;
          const mapped: GalleryItem[] = data.images.map((key: string, idx: number) => {
            const defaultMatch = DEFAULT_GALLERY_ITEMS.find((d) => d.file === key);
            return (
              defaultMatch || {
                id: idx + 1,
                file: key,
                title: `Forest Observation ${idx + 1}`,
                location: 'Indonesian Wilderness',
              }
            );
          });
          setItems(mapped);
        }
      } catch {
        // Fallback to default items
      }
    }
    fetchR2List();
    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedItem(null);
    };
    if (selectedItem) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedItem]);

  // Scene 2 dedicated local scroll progress (0.143 to 0.286)
  const s2Prog = Math.max(0, Math.min(1, (scrollProgress - 0.143) / 0.143));

  // Scene 2 Overall Opacity
  const s2EnterOpacity = Math.min(1, s2Prog / 0.10);
  const s2ExitOpacity = s2Prog > 0.94 ? Math.max(0, 1 - (s2Prog - 0.94) / 0.06) : 1;
  const s2OverallOpacity = activeChapter === 1 ? s2EnterOpacity * s2ExitOpacity : 0;

  // Fire transition progress (starts after all photos finish at s2Prog = 0.72)
  const burnProg = Math.max(0, Math.min(1, (s2Prog - 0.72) / 0.28));

  // Text flame consumption
  const textOpacity = burnProg > 0.35 ? Math.max(0, 1 - (burnProg - 0.35) / 0.55) : 1;
  const textBlur = burnProg > 0.35 ? (burnProg - 0.35) * 12 : 0;

  if (s2OverallOpacity <= 0.001) return null;

  const totalPhotos = items.length;
  // Compact photo window so all 10 photos finish completely before s2Prog = 0.68
  const photoWindow = 0.16;
  const isCompactViewport = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div
      className="absolute inset-0 pointer-events-none w-full h-full overflow-hidden select-none z-20"
      style={{
        opacity: s2OverallOpacity,
        transition: 'opacity 0.15s ease-out',
      }}
    >
      {/* ===================== LEFT / TOP CONTENT (Stacks above photo stream on mobile) ===================== */}
      <div
        className="absolute left-5 right-5 top-[78px] sm:top-[92px] md:right-auto md:left-16 lg:left-24 md:top-[52%] md:-translate-y-1/2 z-20 pointer-events-auto max-w-xl md:max-w-md lg:max-w-xl text-center md:text-left mx-auto md:mx-0 will-change-transform"
        style={{
          opacity: textOpacity,
          filter: textBlur > 0 ? `blur(${textBlur}px)` : 'none',
          transition: 'filter 0.15s ease-out, opacity 0.15s ease-out',
        }}
      >
        {/* Main Headline */}
        <CursorParallaxText shiftX={24} shiftY={16} tilt={6} disabled={activeChapter !== 1}>
          <h1
            className="text-[1.75rem] min-[390px]:text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] text-white transition-colors duration-300"
            style={{
              textShadow:
                burnProg > 0.05
                  ? `0 0 ${burnProg * 35}px rgba(255, 80, 0, ${burnProg * 0.95}), 0 0 ${
                      burnProg * 65
                    }px rgba(255, 30, 0, ${burnProg * 0.85})`
                  : '0 2px 10px rgba(0,0,0,0.25)',
              color:
                burnProg > 0.3
                  ? `rgb(255, ${Math.max(120, 255 - burnProg * 140)}, ${Math.max(
                      40,
                      255 - burnProg * 220
                    )})`
                  : '#ffffff',
            }}
          >
            <span className="block sm:whitespace-nowrap">WONDERFUL OF</span>
            <span className="block sm:whitespace-nowrap">INDONESIA</span>
          </h1>
        </CursorParallaxText>

        {/* Subtitle */}
        <CursorParallaxText shiftX={16} shiftY={10} tilt={4} disabled={activeChapter !== 1}>
          <p
            className="mt-2.5 sm:mt-4 md:mt-5 text-xs sm:text-sm md:text-lg font-light text-neutral-200 tracking-wider leading-relaxed max-w-md mx-auto md:mx-0 transition-colors duration-300"
            style={{
              textShadow:
                burnProg > 0.05
                  ? `0 0 ${burnProg * 25}px rgba(255, 100, 0, ${burnProg * 0.8})`
                  : '0 1px 5px rgba(0,0,0,0.25)',
            }}
          >
            Billions of respirations sustaining the biosphere.
          </p>
        </CursorParallaxText>

        {/* Narrative Paragraph */}
        <CursorParallaxText shiftX={11} shiftY={7} tilt={2.5} disabled={activeChapter !== 1}>
          <p className="mt-2 sm:mt-3 md:mt-4 text-[11px] sm:text-xs md:text-sm text-neutral-300/90 font-normal leading-relaxed max-w-md mx-auto md:mx-0 drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)]">
            Indonesia&apos;s forest area covers 124,975,956 hectares, home to around 31,750 flora species and approximately 744,279 terrestrial and aquatic fauna species.
          </p>
        </CursorParallaxText>
      </div>

      {/* ===================== RIGHT / CENTER-BOTTOM PHOTO STREAM ===================== */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[59%] -translate-y-1/2 sm:top-[58%] md:left-auto md:translate-x-0 md:right-12 lg:right-24 md:top-1/2 md:-translate-y-1/2 z-30 w-[min(86vw,340px)] sm:w-[400px] md:w-[440px] lg:w-[540px] h-[255px] sm:h-[300px] md:h-[440px] lg:h-[480px] pointer-events-none">
        {items.map((item, index) => {
          // Center scroll progress for this photo (spaced compactly from 0.08 to 0.58)
          const centerProg = 0.08 + (index / Math.max(1, totalPhotos - 1)) * 0.50;
          // Progress of this photo through its window (0.0 to 1.0)
          const p = (s2Prog - (centerProg - photoWindow / 2)) / photoWindow;

          // Only render when inside or very close to its active window
          if (p < -0.05 || p > 1.05) return null;

          const clampedP = Math.max(0, Math.min(1, p));

          // Keep mobile cards horizontally centered & gently animated vertically
          const translateY = (0.5 - clampedP) * (isCompactViewport ? 20 : 72); // in vh
          const translateX = isCompactViewport ? 0 : Math.pow(clampedP - 0.5, 2) * 4 * 12; // in vw

          // Scale: small at start (0.35) -> large in center (1.05) -> small at end (0.35)
          const scale = 0.35 + 4 * clampedP * (1 - clampedP) * 0.70;

          // Opacity: smooth fade-in from bottom-right, smooth fade-out into top-right
          const fadeIn = Math.min(1, clampedP / 0.15);
          const fadeOut = Math.max(0, (1 - clampedP) / 0.15);
          const opacity = Math.min(fadeIn, fadeOut);

          // Subtle natural 3D tilt
          const rotate = (0.5 - clampedP) * 10;

          // Highest z-index for the photo currently centered and largest
          const zIndex = Math.round((1 - Math.abs(clampedP - 0.5) * 2) * 30);
          const isInteractive = clampedP >= 0.05 && clampedP <= 0.95;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              style={{
                transform: `translate3d(${translateX}vw, ${translateY}vh, 0) scale(${scale}) rotate(${rotate}deg)`,
                opacity,
                zIndex,
                pointerEvents: isInteractive ? 'auto' : 'none',
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-[4/3] group will-change-transform"
            >
              {/* Inner Card Frame with smooth cursor-following 3D tilt and glass spotlight */}
              <CursorTiltCard
                maxTilt={14}
                maxShift={12}
                hoverScale={1.045}
                perspective={900}
                disabled={!isInteractive}
                spotlightColor="rgba(255, 255, 255, 0.24)"
                className="relative w-full h-full rounded-3xl p-2.5 sm:p-3 bg-black/40 backdrop-blur-md border border-white/20 hover:border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.55)] hover:shadow-[0_28px_65px_rgba(0,0,0,0.75)] cursor-pointer transition-[border-color,box-shadow] duration-300"
              >
                <div className="relative w-full h-full overflow-hidden rounded-2xl bg-neutral-950">
                  <img
                    src={`/gallery/${item.file}`}
                    alt={item.title}
                    loading="eager"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('/api/gallery/')) {
                        target.src = `/api/gallery/${item.file}`;
                      }
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              </CursorTiltCard>
            </div>
          );
        })}
      </div>

      {/* ===================== FULLSCREEN LIGHTBOX MODAL ===================== */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 md:p-12 bg-black/50 backdrop-blur-md pointer-events-auto transition-opacity duration-300 cursor-pointer animate-fadeIn"
          onClick={() => setSelectedItem(null)}
        >
          <CursorTiltCard
            maxTilt={6}
            maxShift={6}
            hoverScale={1.015}
            spotlightColor="rgba(255, 255, 255, 0.16)"
            className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl h-[56vh] sm:h-[64vh] overflow-hidden rounded-3xl bg-black/50 backdrop-blur-md border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.6)] flex items-center justify-center p-2.5 sm:p-3"
            onClick={() => setSelectedItem(null)}
          >
            <img
              src={`/gallery/${selectedItem.file}`}
              alt={selectedItem.title}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('/api/gallery/')) {
                  target.src = `/api/gallery/${selectedItem.file}`;
                }
              }}
              className="w-full h-full object-contain rounded-2xl"
            />
          </CursorTiltCard>
        </div>
      )}
    </div>
  );
}
