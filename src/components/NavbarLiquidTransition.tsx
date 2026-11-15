'use client';

import { useEffect, useRef } from 'react';

export interface LiquidTransitionRequest {
  id: number;
  sourceChapter?: number;
  targetChapter: number;
  originX: number;
  originY: number;
}

interface NavbarLiquidTransitionProps {
  request: LiquidTransitionRequest | null;
  onSwapPage: (targetChapter: number) => void;
  onComplete: () => void;
}

interface BlobParticle {
  angleOffset: number;
  distMul: number;
  baseRadius: number;
  phase: number;
  freq: number;
  lingerFactor: number;
}

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

interface SceneLiquidPalette {
  core: RgbColor;
  mid: RgbColor;
  edge: RgbColor;
  rim: RgbColor;
}

const TOTAL_DURATION_MS = 1320; // ~1.32 seconds (1–1.5s cinematic pacing)

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const clampByte = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeInCubic = (t: number) => t * t * t;

const mixRgb = (a: RgbColor, b: RgbColor, t: number): RgbColor => {
  const k = clamp01(t);
  return {
    r: a.r + (b.r - a.r) * k,
    g: a.g + (b.g - a.g) * k,
    b: a.b + (b.b - a.b) * k,
  };
};

const rgbaCss = (c: RgbColor, alpha: number) =>
  `rgba(${clampByte(c.r)}, ${clampByte(c.g)}, ${clampByte(c.b)}, ${clamp01(alpha).toFixed(3)})`;

// Calibrated fallback palettes harmonizing with each scene's real atmosphere
const CHAPTER_PALETTES: SceneLiquidPalette[] = [
  // 0: The Gateway (dark misty pine forest)
  {
    core: { r: 22, g: 36, b: 30 },
    mid: { r: 14, g: 24, b: 20 },
    edge: { r: 8, g: 14, b: 12 },
    rim: { r: 196, g: 222, b: 210 },
  },
  // 1: The Canopy (emerald & tropical archipelago)
  {
    core: { r: 20, g: 42, b: 34 },
    mid: { r: 13, g: 29, b: 23 },
    edge: { r: 7, g: 17, b: 14 },
    rim: { r: 186, g: 226, b: 208 },
  },
  // 2: The Inferno (wildfire embers & warm smoke)
  {
    core: { r: 52, g: 24, b: 14 },
    mid: { r: 34, g: 16, b: 10 },
    edge: { r: 19, g: 9, b: 6 },
    rim: { r: 245, g: 196, b: 164 },
  },
  // 3: Statistic (charred ember horizon)
  {
    core: { r: 40, g: 22, b: 16 },
    mid: { r: 26, g: 15, b: 12 },
    edge: { r: 15, g: 9, b: 8 },
    rim: { r: 230, g: 204, b: 188 },
  },
  // 4: The Ashes (monochrome ash & mist)
  {
    core: { r: 34, g: 36, b: 39 },
    mid: { r: 22, g: 23, b: 26 },
    edge: { r: 12, g: 13, b: 15 },
    rim: { r: 216, g: 220, b: 224 },
  },
  // 5: The Human Toll (heavy smoke & cool shadow)
  {
    core: { r: 28, g: 34, b: 39 },
    mid: { r: 19, g: 23, b: 27 },
    edge: { r: 10, g: 13, b: 16 },
    rim: { r: 204, g: 216, b: 224 },
  },
  // 6: The Rebirth (deep soil, sprout & forest teal)
  {
    core: { r: 20, g: 38, b: 31 },
    mid: { r: 13, g: 26, b: 21 },
    edge: { r: 8, g: 15, b: 13 },
    rim: { r: 190, g: 224, b: 206 },
  },
  // 7: The Contact (forest twilight portal & obsidian mist)
  {
    core: { r: 22, g: 31, b: 34 },
    mid: { r: 14, g: 20, b: 23 },
    edge: { r: 8, g: 11, b: 14 },
    rim: { r: 202, g: 218, b: 226 },
  },
];

/**
 * Samples the live background <video> pixels for a given chapter using a tiny
 * offscreen canvas so the liquid adopts the exact ambient hue of the active frame.
 */
