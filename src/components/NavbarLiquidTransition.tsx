'use client';

import { useEffect, useRef } from 'react';

export interface LiquidTransitionRequest {
  id: number;
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
  lingerFactor: number; // How long it trails behind in Scene 4 reveal
}

const TOTAL_DURATION_MS = 1320; // ~1.32 seconds (1–1.5s cinematic pacing)

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeInCubic = (t: number) => t * t * t;

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
  if (baseRadius <= 0.5) return `M ${ox} ${oy} Z`;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const wave =
      Math.sin(theta * 3 + time * 3.1) * 0.085 +
      Math.cos(theta * 5 - time * 2.4) * 0.052 +
      Math.sin(theta * 7 + time * 4.2) * 0.028 +
      Math.cos(theta * 2 - time * 1.8) * 0.065;

    // Subtle downward viscous pull so liquid naturally flows from navbar toward viewport bottom
    const sag = Math.max(0, Math.sin(theta)) * gravitySag;
    const r = Math.max(0, baseRadius * (1 + wave * waveIntensity + sag));

    points.push({
      x: ox + Math.cos(theta) * r,
      y: oy + Math.sin(theta) * r,
    });
  }

  // Convert polygon points into smooth closed quadratic Bezier splines
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
  const mainBlobRef = useRef<SVGPathElement | null>(null);
  const rimHighlightRef = useRef<SVGPathElement | null>(null);
  const glossSheenRef = useRef<SVGPathElement | null>(null);
  const fullCoverRef = useRef<HTMLDivElement | null>(null);
  const metaballRefs = useRef<(SVGCircleElement | null)[]>([]);
  const trailingDropRefs = useRef<(SVGCircleElement | null)[]>([]);
  const turbRef = useRef<SVGFETurbulenceElement | null>(null);

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

    // Max distance from click point to farthest viewport corner (+ generous liquid wave buffer)
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

      // Subtle animated turbulence frequency for digital liquid refraction
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

      if (t < 0.18) {
        // SCENE 1 – LIQUID AWAKENING (0.00 -> 0.18): Drops bud and swell organically from navbar click
        const s1 = t / 0.18;
        const spring = 1 - Math.pow(1 - s1, 2.6);
        currentRadius = 10 + spring * Math.min(vw, vh) * 0.16;
        waveAmp = 1.25;
        sag = 0.22 * spring;
        backdropOpacity = spring * 0.55;
      } else if (t < 0.46) {
        // SCENE 2 – LIQUID EXPANSION (0.18 -> 0.46): Wavy viscous surge blankets the viewport
        const s2 = (t - 0.18) / 0.28;
        const surge = easeInOutCubic(s2);
        const startR = 10 + Math.min(vw, vh) * 0.16;
        currentRadius = startR + (fullRadius - startR) * surge;
        waveAmp = 1.15 - surge * 0.45;
        sag = 0.22 * (1 - surge * 0.65);
        backdropOpacity = 0.55 + surge * 0.45;
        solidCoverOpacity = smoothstep(0.78, 1.0, s2);
      } else if (t < 0.56) {
        // SCENE 3 – PAGE TRANSITION (0.46 -> 0.56): 100% opaque liquid coverage while page switches cleanly
        currentRadius = fullRadius;
        waveAmp = 0.35;
        sag = 0;
        solidCoverOpacity = 1;
        backdropOpacity = 1;
        rimOpacity = 0.25;

        if (!swapped && t >= 0.48) {
          swapped = true;
          onSwapRef.current(request.targetChapter);
        }
      } else {
        // SCENE 4 – LIQUID REVEAL (0.56 -> 1.00): Liquid pulls back organically upward toward navbar, leaving vanishing droplets
        const s4 = (t - 0.56) / 0.44;
        const retract = easeInCubic(smoothstep(0.0, 0.86, s4));
        currentRadius = fullRadius * (1 - retract);
        waveAmp = 0.75 + Math.sin(s4 * Math.PI) * 0.75;
        sag = 0.16 * Math.sin(s4 * Math.PI);
        solidCoverOpacity = 1 - smoothstep(0.0, 0.18, s4);
        backdropOpacity = 1 - smoothstep(0.55, 0.96, s4);
        rimOpacity = (1 - smoothstep(0.72, 0.98, s4)) * 0.9;
      }

      // 1. Update main organic liquid body + specular rim paths
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
        glossSheenRef.current.style.opacity = `${(rimOpacity * 0.42).toFixed(3)}`;
      }

      // 2. Update satellite metaball droplets fused via SVG goo/turbulence filter
      for (let i = 0; i < BLOB_SEEDS.length; i++) {
        const seed = BLOB_SEEDS[i];
        const el = metaballRefs.current[i];
        if (!el) continue;

        let blobR = 0;
        let bx = ox;
        let by = oy;

        if (t < 0.48) {
          // Awakening & Expansion: blobs detach slightly ahead of the main liquid tide and coalesce
          const lead = 1.04 + Math.sin(timeSec * seed.freq + seed.phase) * 0.12;
          const dist = currentRadius * lead * seed.distMul;
          const angle = seed.angleOffset + Math.sin(timeSec * 1.4 + seed.phase) * 0.25;
          bx = ox + Math.cos(angle) * dist;
          by = oy + Math.sin(angle) * dist;
          const life = smoothstep(0.02, 0.16, t) * (1 - smoothstep(0.38, 0.48, t));
          blobR = seed.baseRadius * (0.65 + easeOutQuart(t / 0.48) * 1.35) * life;
        } else if (t >= 0.56) {
          // Reveal: smaller metaballs trail below the receding liquid crest and shrink away naturally
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
      }

      // 3. Final tiny crisp glossy surface droplets vanishing naturally at end of Scene 4
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
          dropEl.style.opacity = `${(fade * 0.55).toFixed(3)}`;
        } else {
          dropEl.setAttribute('r', '0');
          dropEl.style.opacity = '0';
        }
      }

      // 4. Sync backdrop blur distortion + full-cover lock during Scene 3
      if (backdropBlurRef.current) {
        const blurCircle = `circle(${Math.max(0, currentRadius).toFixed(1)}px at ${ox.toFixed(1)}px ${oy.toFixed(1)}px)`;
        backdropBlurRef.current.style.clipPath = blurCircle;
        backdropBlurRef.current.style.opacity = `${backdropOpacity.toFixed(3)}`;
      }
      if (fullCoverRef.current) {
        fullCoverRef.current.style.opacity = `${solidCoverOpacity.toFixed(3)}`;
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
      {/* Translucent frosted glass liquid refraction wave */}
      <div
        ref={backdropBlurRef}
        className="absolute inset-0 bg-black/25 backdrop-blur-md"
        style={{ opacity: 0, willChange: 'clip-path, opacity' }}
      />

      {/* Guarantee 100% seamless dark obsidian coverage at Scene 3 page swap */}
      <div
        ref={fullCoverRef}
        className="absolute inset-0"
        style={{
          opacity: 0,
          background:
            'radial-gradient(circle at 50% 25%, #111317 0%, #07080a 48%, #020203 100%)',
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

          {/* Deep Obsidian Monochrome Liquid Gradient matching website palette */}
          <radialGradient id="obsidianLiquidGrad" cx="50%" cy="20%" r="85%">
            <stop offset="0%" stopColor="#14171c" stopOpacity="0.97" />
            <stop offset="45%" stopColor="#090a0d" stopOpacity="0.99" />
            <stop offset="100%" stopColor="#020203" stopOpacity="1" />
          </radialGradient>

          {/* Subtle Glass Specular Reflection Rim */}
          <linearGradient id="liquidRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.58)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.45)" />
          </linearGradient>

          <radialGradient id="glossDropletGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.72)" />
            <stop offset="45%" stopColor="rgba(212,212,212,0.22)" />
            <stop offset="100%" stopColor="rgba(10,12,15,0.0)" />
          </radialGradient>
        </defs>

        {/* Viscous Metaball Liquid Body + Satellite Blobs */}
        <g filter="url(#navbar-liquid-goo)">
          <path ref={mainBlobRef} fill="url(#obsidianLiquidGrad)" d="M 0 0 Z" />
          {BLOB_SEEDS.map((_, idx) => (
            <circle
              key={`meta-${idx}`}
              ref={(el) => {
                metaballRefs.current[idx] = el;
              }}
              cx="0"
              cy="0"
              r="0"
              fill="#07080a"
            />
          ))}
        </g>

        {/* Glossy Monochrome Translucent Wave Reflection Rim */}
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
          stroke="rgba(255,255,255,0.22)"
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

