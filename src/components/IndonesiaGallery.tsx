'use client';

import { useState, useEffect } from 'react';

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

  // Scene 2 Overall Opacity (smooth enter and exit)
  const s2EnterOpacity = Math.min(1, s2Prog / 0.10);
  const s2ExitOpacity = s2Prog > 0.92 ? Math.max(0, 1 - (s2Prog - 0.92) / 0.08) : 1;
  const s2OverallOpacity = activeChapter === 1 ? s2EnterOpacity * s2ExitOpacity : 0;

  if (s2OverallOpacity <= 0.001) return null;

  const totalPhotos = items.length;
  // Window of visibility for each photo as it traverses from bottom-right to top-right
  const photoWindow = 0.24;

  return (
    <div
      className="absolute inset-0 pointer-events-none w-full h-full overflow-hidden select-none z-20"
      style={{
        opacity: s2OverallOpacity,
        transition: 'opacity 0.15s ease-out',
      }}
    >
      {/* ===================== LEFT SIDE CONTENT ===================== */}
      {/* 
        Revisi 3 & 4:
        - Dari awal sudah di kiri (tidak ada animasi dari tengah)
        - Margin kiri aman (left-8 sm:left-14 md:left-20 lg:left-24) sehingga tidak terpotong
        - Revisi 2: Bayangan dikurangi hingga 10% (ringan dan halus, tanpa blob hitam)
        - Revisi 1: Menghilangkan badge dan teks bertanda coretan oren
      */}
      <div className="absolute left-8 sm:left-14 md:left-20 lg:left-24 top-1/2 -translate-y-1/2 z-20 pointer-events-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl text-left">
        {/* Main Headline with ultra-light 10% shadow */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.92] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
          <span className="block">WONDERFUL OF</span>
          <span className="block text-emerald-100">INDONESIA</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg font-light text-neutral-200 tracking-wider leading-relaxed drop-shadow-[0_1px_5px_rgba(0,0,0,0.25)] max-w-md">
          Billions of respirations sustaining the biosphere.
        </p>

        {/* Narrative Paragraph */}
        <p className="mt-4 sm:mt-5 text-xs sm:text-sm text-neutral-300/90 font-normal leading-relaxed max-w-md drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)]">
          Across 17,000 equatorial islands lies the world&apos;s most biodiverse tropical sanctuary — ancient rainforests harboring rare endemic wildlife, primordial rivers, and the living green lungs of Earth.
        </p>
      </div>

      {/* ===================== RIGHT SIDE: ONE-BY-ONE PHOTO STREAM ===================== */}
      {/* 
        Revisi 5:
        - Muncul satu-satu dari pojok kanan bawah
        - Awalnya kecil (scale: 0.35)
        - Membesar saat menuju ke atas (scale: 1.05) di area tengah
        - Menyusut lagi (scale: 0.35) saat sampai di pojok kanan atas
        - Revisi 1: Bersih dari teks coretan warna oren pada semua foto
      */}
      <div className="absolute right-6 sm:right-12 md:right-16 lg:right-24 top-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] md:w-[480px] lg:w-[540px] h-[360px] sm:h-[420px] md:h-[480px] pointer-events-none">
        {items.map((item, index) => {
          // Center scroll progress for this specific photo
          const centerProg = 0.08 + (index / Math.max(1, totalPhotos - 1)) * 0.84;
          // Progress of this photo through its window (0.0 to 1.0)
          const p = (s2Prog - (centerProg - photoWindow / 2)) / photoWindow;

          // Only render when inside or very close to its active window
          if (p < -0.05 || p > 1.05) return null;

          const clampedP = Math.max(0, Math.min(1, p));

          // Vertical motion: from bottom (+36vh) to top (-36vh)
          const translateY = (0.5 - clampedP) * 72; // in vh

          // Horizontal motion: starts in bottom-right corner (+12vw), swings inwards (0vw), drifts to top-right corner (+12vw)
          const translateX = Math.pow(clampedP - 0.5, 2) * 4 * 12; // in vw

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
          const isInteractive = clampedP >= 0.2 && clampedP <= 0.8;

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
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-[4/3] rounded-3xl p-2.5 sm:p-3 bg-black/40 backdrop-blur-md border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.55)] cursor-pointer transition-shadow duration-300 hover:border-emerald-400/80 hover:shadow-[0_25px_60px_rgba(16,185,129,0.35)] group will-change-transform"
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
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ===================== FULLSCREEN LIGHTBOX MODAL ===================== */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl pointer-events-auto transition-opacity duration-300 animate-fadeIn"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-neutral-950/90 border border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 px-3 py-1 rounded-full bg-white/10 hover:bg-white/25 text-white text-xs font-mono tracking-widest uppercase transition-colors"
            >
              ✕ Close
            </button>

            {/* Image Preview */}
            <div className="relative w-full max-h-[70vh] aspect-[16/10] sm:aspect-[4/3] overflow-hidden rounded-2xl bg-black">
              <img
                src={`/gallery/${selectedItem.file}`}
                alt={selectedItem.title}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/api/gallery/')) {
                    target.src = `/api/gallery/${selectedItem.file}`;
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