function sampleChapterLiquidPalette(chapterIndex: number): SceneLiquidPalette {
  const safeIdx = Math.max(0, Math.min(CHAPTER_PALETTES.length - 1, chapterIndex));
  const fallback = CHAPTER_PALETTES[safeIdx];

  if (typeof document === 'undefined') return fallback;

  try {
    const videos = Array.from(document.querySelectorAll('video'));
    let targetVideo: HTMLVideoElement | undefined = videos[safeIdx];

    // Prefer whichever video is currently visibly rendered if chapter video isn't ready
    if (!targetVideo || targetVideo.readyState < 2) {
      targetVideo = videos.find((v) => {
        if (v.readyState < 2) return false;
        const opacity = parseFloat(window.getComputedStyle(v).opacity || '0');
        return opacity > 0.25;
      });
    }

    if (!targetVideo || targetVideo.readyState < 2 || targetVideo.videoWidth === 0) {
      return fallback;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 12;
    canvas.height = 8;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return fallback;

    ctx.drawImage(targetVideo, 0, 0, 12, 8);
    const data = ctx.getImageData(0, 0, 12, 8).data;

    let topR = 0,
      topG = 0,
      topB = 0,
      topCount = 0;
    let midR = 0,
      midG = 0,
      midB = 0,
      midCount = 0;

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 12; x++) {
        const idx = (y * 12 + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        if (y <= 3) {
          topR += r;
          topG += g;
          topB += b;
          topCount++;
        } else {
          midR += r;
          midG += g;
          midB += b;
          midCount++;
        }
      }
    }

    const avgTop: RgbColor = {
      r: topR / Math.max(1, topCount),
      g: topG / Math.max(1, topCount),
      b: topB / Math.max(1, topCount),
    };
    const avgBot: RgbColor = {
      r: midR / Math.max(1, midCount),
      g: midG / Math.max(1, midCount),
      b: midB / Math.max(1, midCount),
    };
    const avgAll = mixRgb(avgTop, avgBot, 0.5);

    // Preserve the real scene hue while toning luminance to sleek frosted glass depth
    // so bright areas never wash out typography and dark scenes keep rich chromatic nuance.
    const normalizeShade = (c: RgbColor, targetBrightness: number): RgbColor => {
      const lum = Math.max(12, 0.299 * c.r + 0.587 * c.g + 0.114 * c.b);
      const ratio = clamp01(targetBrightness / lum) * 1.18 + (lum > 140 ? 0.14 : 0.28);
      const scaled = {
        r: c.r * Math.min(0.82, ratio),
        g: c.g * Math.min(0.82, ratio),
        b: c.b * Math.min(0.82, ratio),
      };
      return mixRgb(fallback.mid, scaled, 0.72);
    };

    return {
      core: normalizeShade(avgTop, 36),
      mid: normalizeShade(avgAll, 24),
      edge: normalizeShade(avgBot, 15),
      rim: mixRgb(avgAll, { r: 242, g: 245, b: 248 }, 0.62),
    };
  } catch {
    return fallback;
  }
}

const BLOB_SEEDS: BlobParticle[] = Array.from({ length: 16 }, (_, i) => ({
  angleOffset: (i / 16) * Math.PI * 2 + (i % 3) * 0.18,
  distMul: 0.72 + ((i * 37) % 100) / 145,
  baseRadius: 16 + ((i * 29) % 34),
  phase: i * 1.17,
  freq: 2.2 + (i % 4) * 0.7,
  lingerFactor: 0.45 + ((i * 43) % 100) / 180,
}));

/**
 * Computes an organic, irregular wavy SVG path centered at (ox, oy)
 * with fluid multi-harmonic surface ripples for realistic liquid contours.
 */
function buildOrganicLiquidPath(
  ox: number,
  oy: number,
  baseRadius: number,
  time: number,
  waveIntensity: number,
  gravitySag = 0,
  segments = 72
): string {
  if (baseRadius <= 0.5) return `M ${ox.toFixed(1)} ${oy.toFixed(1)} L ${ox.toFixed(1)} ${oy.toFixed(1)} Z`;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const wave =
      Math.sin(theta * 3 + time * 3.1) * 0.085 +
      Math.cos(theta * 5 - time * 2.4) * 0.052 +
      Math.sin(theta * 7 + time * 4.2) * 0.028 +
      Math.cos(theta * 2 - time * 1.8) * 0.065;

    // Subtle downward viscous pull so liquid flows naturally from navbar across viewport
    const sag = Math.max(0, Math.sin(theta)) * gravitySag;
    const r = Math.max(0, baseRadius * (1 + wave * waveIntensity + sag));

    points.push({
      x: ox + Math.cos(theta) * r,
      y: oy + Math.sin(theta) * r,
    });
  }

  const len = points.length;
  let d = '';
  for (let i = 0; i < len; i++) {
    const curr = points[i];
    const next = points[(i + 1) % len];
    const midX = (curr.x + next.x) * 0.5;
    const midY = (curr.y + next.y) * 0.5;
    if (i === 0) {
      const prev = points[len - 1];
      const startX = (prev.x + curr.x) * 0.5;
      const startY = (prev.y + curr.y) * 0.5;
      d += `M ${startX.toFixed(1)} ${startY.toFixed(1)} `;
    }
    d += `Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)} `;
  }
  return d + 'Z';
}

