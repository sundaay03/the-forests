'use client';

import { useEffect, useRef } from 'react';

interface PortalTransitionProps {
  /**
   * Portal transition progress from 0.0 to 1.0:
   * - 0.00 -> 0.55: Suction / Implosion phase at the end of Scene 7 (pulled into the vortex)
   * - 0.55 -> 0.65: Singularity core passage (crossovers from Scene 7 to Scene 8)
   * - 0.65 -> 1.00: Emergence phase at the start of Scene 8 (vortex opens outward)
   */
  progress: number;
}

interface WarpParticle {
  angle: number;
  radius: number;
  speed: number;
  angularSpeed: number;
  size: number;
  length: number;
  color: string;
  alpha: number;
}

const PORTAL_COLORS = [
  '#ffffff',
  '#f8fafc',
  '#f1f5f9',
  '#e2e8f0',
  '#cbd5e1',
];

export default function PortalTransition({ progress }: PortalTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<WarpParticle[]>([]);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const isActive = progress > 0.005 && progress < 0.995;

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
    let maxRadius = Math.hypot(width, height) * 0.65;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      maxRadius = Math.hypot(width, height) * 0.65;
    };
    window.addEventListener('resize', handleResize);

    // Initialize warp particles if empty
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 160; i++) {
        particlesRef.current.push({
          angle: Math.random() * Math.PI * 2,
          radius: Math.random() * maxRadius + 20,
          speed: Math.random() * 14 + 8,
          angularSpeed: (Math.random() * 0.04 + 0.02) * (Math.random() > 0.2 ? 1 : -1),
          size: Math.random() * 2.6 + 1,
          length: Math.random() * 45 + 20,
          color: PORTAL_COLORS[Math.floor(Math.random() * PORTAL_COLORS.length)],
          alpha: Math.random() * 0.75 + 0.25,
        });
      }
    }

    let time = 0;

    const render = () => {
      const p = Math.max(0, Math.min(1, progressRef.current));
      time += 0.045;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Intensity peaks at p = 0.56 (the singularity crossover point)
      const intensity =
        p <= 0.56
          ? Math.pow(p / 0.56, 1.35)
          : Math.pow(1 - (p - 0.56) / 0.44, 1.5);

      const isSuctionPhase = p <= 0.58;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // 1. DRAW SPIRALING VORTEX RINGS (Pure White Monochrome)
      const ringCount = 9;
      for (let r = 0; r < ringCount; r++) {
        // In suction phase, rings contract inward (1 -> 0); in emergence phase, rings expand outward
        const phaseOffset = (r / ringCount + time * (isSuctionPhase ? -0.32 : 0.38)) % 1;
        const normalizedR = phaseOffset < 0 ? phaseOffset + 1 : phaseOffset;
        const ringRadius = Math.pow(normalizedR, 1.7) * maxRadius * 0.85;

        const ringAlpha =
          Math.sin(normalizedR * Math.PI) * intensity * 0.42;

        if (ringAlpha > 0.01 && ringRadius > 4) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(time * (r % 2 === 0 ? 1.2 : -0.9) + r * 0.7);
          // Slight elliptical distortion for 3D vortex feel
          ctx.scale(1, 0.88 + Math.sin(time + r) * 0.08);

          ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
          ctx.lineWidth = 1.5 + (1 - normalizedR) * 3.5 * intensity;

          ctx.beginPath();
          ctx.arc(0, 0, ringRadius, 0, Math.PI * 1.65);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 2. DRAW WARP STREAKS SUCTIONED INTO THE PORTAL CORE (Monochrome Light Streaks)
      for (let i = 0; i < particlesRef.current.length; i++) {
        const pt = particlesRef.current[i];

        // Swirl angularly faster as particles approach the center singularity
        const proximityBoost = Math.max(0.25, 1 - pt.radius / maxRadius);
        pt.angle += pt.angularSpeed * (1 + proximityBoost * 3.2) * (0.5 + intensity);

        if (isSuctionPhase) {
          // Suction inward toward the portal center
          pt.radius -= pt.speed * (0.6 + intensity * 1.9) * (0.4 + proximityBoost);
          if (pt.radius <= 6) {
            pt.radius = maxRadius * (0.75 + Math.random() * 0.35);
            pt.angle = Math.random() * Math.PI * 2;
          }
        } else {
          // Burst / expand outward as viewer exits portal into Scene 8
          pt.radius += pt.speed * (0.8 + intensity * 2.2);
          if (pt.radius >= maxRadius) {
            pt.radius = Math.random() * 35 + 8;
            pt.angle = Math.random() * Math.PI * 2;
          }
        }

        const streakLen = pt.length * (0.4 + intensity * 1.6);
        const innerR = Math.max(2, pt.radius - streakLen * 0.5);
        const outerR = pt.radius + streakLen * 0.5;

        // Slight spiral curve between tail and head
        const tailAngle = pt.angle - pt.angularSpeed * 2.2;
        const x1 = cx + Math.cos(pt.angle) * innerR;
        const y1 = cy + Math.sin(pt.angle) * innerR;
        const x2 = cx + Math.cos(tailAngle) * outerR;
        const y2 = cy + Math.sin(tailAngle) * outerR;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        const alpha = pt.alpha * intensity;
        if (isSuctionPhase) {
          grad.addColorStop(0, pt.color);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          grad.addColorStop(1, pt.color);
        }

        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.strokeStyle = grad;
        ctx.lineWidth = pt.size * (0.7 + intensity * 0.8);
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // 3. CENTRAL SINGULARITY CORE GLOW & SHOCKWAVE (Pure Monochrome White)
      const coreRadius = Math.max(
        20,
        (intensity * 0.55 + Math.pow(Math.max(0, 1 - Math.abs(p - 0.56) * 4.5), 2) * 0.85) *
          Math.min(width, height)
      );
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
      coreGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, intensity * 1.25)})`);
      coreGrad.addColorStop(0.25, `rgba(255, 255, 255, ${intensity * 0.8})`);
      coreGrad.addColorStop(0.55, `rgba(255, 255, 255, ${intensity * 0.3})`);
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.globalAlpha = 1;
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive]);

  if (!isActive) return null;

  const p = Math.max(0, Math.min(1, progress));
  const intensity =
    p <= 0.56
      ? Math.pow(p / 0.56, 1.35)
      : Math.pow(1 - (p - 0.56) / 0.44, 1.5);

  // Peak flash right at the event horizon (p ≈ 0.56)
  const horizonFlash = Math.pow(Math.max(0, 1 - Math.abs(p - 0.56) * 5.5), 2.2);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-30 overflow-hidden"
    >
      {/* Gravitational Tunnel Vignette (Pure Black Vignette) */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent ${Math.max(
            8,
            55 - intensity * 42
          )}%, rgba(0, 0, 0, ${intensity * 0.88}) ${Math.max(
            35,
            78 - intensity * 30
          )}%, rgba(0, 0, 0, ${Math.min(0.98, intensity * 1.15)}) 100%)`,
        }}
      />

      {/* Procedural 60fps Canvas Vortex & Warp Streaks */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Event Horizon Singularity Flash (Pure White / Black Glow) */}
      {horizonFlash > 0.01 && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.45) 45%, rgba(0,0,0,0) 80%)',
            opacity: horizonFlash * 0.9,
          }}
        />
      )}
    </div>
  );
}

