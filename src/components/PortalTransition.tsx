'use client';

import { useEffect, useRef } from 'react';

interface PortalTransitionProps {
  /**
   * Continuous Liquid Portal transition progress from 0.0 to 1.0 (Monochrome):
   * - 0.00 -> 0.50: Circular liquid monochrome portal opens at screen center & pulls viewer inward while Scene 7 zooms in (upright, no rotation)
   * - 0.50: Core passage liquid monochrome light ripple
   * - 0.50 -> 1.00: Scene 8 emerges cleanly inside the expanding liquid portal aperture (upright, settling zoom)
   */
  progress: number;
}

interface LiquidDroplet {
  angle: number;
  radialSlot: number; // 0.0 -> 1.0
  speed: number;
  angularSpeed: number;
  size: number;
  stretch: number;
  wobblePhase: number;
  wobbleSpeed: number;
  color: string;
  alpha: number;
}

// Pure Monochrome Liquid Palette (White, Silver, Neutral Gray)
const MONOCHROME_LIQUID_PALETTE = [
  '#ffffff',
  '#f5f5f5',
  '#e5e5e5',
  '#d4d4d4',
  '#a3a3a3',
];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export default function PortalTransition({ progress }: PortalTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const dropletsRef = useRef<LiquidDroplet[]>([]);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const isActive = progress > 0.002 && progress < 0.998;

  useEffect(() => {
    if (!isActive) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    if (dropletsRef.current.length === 0) {
      for (let i = 0; i < 120; i++) {
        dropletsRef.current.push({
          angle: Math.random() * Math.PI * 2,
          radialSlot: Math.random(),
          speed: 0.006 + Math.random() * 0.013,
          angularSpeed: (0.014 + Math.random() * 0.024) * (Math.random() > 0.25 ? -1 : 1),
          size: Math.random() * 5.0 + 1.8,
          stretch: 1.5 + Math.random() * 1.9,
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleSpeed: 2.2 + Math.random() * 3.0,
          color:
            MONOCHROME_LIQUID_PALETTE[
              Math.floor(Math.random() * MONOCHROME_LIQUID_PALETTE.length)
            ],
          alpha: Math.random() * 0.65 + 0.25,
        });
      }
    }

    let time = 0;

    /**
     * Seamless periodic liquid wave radius around a closed contour.
     */
    const getLiquidRadius = (
      baseR: number,
      theta: number,
      t: number,
      layer: number,
      viscosityAmp: number
    ) => {
      const w1 = Math.sin(theta * 3 + t * 2.2 + layer * 0.85) * 0.062;
      const w2 = Math.cos(theta * 5 - t * 1.7 + layer * 1.35) * 0.038;
      const w3 = Math.sin(theta * 2 - t * 2.9 + layer * 0.55) * 0.048;
      const w4 = Math.cos(theta * 7 + t * 2.5 - layer * 1.9) * 0.022;
      return baseR * (1 + (w1 + w2 + w3 + w4) * viscosityAmp);
    };

    const traceLiquidContour = (
      cx: number,
      cy: number,
      baseR: number,
      t: number,
      layer: number,
      rotOffset: number,
      viscosityAmp: number,
      segments = 96
    ) => {
      ctx.beginPath();
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        const r = getLiquidRadius(baseR, theta + rotOffset, t, layer, viscosityAmp);
        const x = cx + Math.cos(theta) * r;
        const y = cy + Math.sin(theta) * r;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    const render = () => {
      const p = clamp01(progressRef.current);
      time += 0.018;

      ctx.clearRect(0, 0, width, height);

      const minDim = Math.min(width, height);
      const maxCornerR = Math.hypot(width, height) * 0.56;
      const cx = width * 0.5;
      const cy = height * 0.5;

      const isSuction = p <= 0.5;

      const enterFade = smoothstep(0.0, 0.12, p);
      const exitFade = 1 - smoothstep(0.84, 0.995, p);
      const masterAlpha = enterFade * exitFade;

      if (masterAlpha <= 0.005) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      if (isSuction) {
        // ============================================================================
        // PHASE 1 (0.0 -> 0.50): LIQUID PORTAL OPENS AT CENTER & PULLS SCENE 7 INWARD
        // ============================================================================
        const t = clamp01(p / 0.5);
        const growth = smoothstep(0.0, 0.72, t);
        const plunge = t > 0.72 ? Math.pow((t - 0.72) / 0.28, 2.0) : 0;

        // Visible circular liquid portal right at screen center, expanding to swallow frame during plunge
        const portalRadius =
          minDim * (0.04 + growth * 0.34) + maxCornerR * plunge * 0.95;
        const viscosityAmp = 0.8 + growth * 0.65;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Outer monochrome portal halo
        const haloGrad = ctx.createRadialGradient(
          cx,
          cy,
          portalRadius * 0.12,
          cx,
          cy,
          portalRadius * 1.75
        );
        haloGrad.addColorStop(0, `rgba(255, 255, 255, ${masterAlpha * 0.2})`);
        haloGrad.addColorStop(0.35, `rgba(229, 229, 229, ${masterAlpha * 0.28})`);
        haloGrad.addColorStop(0.68, `rgba(115, 115, 115, ${masterAlpha * 0.15})`);
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, portalRadius * 1.75, 0, Math.PI * 2);
        ctx.fill();

        // Swirling concentric monochrome liquid membranes pulling inward toward core
        const ringCount = 12;
        for (let i = 0; i < ringCount; i++) {
          const cycle = (i / ringCount - time * 0.22) % 1;
          const norm = cycle < 0 ? cycle + 1 : cycle;
          const ringR = portalRadius * (0.14 + Math.pow(norm, 1.25) * 0.98);
          if (ringR < 4 || ringR > maxCornerR * 1.5) continue;

          const dir = i % 2 === 0 ? -1 : 1;
          const rot = time * (0.55 + (1 - norm) * 0.9) * dir + i * 0.7;
          const env = Math.sin(norm * Math.PI);
          const layerAlpha = masterAlpha * env * (0.45 + 0.55 * growth);
          if (layerAlpha <= 0.01) continue;

          traceLiquidContour(
            cx,
            cy,
            ringR,
            time,
            i,
            rot,
            viscosityAmp * (0.65 + (1 - norm) * 0.5)
          );

          const fillGrad = ctx.createRadialGradient(
            cx,
            cy,
            ringR * 0.3,
            cx,
            cy,
            ringR * 1.08
          );
          if (i % 4 === 0) {
            fillGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            fillGrad.addColorStop(0.8, `rgba(255, 255, 255, ${layerAlpha * 0.08})`);
            fillGrad.addColorStop(1, `rgba(245, 245, 245, ${layerAlpha * 0.18})`);
            ctx.strokeStyle = `rgba(255, 255, 255, ${layerAlpha * 0.68})`;
          } else if (i % 3 === 0) {
            fillGrad.addColorStop(0, 'rgba(229, 229, 229, 0)');
            fillGrad.addColorStop(0.75, `rgba(229, 229, 229, ${layerAlpha * 0.08})`);
            fillGrad.addColorStop(1, `rgba(212, 212, 212, ${layerAlpha * 0.16})`);
            ctx.strokeStyle = `rgba(229, 229, 229, ${layerAlpha * 0.62})`;
          } else {
            fillGrad.addColorStop(0, 'rgba(163, 163, 163, 0)');
            fillGrad.addColorStop(0.72, `rgba(212, 212, 212, ${layerAlpha * 0.09})`);
            fillGrad.addColorStop(1, `rgba(255, 255, 255, ${layerAlpha * 0.16})`);
            ctx.strokeStyle = `rgba(212, 212, 212, ${layerAlpha * 0.72})`;
          }

          ctx.fillStyle = fillGrad;
          ctx.fill();
          ctx.lineWidth = 1.5 + (1 - norm) * 3.0;
          ctx.stroke();
        }

        // Viscous spiral liquid tendrils pulling inward toward the portal core
        const streamCount = 8;
        for (let s = 0; s < streamCount; s++) {
          const baseA = (s / streamCount) * Math.PI * 2 - time * 1.05;
          const steps = 32;

          ctx.beginPath();
          for (let k = 0; k <= steps; k++) {
            const frac = k / steps;
            const r = portalRadius * (0.08 + frac * 1.02);
            const wave = Math.sin(frac * 7 - time * 4 + s) * 0.12;
            const a = baseA + frac * Math.PI * 1.7 + wave;
            const thickness =
              portalRadius * 0.042 * Math.sin(frac * Math.PI) * (0.85 + 0.2 * Math.sin(time * 3 + k));
            const x = cx + Math.cos(a) * (r + thickness);
            const y = cy + Math.sin(a) * (r + thickness);
            if (k === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          for (let k = steps; k >= 0; k--) {
            const frac = k / steps;
            const r = portalRadius * (0.08 + frac * 1.02);
            const wave = Math.sin(frac * 7 - time * 4 + s) * 0.12;
            const a = baseA + frac * Math.PI * 1.7 + wave;
            const thickness =
              portalRadius * 0.042 * Math.sin(frac * Math.PI) * (0.85 + 0.2 * Math.sin(time * 3 + k));
            const x = cx + Math.cos(a) * Math.max(0, r - thickness);
            const y = cy + Math.sin(a) * Math.max(0, r - thickness);
            ctx.lineTo(x, y);
          }
          ctx.closePath();

          const ribbonAlpha = masterAlpha * (0.14 + growth * 0.2);
          ctx.fillStyle =
            s % 3 === 0
              ? `rgba(255, 255, 255, ${ribbonAlpha * 0.78})`
              : s % 2 === 0
              ? `rgba(229, 229, 229, ${ribbonAlpha * 0.9})`
              : `rgba(163, 163, 163, ${ribbonAlpha * 0.85})`;
          ctx.fill();
        }

        // Monochrome droplets rushing inward into the portal vortex
        for (let i = 0; i < dropletsRef.current.length; i++) {
          const d = dropletsRef.current[i];
          d.angle += d.angularSpeed * (0.8 + growth * 1.3);
          d.radialSlot -= d.speed * (0.9 + growth * 1.2);
          if (d.radialSlot <= 0.04) {
            d.radialSlot = 0.95 + Math.random() * 0.25;
            d.angle = Math.random() * Math.PI * 2;
          }

          const r = d.radialSlot * portalRadius * 1.35;
          if (r > maxCornerR * 1.4 || r < 3) continue;

          const dx = cx + Math.cos(d.angle) * r;
          const dy = cy + Math.sin(d.angle) * r;
          const tangentAngle = d.angle + (d.angularSpeed > 0 ? Math.PI * 0.42 : -Math.PI * 0.42);
          const wobble = 1 + 0.2 * Math.sin(time * d.wobbleSpeed + d.wobblePhase);
          const rx = d.size * d.stretch * wobble;
          const ry = d.size / wobble;

          const dropAlpha =
            d.alpha * masterAlpha * Math.sin(clamp01(d.radialSlot) * Math.PI);
          if (dropAlpha <= 0.01) continue;

          ctx.save();
          ctx.translate(dx, dy);
          ctx.rotate(tangentAngle);

          const dropGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
          dropGrad.addColorStop(0, '#ffffff');
          dropGrad.addColorStop(0.38, d.color);
          dropGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.globalAlpha = clamp01(dropAlpha);
          ctx.fillStyle = dropGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Glowing monochrome liquid portal core
        const coreR = Math.max(16, portalRadius * 0.36);
        traceLiquidContour(cx, cy, coreR, time * 1.4, 88, -time * 1.1, viscosityAmp * 1.1);
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 1.25);
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${masterAlpha * (0.45 + plunge * 0.5)})`);
        coreGrad.addColorStop(0.38, `rgba(229, 229, 229, ${masterAlpha * (0.35 + plunge * 0.4)})`);
        coreGrad.addColorStop(0.75, `rgba(163, 163, 163, ${masterAlpha * 0.22})`);
        coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coreGrad;
        ctx.fill();

        ctx.restore();
      } else {
        // ============================================================================
        // PHASE 2 (0.50 -> 1.00): SCENE 8 EXPANDS INSIDE LIQUID PORTAL APERTURE
        // ============================================================================
        const t = clamp01((p - 0.5) / 0.5);
        const ease = 1 - Math.pow(1 - t, 2.2);

        // Exact pixel match with ScrollyVideoBackground Scene 8 outer div clip-path circle
        const apertureR = minDim * 0.05 + (maxCornerR - minDim * 0.05) * ease;
        const viscosityAmp = 1.05 - ease * 0.45;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Monochrome liquid rim around the expanding Scene 8 portal aperture (interior stays crystal clear)
        const rimGlow = ctx.createRadialGradient(
          cx,
          cy,
          Math.max(2, apertureR * 0.72),
          cx,
          cy,
          Math.max(40, apertureR * 1.45 + minDim * 0.16)
        );
        rimGlow.addColorStop(0, 'rgba(0, 0, 0, 0)');
        rimGlow.addColorStop(0.32, `rgba(255, 255, 255, ${masterAlpha * 0.34})`);
        rimGlow.addColorStop(0.56, `rgba(212, 212, 212, ${masterAlpha * 0.24})`);
        rimGlow.addColorStop(0.82, `rgba(115, 115, 115, ${masterAlpha * 0.12})`);
        rimGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = rimGlow;
        ctx.fillRect(0, 0, width, height);

        // Undulating monochrome liquid membranes hugging the opening Scene 8 portal edge
        const ringCount = 9;
        for (let i = 0; i < ringCount; i++) {
          const cycle = (i / ringCount + time * 0.24) % 1;
          const norm = cycle < 0 ? cycle + 1 : cycle;
          const ringR = apertureR * (0.94 + Math.pow(norm, 1.3) * 0.55) + norm * minDim * 0.05;
          if (ringR < 4 || ringR > maxCornerR * 1.55) continue;

          const dir = i % 2 === 0 ? 1 : -1;
          const rot = time * (0.55 + (1 - norm) * 0.7) * dir + i * 0.8;
          const env = Math.sin(norm * Math.PI);
          const layerAlpha = masterAlpha * env * 0.85;
          if (layerAlpha <= 0.01) continue;

          traceLiquidContour(cx, cy, ringR, time, i, rot, viscosityAmp);

          ctx.strokeStyle =
            i % 3 === 0
              ? `rgba(255, 255, 255, ${layerAlpha * 0.72})`
              : i % 2 === 0
              ? `rgba(229, 229, 229, ${layerAlpha * 0.68})`
              : `rgba(180, 180, 180, ${layerAlpha * 0.64})`;
          ctx.lineWidth = 1.6 + (1 - norm) * 3.2;
          ctx.stroke();
        }

        // Monochrome liquid droplets surging outward ahead of the opening portal rim
        for (let i = 0; i < dropletsRef.current.length; i++) {
          const d = dropletsRef.current[i];
          d.angle += d.angularSpeed * 0.85;
          d.radialSlot += d.speed * 1.45;
          if (d.radialSlot >= 1.0) {
            d.radialSlot = 0.02 + Math.random() * 0.2;
            d.angle = Math.random() * Math.PI * 2;
          }

          const r = apertureR * (0.92 + d.radialSlot * 0.85);
          if (r > maxCornerR * 1.45 || r < 4) continue;

          const dx = cx + Math.cos(d.angle) * r;
          const dy = cy + Math.sin(d.angle) * r;
          const tangentAngle = d.angle + (d.angularSpeed > 0 ? Math.PI * 0.42 : -Math.PI * 0.42);
          const wobble = 1 + 0.2 * Math.sin(time * d.wobbleSpeed + d.wobblePhase);
          const rx = d.size * d.stretch * wobble;
          const ry = d.size / wobble;

          const dropAlpha =
            d.alpha * masterAlpha * Math.sin(clamp01(d.radialSlot) * Math.PI);
          if (dropAlpha <= 0.01) continue;

          ctx.save();
          ctx.translate(dx, dy);
          ctx.rotate(tangentAngle);

          const dropGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
          dropGrad.addColorStop(0, '#ffffff');
          dropGrad.addColorStop(0.38, d.color);
          dropGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.globalAlpha = clamp01(dropAlpha);
          ctx.fillStyle = dropGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      }

      // ============================================================================
      // CORE CROSSOVER MONOCHROME BLOOM (p ≈ 0.43 -> 0.59)
      // ============================================================================
      const corePulse =
        smoothstep(0.41, 0.495, p) * (1 - smoothstep(0.505, 0.62, p));
      if (corePulse > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const bloomR = maxCornerR * (0.6 + corePulse * 0.65);
        const bloomGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bloomR);
        bloomGrad.addColorStop(0, `rgba(255, 255, 255, ${corePulse * 0.92})`);
        bloomGrad.addColorStop(0.35, `rgba(229, 229, 229, ${corePulse * 0.6})`);
        bloomGrad.addColorStop(0.7, `rgba(163, 163, 163, ${corePulse * 0.3})`);
        bloomGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bloomGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive]);

  if (!isActive) return null;

  const p = clamp01(progress);
  const enterFade = smoothstep(0.0, 0.12, p);
  const exitFade = 1 - smoothstep(0.84, 0.995, p);
  const vignetteAlpha = enterFade * exitFade;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-30 overflow-hidden"
    >
      {/* Pure Black Monochrome Framing Vignette */}
      <div
        className="absolute inset-0"
        style={{
          opacity: vignetteAlpha * 0.72,
          background:
            'radial-gradient(circle at 50% 50%, transparent 35%, rgba(0, 0, 0, 0.48) 72%, rgba(0, 0, 0, 0.9) 100%)',
        }}
      />

      {/* 60fps Monochrome Liquid Portal Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
}