export default function NavbarLiquidTransition({
  request,
  onSwapPage,
  onComplete,
}: NavbarLiquidTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const backdropBlurRef = useRef<HTMLDivElement | null>(null);
  const fullCoverRef = useRef<HTMLDivElement | null>(null);
  const mainBlobRef = useRef<SVGPathElement | null>(null);
  const rimHighlightRef = useRef<SVGPathElement | null>(null);
  const glossSheenRef = useRef<SVGPathElement | null>(null);
  const metaballRefs = useRef<(SVGCircleElement | null)[]>([]);
  const trailingDropRefs = useRef<(SVGCircleElement | null)[]>([]);
  const turbRef = useRef<SVGFETurbulenceElement | null>(null);

  // Adaptive gradient stop refs
  const gradStop0Ref = useRef<SVGStopElement | null>(null);
  const gradStop1Ref = useRef<SVGStopElement | null>(null);
  const gradStop2Ref = useRef<SVGStopElement | null>(null);
  const rimStop0Ref = useRef<SVGStopElement | null>(null);
  const rimStop1Ref = useRef<SVGStopElement | null>(null);
  const rimStop2Ref = useRef<SVGStopElement | null>(null);
  const dropStop0Ref = useRef<SVGStopElement | null>(null);
  const dropStop1Ref = useRef<SVGStopElement | null>(null);

  const onSwapRef = useRef(onSwapPage);
  const onCompleteRef = useRef(onComplete);
  onSwapRef.current = onSwapPage;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!request) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ox = request.originX;
    const oy = request.originY;

    const srcChapter = request.sourceChapter ?? request.targetChapter;
    const sourcePalette = sampleChapterLiquidPalette(srcChapter);
    // Use fallback palette first for target, then refresh target palette right after Scene 3 swap
    let targetPalette = CHAPTER_PALETTES[
      Math.max(0, Math.min(CHAPTER_PALETTES.length - 1, request.targetChapter))
    ];

    const maxDist = Math.max(
      Math.hypot(ox, oy),
      Math.hypot(vw - ox, oy),
      Math.hypot(ox, vh - oy),
      Math.hypot(vw - ox, vh - oy)
    );
    const fullRadius = maxDist + 220;

    let swapped = false;
    let startTs: number | null = null;
    let rafId = 0;

    const tick = (now: number) => {
      if (startTs === null) startTs = now;
      const elapsed = now - startTs;
      const t = clamp01(elapsed / TOTAL_DURATION_MS);
      const timeSec = elapsed * 0.001;

      if (turbRef.current) {
        const fx = 0.011 + Math.sin(timeSec * 3.5) * 0.0025;
        const fy = 0.014 + Math.cos(timeSec * 2.8) * 0.0025;
        turbRef.current.setAttribute('baseFrequency', `${fx.toFixed(4)} ${fy.toFixed(4)}`);
      }

      let currentRadius = 0;
      let waveAmp = 1.0;
      let sag = 0.14;
      let solidCoverOpacity = 0;
      let rimOpacity = 0.85;
      let backdropOpacity = 0;
      let veilAlpha = 0.72;

      if (t < 0.18) {
        // SCENE 1 – LIQUID AWAKENING
        const s1 = t / 0.18;
        const spring = 1 - Math.pow(1 - s1, 2.6);
        currentRadius = 10 + spring * Math.min(vw, vh) * 0.16;
        waveAmp = 1.25;
        sag = 0.22 * spring;
        backdropOpacity = 0.65 + spring * 0.35;
        veilAlpha = 0.64 + spring * 0.12;
      } else if (t < 0.46) {
        // SCENE 2 – LIQUID EXPANSION
        const s2 = (t - 0.18) / 0.28;
        const surge = easeInOutCubic(s2);
        const startR = 10 + Math.min(vw, vh) * 0.16;
        currentRadius = startR + (fullRadius - startR) * surge;
        waveAmp = 1.15 - surge * 0.45;
        sag = 0.22 * (1 - surge * 0.65);
        backdropOpacity = 1;
        veilAlpha = 0.76 + surge * 0.18;
        solidCoverOpacity = smoothstep(0.75, 1.0, s2);
      } else if (t < 0.56) {
        // SCENE 3 – PAGE TRANSITION (100% covered & blurred while swapping)
        currentRadius = fullRadius;
        waveAmp = 0.35;
        sag = 0;
        solidCoverOpacity = 1;
        backdropOpacity = 1;
        veilAlpha = 0.96;
        rimOpacity = 0.25;

        if (!swapped && t >= 0.48) {
          swapped = true;
          onSwapRef.current(request.targetChapter);
          // Sample destination scene's live video color right after swap for Scene 4 reveal
          targetPalette = sampleChapterLiquidPalette(request.targetChapter);
        }
      } else {
        // SCENE 4 – LIQUID REVEAL (Translucent liquid recedes organically into destination colors)
        const s4 = (t - 0.56) / 0.44;
        const retract = easeInCubic(smoothstep(0.0, 0.86, s4));
        currentRadius = fullRadius * (1 - retract);
        waveAmp = 0.75 + Math.sin(s4 * Math.PI) * 0.75;
        sag = 0.16 * Math.sin(s4 * Math.PI);
        solidCoverOpacity = 1 - smoothstep(0.0, 0.22, s4);
        backdropOpacity = 1 - smoothstep(0.62, 0.98, s4);
        veilAlpha = 0.90 - smoothstep(0.15, 0.92, s4) * 0.34;
        rimOpacity = (1 - smoothstep(0.72, 0.98, s4)) * 0.9;
      }

      // Smoothly morph palette from source scene background -> target scene background
      const colorMorph = smoothstep(0.32, 0.72, t);
      const currCore = mixRgb(sourcePalette.core, targetPalette.core, colorMorph);
      const currMid = mixRgb(sourcePalette.mid, targetPalette.mid, colorMorph);
      const currEdge = mixRgb(sourcePalette.edge, targetPalette.edge, colorMorph);
      const currRim = mixRgb(sourcePalette.rim, targetPalette.rim, colorMorph);

      // Apply live adaptive translucent gradients
      if (gradStop0Ref.current) {
        gradStop0Ref.current.setAttribute('stop-color', rgbaCss(currCore, veilAlpha * 0.84));
      }
      if (gradStop1Ref.current) {
        gradStop1Ref.current.setAttribute('stop-color', rgbaCss(currMid, veilAlpha * 0.93));
      }
      if (gradStop2Ref.current) {
        gradStop2Ref.current.setAttribute('stop-color', rgbaCss(currEdge, Math.min(0.98, veilAlpha * 1.02)));
      }
      if (rimStop0Ref.current) {
        rimStop0Ref.current.setAttribute('stop-color', rgbaCss(currRim, 0.65));
      }
      if (rimStop1Ref.current) {
        rimStop1Ref.current.setAttribute('stop-color', rgbaCss(currRim, 0.22));
      }
      if (rimStop2Ref.current) {
        rimStop2Ref.current.setAttribute('stop-color', rgbaCss(currRim, 0.50));
      }
      if (dropStop0Ref.current) {
        dropStop0Ref.current.setAttribute('stop-color', rgbaCss(currRim, 0.75));
      }
      if (dropStop1Ref.current) {
        dropStop1Ref.current.setAttribute('stop-color', rgbaCss(currCore, 0.28));
      }

      const metaballFill = rgbaCss(currMid, Math.min(0.92, veilAlpha * 0.95));

      // 1. Update main organic liquid path + specular rim + gloss sheen
      const mainPathD = buildOrganicLiquidPath(
        ox,
        oy,
        currentRadius,
        timeSec,
        waveAmp,
        sag
      );

      if (mainBlobRef.current) {
        mainBlobRef.current.setAttribute('d', mainPathD);
      }
      if (rimHighlightRef.current) {
        rimHighlightRef.current.setAttribute('d', mainPathD);
        rimHighlightRef.current.style.opacity = `${rimOpacity.toFixed(3)}`;
      }
      if (glossSheenRef.current) {
        const innerR = Math.max(0, currentRadius * 0.94);
        const sheenD = buildOrganicLiquidPath(
          ox,
          oy,
          innerR,
          timeSec * 0.9 + 0.5,
          waveAmp * 0.85,
          sag * 0.9
        );
        glossSheenRef.current.setAttribute('d', sheenD);
        glossSheenRef.current.setAttribute('stroke', rgbaCss(currRim, 0.28));
        glossSheenRef.current.style.opacity = `${(rimOpacity * 0.48).toFixed(3)}`;
      }

      // 2. Update satellite metaball droplets with matching adaptive background color
      for (let i = 0; i < BLOB_SEEDS.length; i++) {
        const seed = BLOB_SEEDS[i];
        const el = metaballRefs.current[i];
        if (!el) continue;

        let blobR = 0;
        let bx = ox;
        let by = oy;

        if (t < 0.48) {
          const lead = 1.04 + Math.sin(timeSec * seed.freq + seed.phase) * 0.12;
          const dist = currentRadius * lead * seed.distMul;
          const angle = seed.angleOffset + Math.sin(timeSec * 1.4 + seed.phase) * 0.25;
          bx = ox + Math.cos(angle) * dist;
          by = oy + Math.sin(angle) * dist;
          const life = smoothstep(0.02, 0.16, t) * (1 - smoothstep(0.38, 0.48, t));
          blobR = seed.baseRadius * (0.65 + easeOutQuart(t / 0.48) * 1.35) * life;
        } else if (t >= 0.56) {
          const s4 = (t - 0.56) / 0.44;
          const lagProgress = Math.max(0, s4 - seed.lingerFactor * 0.14);
          const dist = Math.max(
            0,
            currentRadius * (1.06 + (i % 3) * 0.08) + lagProgress * 45
          );
          const angle =
            seed.angleOffset + Math.cos(timeSec * 1.6 + seed.phase) * 0.22;
          bx = ox + Math.cos(angle) * dist;
          by = oy + Math.sin(angle) * dist + lagProgress * 32;
          const vanish = 1 - smoothstep(0.55, 0.96, s4);
          blobR = seed.baseRadius * 0.9 * vanish;
        }

        el.setAttribute('cx', bx.toFixed(1));
        el.setAttribute('cy', by.toFixed(1));
        el.setAttribute('r', Math.max(0, blobR).toFixed(1));
        el.setAttribute('fill', metaballFill);
      }

      // 3. Final tiny crisp glossy droplets adapted to target scene rim tint
      for (let i = 0; i < BLOB_SEEDS.length; i++) {
        const seed = BLOB_SEEDS[i];
        const dropEl = trailingDropRefs.current[i];
        if (!dropEl) continue;

        if (t >= 0.60 && t <= 0.99) {
          const dProg = (t - 0.60) / 0.39;
          const fade = Math.sin(clamp01(dProg) * Math.PI);
          const px =
            vw * (0.12 + ((i * 53) % 76) / 100) +
            Math.sin(timeSec * 2 + seed.phase) * 8;
          const py =
            vh * (0.18 + ((i * 31) % 62) / 100) * (1 - dProg * 0.25) +
            dProg * 28;
          const pr = (4 + (i % 5) * 2.2) * (1 - dProg * 0.85) * fade;
          dropEl.setAttribute('cx', px.toFixed(1));
          dropEl.setAttribute('cy', py.toFixed(1));
          dropEl.setAttribute('r', Math.max(0, pr).toFixed(1));
          dropEl.style.opacity = `${(fade * 0.58).toFixed(3)}`;
        } else {
          dropEl.setAttribute('r', '0');
          dropEl.style.opacity = '0';
        }
      }

      // 4. Synchronize organic frosted glass backdrop refraction + full Scene 3 atmospheric cover
      if (backdropBlurRef.current) {
        backdropBlurRef.current.style.clipPath = `path("${mainPathD}")`;
        backdropBlurRef.current.style.opacity = `${backdropOpacity.toFixed(3)}`;
      }
      if (fullCoverRef.current) {
        fullCoverRef.current.style.opacity = `${solidCoverOpacity.toFixed(3)}`;
        fullCoverRef.current.style.background = `radial-gradient(circle at 50% 25%, ${rgbaCss(
          currCore,
          0.96
        )} 0%, ${rgbaCss(currMid, 0.98)} 52%, ${rgbaCss(currEdge, 0.99)} 100%)`;
      }

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        onCompleteRef.current();
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [request]);

  if (!request) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-[38] pointer-events-none select-none overflow-hidden"
    >
      {/* Frosted glass refraction field clipped cleanly to the exact organic liquid wave */}
      <div
        ref={backdropBlurRef}
        className="absolute inset-0 backdrop-blur-2xl backdrop-saturate-150"
        style={{
          opacity: 0,
          willChange: 'clip-path, opacity',
        }}
      />

      {/* Seamless Scene 3 adaptive tonal cover behind full liquid coverage */}
      <div
        ref={fullCoverRef}
        className="absolute inset-0 backdrop-blur-2xl"
        style={{
          opacity: 0,
          willChange: 'opacity',
        }}
      />

      {/* SVG Liquid Morphing & Metaball Distortion Engine */}
      <svg
        className="absolute inset-0 w-full h-full block overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* SVG Metaball Goo + Turbulence Liquid Distortion Filter */}
          <filter
            id="navbar-liquid-goo"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              result="goo"
            />
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.011 0.014"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="goo"
              in2="noise"
              scale="16"
              xChannelSelector="R"
              yChannelSelector="G"
              result="liquid"
            />
          </filter>

          {/* Scene-Adaptive Translucent Liquid Gradient */}
          <radialGradient id="adaptiveLiquidGrad" cx="50%" cy="20%" r="85%">
            <stop ref={gradStop0Ref} offset="0%" stopColor="rgba(22, 34, 30, 0.72)" />
            <stop ref={gradStop1Ref} offset="48%" stopColor="rgba(14, 24, 20, 0.85)" />
            <stop ref={gradStop2Ref} offset="100%" stopColor="rgba(8, 14, 12, 0.94)" />
          </radialGradient>

          {/* Adaptive Glass Specular Reflection Rim */}
          <linearGradient id="liquidRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop ref={rimStop0Ref} offset="0%" stopColor="rgba(220,235,228,0.65)" />
            <stop ref={rimStop1Ref} offset="50%" stopColor="rgba(220,235,228,0.22)" />
            <stop ref={rimStop2Ref} offset="100%" stopColor="rgba(220,235,228,0.50)" />
          </linearGradient>

          <radialGradient id="glossDropletGrad" cx="35%" cy="30%" r="65%">
            <stop ref={dropStop0Ref} offset="0%" stopColor="rgba(230,240,236,0.75)" />
            <stop ref={dropStop1Ref} offset="50%" stopColor="rgba(22,34,30,0.28)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {/* Viscous Metaball Liquid Body + Satellite Blobs */}
        <g filter="url(#navbar-liquid-goo)">
          <path ref={mainBlobRef} fill="url(#adaptiveLiquidGrad)" d="M 0 0 Z" />
          {BLOB_SEEDS.map((_, idx) => (
            <circle
              key={`meta-${idx}`}
              ref={(el) => {
                metaballRefs.current[idx] = el;
              }}
              cx="0"
              cy="0"
              r="0"
              fill="rgba(14, 24, 20, 0.85)"
            />
          ))}
        </g>

        {/* Glossy Translucent Wave Reflection Rim */}
        <path
          ref={rimHighlightRef}
          fill="none"
          stroke="url(#liquidRimGrad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          d="M 0 0 Z"
          style={{ opacity: 0 }}
        />

        {/* Secondary Subtle Inner Specular Sheen */}
        <path
          ref={glossSheenRef}
          fill="none"
          stroke="rgba(220,235,228,0.25)"
          strokeWidth="1.2"
          d="M 0 0 Z"
          style={{ opacity: 0 }}
        />

        {/* Vanishing Small Liquid Droplets at end of Scene 4 */}
        {BLOB_SEEDS.map((_, idx) => (
          <circle
            key={`drop-${idx}`}
            ref={(el) => {
              trailingDropRefs.current[idx] = el;
            }}
            cx="0"
            cy="0"
            r="0"
            fill="url(#glossDropletGrad)"
            style={{ opacity: 0 }}
          />
        ))}
      </svg>
    </div>
  );
}
