'use client';

import { useEffect, useRef } from 'react';

interface BurnTransitionProps {
  /**
   * Progress of the fire transition from 0.0 (no fire) to 1.0 (fully consumed by roaring flames)
   */
  progress: number;
}

interface FlameParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  colorType: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

export default function BurnTransition({ progress }: BurnTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const flamesRef = useRef<FlameParticle[]>([]);
  const sparksRef = useRef<Spark[]>([]);

  useEffect(() => {
    if (progress <= 0.01) {
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

    const sparkColors = ['#ffffff', '#fff2a8', '#ffaa00', '#ff5500', '#ff2200'];

    let time = 0;
    const render = () => {
      time += 0.05;
      ctx.clearRect(0, 0, width, height);

      // Current fire front height line (surges from below bottom to beyond top)
      // At progress = 0: fire is at height + 50
      // At progress = 0.5: fire is at height * 0.4
      // At progress = 1: fire is at -100
      const fireFrontY = height * (1.1 - progress * 1.3);

      // 1. SPAWN FLAME PARTICLES along the fire front
      const spawnCount = Math.floor(10 + progress * 25);
      for (let i = 0; i < spawnCount; i++) {
        if (flamesRef.current.length < 180) {
          const x = Math.random() * width;
          const y = fireFrontY + Math.random() * (height - fireFrontY + 80);
          flamesRef.current.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 3,
            vy: -(Math.random() * 6 + 4),
            size: Math.random() * 28 + 16,
            life: 0,
            maxLife: Math.random() * 25 + 20,
            colorType: Math.random(),
          });
        }
      }

      // 2. SPAWN RISING SPARKS / EMBERS
      const sparkCount = Math.floor(4 + progress * 10);
      for (let i = 0; i < sparkCount; i++) {
        if (sparksRef.current.length < 80) {
          sparksRef.current.push({
            x: Math.random() * width,
            y: fireFrontY + Math.random() * 200,
            vx: (Math.random() - 0.5) * 4,
            vy: -(Math.random() * 7 + 4),
            size: Math.random() * 3.5 + 1.2,
            opacity: Math.random() * 0.8 + 0.2,
            color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
          });
        }
      }

      // 3. DRAW PROCEDURAL FLAME TONGUES (Additive composite for incandescent fire heat)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (let i = flamesRef.current.length - 1; i >= 0; i--) {
        const f = flamesRef.current[i];
        f.life++;
        f.x += f.vx + Math.sin(time + f.y * 0.02) * 1.5;
        f.y += f.vy;
        f.size *= 0.96;

        if (f.life >= f.maxLife || f.size <= 2) {
          flamesRef.current.splice(i, 1);
          continue;
        }

        const lifeRatio = f.life / f.maxLife;
        // Color transition: White-Hot core -> Yellow -> Vivid Orange -> Deep Crimson
        let color = 'rgba(255, 60, 0, 0.4)';
        if (lifeRatio < 0.25) {
          color = 'rgba(255, 255, 230, 0.85)';
        } else if (lifeRatio < 0.5) {
          color = 'rgba(255, 200, 30, 0.75)';
        } else if (lifeRatio < 0.75) {
          color = 'rgba(255, 90, 0, 0.6)';
        } else {
          color = 'rgba(200, 20, 0, 0.35)';
        }

        const rad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size);
        rad.addColorStop(0, color);
        rad.addColorStop(0.5, color.replace(/[\d\.]+\)$/, '0.3)'));
        rad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 4. DRAW FLYING SPARKS & EMBERS
      ctx.save();
      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const s = sparksRef.current[i];
        s.y += s.vy;
        s.x += s.vx + Math.sin(time * 2 + s.y * 0.03) * 2;
        s.opacity -= 0.015;

        if (s.y < -30 || s.opacity <= 0) {
          sparksRef.current.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = Math.max(0, s.opacity) * Math.min(1, progress * 1.5);
        ctx.fillStyle = s.color;
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = s.size * 5;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [progress > 0.01]);

  if (progress <= 0.005) return null;

  const p = Math.max(0, Math.min(1, progress));
  // Fire wall surge height: from +100% (below) to 0% (engulfed)
  const surgeTranslateY = (1 - p) * 110;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-30 overflow-hidden"
    >
      {/* 1. Scorching Red/Orange Atmosphere Illumination */}
      <div
        className="absolute inset-0 transition-opacity duration-100"
        style={{
          background: `radial-gradient(ellipse 100% 90% at 50% 90%, rgba(255, 60, 0, ${
            p * 0.8
          }) 0%, rgba(255, 120, 0, ${p * 0.6}) 40%, rgba(180, 20, 0, ${
            p * 0.65
          }) 70%, rgba(0, 0, 0, ${p * 0.95}) 100%)`,
        }}
      />

      {/* 2. Raging Wall of Flame Surging from the Bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-[120vh] will-change-transform pointer-events-none"
        style={{
          transform: `translate3d(0, ${surgeTranslateY}%, 0)`,
          background:
            'linear-gradient(to top, rgba(255, 255, 240, 0.95) 0%, rgba(255, 210, 40, 0.9) 15%, rgba(255, 80, 0, 0.85) 35%, rgba(220, 20, 0, 0.7) 60%, rgba(80, 10, 0, 0.5) 85%, transparent 100%)',
          filter: 'drop-shadow(0 -15px 45px rgba(255, 80, 0, 0.95))',
          mixBlendMode: 'screen',
        }}
      >
        {/* Animated Flame Tongue Silhouette Layer */}
        <div
          className="absolute inset-0 w-full h-full opacity-90 animate-heat-shimmer"
          style={{
            background:
              'radial-gradient(ellipse 120% 60% at 50% 100%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 180, 20, 0.85) 30%, rgba(255, 50, 0, 0.7) 65%, transparent 95%)',
          }}
        />
      </div>

      {/* 3. Canvas Procedural Leaping Fire Tongues & Flying Sparks */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* 4. Billowing Black Smoke Clouds at the Upper Boundary */}
      <div
        className="absolute inset-0 transition-opacity duration-200 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 20%, rgba(10, 2, 0, 0.85) 0%, rgba(0, 0, 0, 0.95) 80%, rgba(0, 0, 0, 1) 100%)',
          opacity: p > 0.65 ? (p - 0.65) / 0.35 : 0,
        }}
      />
    </div>
  );
}
