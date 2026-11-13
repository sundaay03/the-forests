'use client';

import { useState, type ReactNode, type MouseEvent } from 'react';

interface RegionalFireEntry {
  rank: number;
  region: string;
  area: string;
}

const REGIONAL_FIRES: RegionalFireEntry[] = [
  { rank: 1, region: 'Papua', area: '313,777 ha' },
  { rank: 2, region: 'Bali, Nusa Tenggara, and Maluku', area: '297,732 ha' },
  { rank: 3, region: 'Kalimantan', area: '258,149 ha' },
  { rank: 4, region: 'Sumatra, Java, and Sulawesi', area: '233,474 ha' },
];

interface Glass3DCardProps {
  children: ReactNode;
  isActive: boolean;
  delayMs?: number;
  translateY?: number;
  opacity?: number;
}

/**
 * Reusable 3D Glassmorphism card shell with perspective tilt, dynamic light
 * reflection, frosted dark-forest glass surface, and reddish-orange edge glow.
 */
function Glass3DCard({
  children,
  isActive,
  delayMs = 0,
  translateY = 0,
  opacity = 1,
}: Glass3DCardProps) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 20, hovered: false });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 9;
    const rx = (0.5 - py) * 9;
    setTilt({
      rx,
      ry,
      gx: px * 100,
      gy: py * 100,
      hovered: true,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 20, hovered: false });
  };

  return (
    <div
      className="relative h-full [perspective:1200px] will-change-transform"
      style={{
        transform: `translate3d(0, ${translateY.toFixed(1)}px, 0)`,
        opacity,
        pointerEvents: isActive && opacity > 0.85 ? 'auto' : 'none',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease-out',
        transitionDelay: `${delayMs}ms`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative h-full flex flex-col justify-between rounded-3xl p-5 sm:p-6 md:p-7 backdrop-blur-2xl border border-white/15 overflow-hidden text-left font-sans will-change-transform"
        style={{
          background:
            'linear-gradient(145deg, rgba(11, 24, 18, 0.80) 0%, rgba(8, 14, 12, 0.88) 55%, rgba(28, 12, 8, 0.84) 100%)',
          transform: tilt.hovered
            ? `rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg) translateY(-4px) translateZ(12px)`
            : 'rotateX(1.5deg) rotateY(0deg) translateZ(0px)',
          transition: tilt.hovered
            ? 'transform 0.12s ease-out, box-shadow 0.3s ease-out'
            : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.55s ease-out',
          boxShadow: tilt.hovered
            ? '0 30px 70px -12px rgba(0, 0, 0, 0.9), 0 0 42px -8px rgba(255, 87, 34, 0.34), inset 0 1px 0 0 rgba(255, 255, 255, 0.32), inset 1px 0 0 0 rgba(255, 255, 255, 0.16)'
            : '0 22px 55px -12px rgba(0, 0, 0, 0.85), 0 0 30px -10px rgba(255, 87, 34, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.24), inset 1px 0 0 0 rgba(255, 255, 255, 0.10)',
        }}
      >
        {/* Top glowing edge highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-orange-400/75 to-transparent"
        />

        {/* Subtle resting glass specular sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(125deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.025) 36%, transparent 62%)',
          }}
        />

        {/* Interactive cursor light reflection across glass */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: tilt.hovered ? 1 : 0.35,
            background: `radial-gradient(circle 280px at ${tilt.gx}% ${tilt.gy}%, rgba(255, 112, 67, 0.14), rgba(255, 255, 255, 0.05) 40%, transparent 75%)`,
          }}
        />

        {/* Bottom-right ambient ember reflection */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-orange-600/15 blur-3xl"
        />

        <div className="relative z-10 h-full flex flex-col justify-between gap-4 sm:gap-5">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Minimalist 3D visual icon wrapper with elevated glass capsule & red/orange glow.
 */
function Icon3DBadge({
  children,
  accent = 'red',
}: {
  children: ReactNode;
  accent?: 'red' | 'orange';
}) {
  const glow =
    accent === 'red'
      ? 'shadow-[0_10px_24px_-4px_rgba(239,68,68,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] border-red-400/35 bg-gradient-to-br from-red-500/30 via-red-900/40 to-black/60'
      : 'shadow-[0_10px_24px_-4px_rgba(249,115,22,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] border-orange-400/35 bg-gradient-to-br from-orange-500/30 via-orange-900/40 to-black/60';

  return (
    <div
      className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border backdrop-blur-md flex items-center justify-center ${glow}`}
    >
      {children}
    </div>
  );
}

interface KarhutlaDashboardProps {
  isActive: boolean;
  cardsProgress?: number; // 0.0 (hidden off-screen) to 1.0 (settled)
}

export default function KarhutlaDashboard({
  isActive,
  cardsProgress = 1,
}: KarhutlaDashboardProps) {
  const p = isActive ? Math.max(0, Math.min(1, cardsProgress)) : 0;
  const ease = 1 - Math.pow(1 - p, 2.5);

  // Card kiri (Total Forest Fires) muncul dari bawah (+200px -> 0px)
  const leftTranslateY = (1 - ease) * 200;
  const leftOpacity = p <= 0.01 ? 0 : Math.min(1, p * 1.5);

  // Card kanan (Forest Fire Victims) muncul dari atas (-200px -> 0px)
  const rightTranslateY = (1 - ease) * -200;
  const rightOpacity = p <= 0.01 ? 0 : Math.min(1, p * 1.5);

  return (
    <div
      className={`w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 items-stretch ${
        isActive && p > 0.85 ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* ===================== CARD 1: TOTAL FOREST FIRES (From Below) ===================== */}
      <Glass3DCard
        isActive={isActive}
        translateY={leftTranslateY}
        opacity={leftOpacity}
      >
        <div>
          <div className="mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-white">
              Total Forest Fires
            </h2>
          </div>

          {/* Regional Ranking List */}
          <ul className="divide-y divide-white/10">
            {REGIONAL_FIRES.map((entry) => (
              <li
                key={entry.rank}
                className="flex items-center justify-between gap-3 py-2.5 sm:py-3 first:pt-1 last:pb-1"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 w-6 h-6 rounded-lg bg-white/5 border border-white/15 text-[11px] sm:text-xs font-bold text-orange-400 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                    {entry.rank}
                  </span>
                  <span className="text-xs sm:text-sm md:text-[15px] font-medium text-neutral-100 leading-snug">
                    {entry.region}
                  </span>
                </div>
                <span className="shrink-0 text-xs sm:text-sm md:text-[15px] font-semibold text-white/95 tabular-nums whitespace-nowrap">
                  {entry.area}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* National Total Highlight */}
        <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-end justify-between gap-1.5">
          <span className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.2em] text-neutral-300">
            NATIONAL TOTAL
          </span>
          <span className="text-2xl sm:text-3xl md:text-[34px] font-black tracking-tight tabular-nums leading-none bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,87,34,0.4)]">
            1,103,132 ha
          </span>
        </div>
      </Glass3DCard>

      {/* ===================== CARD 2: FOREST FIRE VICTIMS (From Above) ===================== */}
      <Glass3DCard
        isActive={isActive}
        translateY={rightTranslateY}
        opacity={rightOpacity}
      >
        <div className="flex flex-col justify-between h-full gap-4">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-white">
              Forest Fire Victims
            </h2>
          </div>

          {/* Category 1: Direct Human Casualties */}
          <div className="space-y-3">
            <p className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.18em] text-red-400/95">
              1. Direct Human Casualties
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* 4 Deaths */}
              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/10 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                <Icon3DBadge accent="red">
                  {/* Minimalist 3D Human Alert / Casualty Icon */}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 drop-shadow-[0_2px_6px_rgba(239,68,68,0.8)]"
                    fill="none"
                  >
                    <defs>
                      <linearGradient id="casualtyGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fecaca" />
                        <stop offset="55%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#991b1b" />
                      </linearGradient>
                    </defs>
                    <circle cx="12" cy="7" r="3.4" fill="url(#casualtyGrad)" />
                    <path
                      d="M5.5 19.5c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6"
                      stroke="url(#casualtyGrad)"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </Icon3DBadge>
                <div className="min-w-0">
                  <div className="text-2xl sm:text-3xl font-black text-white tabular-nums leading-none">
                    4
                  </div>
                  <div className="mt-1 text-xs sm:text-sm font-medium text-neutral-300">
                    Deaths
                  </div>
                </div>
              </div>

              {/* 347 Injuries */}
              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/10 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                <Icon3DBadge accent="red">
                  {/* Minimalist 3D Medical Cross / Aid Icon */}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 drop-shadow-[0_2px_6px_rgba(239,68,68,0.8)]"
                    fill="none"
                  >
                    <defs>
                      <linearGradient id="medGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fee2e2" />
                        <stop offset="50%" stopColor="#f87171" />
                        <stop offset="100%" stopColor="#b91c1c" />
                      </linearGradient>
                    </defs>
                    <rect
                      x="3.5"
                      y="3.5"
                      width="17"
                      height="17"
                      rx="5"
                      fill="url(#medGrad)"
                      fillOpacity="0.22"
                      stroke="url(#medGrad)"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M12 7.5v9M7.5 12h9"
                      stroke="url(#medGrad)"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </Icon3DBadge>
                <div className="min-w-0">
                  <div className="text-2xl sm:text-3xl font-black text-white tabular-nums leading-none">
                    347
                  </div>
                  <div className="mt-1 text-xs sm:text-sm font-medium text-neutral-300">
                    Injuries
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle Category Separator */}
          <div className="border-t border-white/15" />

          {/* Category 2: Health Impacts from Haze */}
          <div className="space-y-3">
            <p className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.18em] text-orange-400/95">
              2. Health Impacts from Haze
            </p>

            <div className="flex flex-col gap-2.5">
              {/* 333,470 ARI Cases */}
              <div className="flex items-center gap-3.5 rounded-2xl bg-white/[0.04] border border-white/10 p-3 sm:p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                <Icon3DBadge accent="orange">
                  {/* Minimalist 3D Lungs Icon */}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 drop-shadow-[0_2px_6px_rgba(249,115,22,0.8)]"
                    fill="none"
                  >
                    <defs>
                      <linearGradient id="lungsGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ffedd5" />
                        <stop offset="50%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#c2410c" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M12 4v6M12 10c-1.5 0-2.5 1-3 2"
                      stroke="url(#lungsGrad)"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 10c1.5 0 2.5 1 3 2"
                      stroke="url(#lungsGrad)"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9.8 8.2C7.4 8.4 4.5 10.6 4.2 14.8c-.2 2.8 1.5 4.7 3.8 4.7 1.4 0 2.3-.7 2.5-2V9.8c0-1-.3-1.6-.7-1.6Z"
                      fill="url(#lungsGrad)"
                      fillOpacity="0.88"
                    />
                    <path
                      d="M14.2 8.2c2.4.2 5.3 2.4 5.6 6.6.2 2.8-1.5 4.7-3.8 4.7-1.4 0-2.3-.7-2.5-2V9.8c0-1 .3-1.6.7-1.6Z"
                      fill="url(#lungsGrad)"
                      fillOpacity="0.88"
                    />
                  </svg>
                </Icon3DBadge>
                <div className="min-w-0">
                  <div className="text-2xl sm:text-3xl font-black text-orange-400 tabular-nums leading-none">
                    333,470
                  </div>
                  <div className="mt-1 text-xs sm:text-sm font-medium text-neutral-200 leading-snug">
                    ARI (Acute Respiratory Infection) Cases
                  </div>
                </div>
              </div>

              {/* Vulnerable Groups */}
              <div className="flex items-center gap-3.5 rounded-2xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                <Icon3DBadge accent="orange">
                  {/* Minimalist 3D Protective Mask / Smoke Shield Icon */}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 drop-shadow-[0_2px_6px_rgba(249,115,22,0.75)]"
                    fill="none"
                  >
                    <defs>
                      <linearGradient id="maskGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fed7aa" />
                        <stop offset="60%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#9a3412" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M6 10.5c0-1.2 2.7-2 6-2s6 .8 6 2v3.3c0 2.7-2.7 4.7-6 4.7s-6-2-6-4.7v-3.3Z"
                      fill="url(#maskGrad)"
                      fillOpacity="0.88"
                    />
                    <path
                      d="M6 11.2c-1.4 0-2.5.9-2.5 2s1.1 2 2.5 2M18 11.2c1.4 0 2.5.9 2.5 2s-1.1 2-2.5 2"
                      stroke="url(#maskGrad)"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9.5 13.5h5"
                      stroke="#fff7ed"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeOpacity="0.8"
                    />
                  </svg>
                </Icon3DBadge>
                <span className="text-xs sm:text-sm md:text-[15px] font-semibold text-neutral-100">
                  Vulnerable Groups
                </span>
              </div>
            </div>
          </div>
        </div>
      </Glass3DCard>
    </div>
  );
}

