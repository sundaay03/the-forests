'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface RegionalFireEntry {
  rank: number;
  region: string;
  area: string;
  percent: string;
}

const REGIONAL_FIRES: RegionalFireEntry[] = [
  { rank: 1, region: 'Papua', area: '313,777 ha', percent: '28.4%' },
  { rank: 2, region: 'Bali, Nusa Tenggara, and Maluku', area: '297,732 ha', percent: '27.0%' },
  { rank: 3, region: 'Kalimantan', area: '258,149 ha', percent: '23.4%' },
  { rank: 4, region: 'Sumatra, Java, and Sulawesi', area: '233,474 ha', percent: '21.2%' },
];

interface KarhutlaDashboardProps {
  isActive: boolean;
  cardsProgress?: number; // 0.0 to 1.0
}

export default function KarhutlaDashboard({
  isActive,
  cardsProgress = 1,
}: KarhutlaDashboardProps) {
  const [activeModal, setActiveModal] = useState<'burned' | 'casualties' | 'health' | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activeModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveModal(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  const p = isActive ? Math.max(0, Math.min(1, cardsProgress)) : 0;
  const ease = 1 - Math.pow(1 - p, 2.5);

  const translateY = (1 - ease) * 40;
  const opacity = p <= 0.01 ? 0 : Math.min(1, p * 1.4);

  return (
    <div
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center transition-all duration-300"
      style={{
        transform: `translate3d(0, ${translateY.toFixed(1)}px, 0)`,
        opacity,
        pointerEvents: isActive && opacity > 0.05 ? 'auto' : 'none',
      }}
    >
      {/* ===================== DASHBOARD CONTENT (BLURRED WHEN MODAL IS ACTIVE) ===================== */}
      <div
        className="w-full flex flex-col items-center justify-center transition-all duration-300"
        style={{
          filter: activeModal ? 'blur(5px)' : 'none',
          opacity: activeModal ? 0.65 : 1,
          transform: activeModal ? 'scale(0.99)' : 'none',
          transition: 'filter 0.3s ease-out, opacity 0.3s ease-out, transform 0.3s ease-out',
          pointerEvents: activeModal ? 'none' : 'auto',
        }}
      >
        {/* ===================== SECTION HEADER (Matches Scene 3 BURNING THE FUTURE typography) ===================== */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 max-w-4xl sm:max-w-5xl mx-auto flex flex-col items-center justify-center">
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white animate-heat-shimmer drop-shadow-[0_0_35px_rgba(255,87,34,0.8)] leading-[1.05] text-center px-4">
            HOW MUCH MORE FOREST MUST WE LOSE?
          </h2>
        </div>

        {/* ===================== 3-CARD GRID (Matches Image 2) ===================== */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
        {/* ---------------- CARD 1: BURNED LAND AREA ---------------- */}
        <div
          onClick={() => setActiveModal('burned')}
          className="group relative rounded-2xl bg-[#0e1219]/90 border border-white/10 hover:border-white/35 hover:bg-[#070a10]/95 p-5 sm:p-6 flex flex-col h-full backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 shadow-[0_12px_35px_-10px_rgba(0,0,0,0.85)] hover:shadow-[0_24px_55px_-12px_rgba(0,0,0,0.95)] cursor-pointer"
        >
          {/* Top Visual Box (Data Flow Diagram - Blue Aura) */}
          <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden mb-5 border border-white/10 group-hover:border-white/25 bg-gradient-to-br from-[#0c2448] via-[#091830] to-[#07101f] p-3 flex flex-col items-center justify-center transition-all duration-300">
            {/* Ambient Radial Flare */}
            <div
              aria-hidden="true"
              className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"
            />

            {/* Inner White Container (Diagram like Card 1 in reference) */}
            <div className="relative z-10 w-full bg-white rounded-xl p-2.5 sm:p-3 shadow-lg group-hover:shadow-2xl flex flex-col justify-between h-full text-neutral-800 transition-all duration-300">
              {/* Header inside graphic */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-1 text-[9px] sm:text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                <span>REGIONAL NETWORK</span>
                <span className="text-blue-600 font-extrabold">1,103,132 HA</span>
              </div>

              {/* Node connectivity diagram */}
              <div className="grid grid-cols-3 items-center gap-1.5 my-auto text-[9px] sm:text-[10px]">
                {/* Left Col */}
                <div className="flex flex-col gap-1.5">
                  <div className="bg-neutral-50 border border-neutral-200 rounded px-1.5 py-1 text-center font-semibold text-neutral-700 truncate shadow-xs">
                    Papua <span className="block text-[8px] text-neutral-400 font-normal">313.7k ha</span>
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200 rounded px-1.5 py-1 text-center font-semibold text-neutral-700 truncate shadow-xs">
                    Kalimantan <span className="block text-[8px] text-neutral-400 font-normal">258.1k ha</span>
                  </div>
                </div>

                {/* Center Core Node */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center shadow-md shadow-blue-500/30">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden="true">
                      <path d="M12 2c.5 3 3.5 5 3.5 8.5 0 3.6-2.9 6.5-6.5 6.5S2.5 14.1 2.5 10.5C2.5 8 4 6 5.5 4.5c.3 1.5 1.5 2.5 2.5 2.5 1.7 0 2.5-1.5 2.5-3 0-.7.5-1.5 1.5-2Z" />
                    </svg>
                    <span className="text-[7.5px] font-black tracking-tight leading-none mt-0.5">TOTAL</span>
                  </div>
                </div>

                {/* Right Col */}
                <div className="flex flex-col gap-1.5">
                  <div className="bg-neutral-50 border border-neutral-200 rounded px-1.5 py-1 text-center font-semibold text-neutral-700 truncate shadow-xs">
                    Bali &amp; Maluku <span className="block text-[8px] text-neutral-400 font-normal">297.7k ha</span>
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200 rounded px-1.5 py-1 text-center font-semibold text-neutral-700 truncate shadow-xs">
                    Sumatra <span className="block text-[8px] text-neutral-400 font-normal">233.4k ha</span>
                  </div>
                </div>
              </div>

              {/* Bottom tag inside graphic */}
              <div className="text-[8.5px] text-center text-neutral-400 font-medium">
                National Karhutla Coverage 2023–2024
              </div>
            </div>
          </div>

          {/* Card Meta Content */}
          <div className="flex flex-col flex-grow">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug mb-2 group-hover:text-neutral-300 transition-colors duration-200">
              1,103,132 ha scorched across Indonesia
            </h3>

            <p className="text-xs sm:text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-200 font-normal leading-relaxed">
              Papua, Bali-Nusa Tenggara, Kalimantan, and Sumatra recorded massive scorched acreage, ravaging pristine carbon-sink peatland.
            </p>
          </div>
        </div>

        {/* ---------------- CARD 2: DIRECT CASUALTIES ---------------- */}
        <div
          onClick={() => setActiveModal('casualties')}
          className="group relative rounded-2xl bg-[#0e1219]/90 border border-white/10 hover:border-white/35 hover:bg-[#070a10]/95 p-5 sm:p-6 flex flex-col h-full backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 shadow-[0_12px_35px_-10px_rgba(0,0,0,0.85)] hover:shadow-[0_24px_55px_-12px_rgba(0,0,0,0.95)] cursor-pointer"
        >
          {/* Top Visual Box (Segmented Bar Chart - Cyan/Teal Aura) */}
          <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden mb-5 border border-white/10 group-hover:border-white/25 bg-gradient-to-br from-[#063339] via-[#082228] to-[#071217] p-3 flex flex-col items-center justify-center transition-all duration-300">
            {/* Ambient Radial Flare */}
            <div
              aria-hidden="true"
              className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none"
            />

            {/* Inner White Container (Bar chart layout like Card 2 in reference) */}
            <div className="relative z-10 w-full bg-white rounded-xl p-2.5 sm:p-3 shadow-lg group-hover:shadow-2xl flex flex-col justify-between h-full text-neutral-800 transition-all duration-300">
              {/* Top pills */}
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="bg-neutral-100 text-neutral-600 rounded px-1.5 py-0.5 text-[8.5px] font-bold">Fatalities</span>
                <span className="bg-neutral-100 text-neutral-600 rounded px-1.5 py-0.5 text-[8.5px] font-bold">Injuries</span>
                <span className="bg-cyan-100 text-cyan-800 rounded px-1.5 py-0.5 text-[8.5px] font-bold">Responders</span>
              </div>

              {/* Data Callout */}
              <div className="flex items-baseline justify-between px-1 my-1">
                <div>
                  <span className="text-xl sm:text-2xl font-black text-red-600 tabular-nums leading-none">4</span>
                  <span className="text-[10px] font-semibold text-neutral-500 ml-1">Deaths</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black text-cyan-700 tabular-nums leading-none">347</span>
                  <span className="text-[10px] font-semibold text-neutral-500 ml-1">Injuries</span>
                </div>
              </div>

              {/* Segmented Vertical Bars (matching Card 2 reference) */}
              <div className="flex items-end justify-between gap-1.5 h-14 pt-1 px-1 border-b border-neutral-200">
                <div className="flex-1 bg-cyan-100 rounded-t h-[40%] flex flex-col justify-end">
                  <div className="w-full bg-cyan-600 rounded-t h-[60%]" />
                </div>
                <div className="flex-1 bg-red-100 rounded-t h-[90%] flex flex-col justify-end">
                  <div className="w-full bg-red-500 rounded-t h-[65%]" />
                </div>
                <div className="flex-1 bg-cyan-100 rounded-t h-[55%] flex flex-col justify-end">
                  <div className="w-full bg-cyan-600 rounded-t h-[70%]" />
                </div>
                <div className="flex-1 bg-cyan-100 rounded-t h-[75%] flex flex-col justify-end">
                  <div className="w-full bg-cyan-600 rounded-t h-[50%]" />
                </div>
                <div className="flex-1 bg-cyan-100 rounded-t h-[100%] flex flex-col justify-end">
                  <div className="w-full bg-cyan-600 rounded-t h-[75%]" />
                </div>
                <div className="flex-1 bg-cyan-100 rounded-t h-[60%] flex flex-col justify-end">
                  <div className="w-full bg-cyan-600 rounded-t h-[55%]" />
                </div>
              </div>

              {/* Bottom label */}
              <div className="text-[8.5px] text-center text-neutral-400 font-medium">
                Frontline Field Casualty Reports
              </div>
            </div>
          </div>

          {/* Card Meta Content */}
          <div className="flex flex-col flex-grow">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug mb-2 group-hover:text-neutral-300 transition-colors duration-200">
              351 direct casualties on the fire front
            </h3>

            <p className="text-xs sm:text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-200 font-normal leading-relaxed">
              4 fatalities and 347 injuries recorded among courageous ground firefighters, volunteer rangers, and local villagers holding perimeters.
            </p>
          </div>
        </div>

        {/* ---------------- CARD 3: HEALTH IMPACTS FROM HAZE ---------------- */}
        <div
          onClick={() => setActiveModal('health')}
          className="group relative rounded-2xl bg-[#0e1219]/90 border border-white/10 hover:border-white/35 hover:bg-[#070a10]/95 p-5 sm:p-6 flex flex-col h-full backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 shadow-[0_12px_35px_-10px_rgba(0,0,0,0.85)] hover:shadow-[0_24px_55px_-12px_rgba(0,0,0,0.95)] cursor-pointer"
        >
          {/* Top Visual Box (Thought Bubble & Waveform - Purple Aura) */}
          <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden mb-5 border border-white/10 group-hover:border-white/25 bg-gradient-to-br from-[#2f104d] via-[#1c0c32] to-[#0e071c] p-3 flex flex-col items-center justify-center transition-all duration-300">
            {/* Ambient Radial Flare */}
            <div
              aria-hidden="true"
              className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"
            />

            {/* Inner White Container (Waveform & prompt like Card 3 reference) */}
            <div className="relative z-10 w-full bg-white rounded-xl p-2.5 sm:p-3 shadow-lg group-hover:shadow-2xl flex flex-col justify-between h-full text-neutral-800 transition-all duration-300">
              {/* Thought Prompt Bubble on top right */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[9px] font-bold text-purple-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                  Health Alert
                </span>
                <span className="bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5 text-[8px] font-semibold">
                  How severe is the toxic haze?
                </span>
              </div>

              {/* Main Headline Metric inside box */}
              <div className="my-1">
                <div className="text-base sm:text-lg font-black text-neutral-900 leading-none">
                  333,470 <span className="text-[11px] font-bold text-purple-600 uppercase">ARI Cases</span>
                </div>
                <div className="text-[8.5px] text-neutral-500 font-medium leading-tight mt-0.5">
                  PM2.5 haze blankets communities, triggering acute respiratory distress.
                </div>
              </div>

              {/* Sensor Waveform Bars (like Card 3 waveform in reference) */}
              <div className="flex items-end justify-between gap-1 h-9 pt-1 px-1 bg-neutral-50 rounded border border-neutral-100">
                {[45, 60, 85, 40, 70, 95, 80, 65, 100, 75, 55, 90, 60, 45].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`w-1 rounded-full ${
                      i >= 5 && i <= 8 ? 'bg-purple-600' : 'bg-purple-300'
                    }`}
                  />
                ))}
              </div>

              {/* Bottom tag: Vulnerable Groups */}
              <div className="flex items-center justify-between text-[8px] text-neutral-500 font-medium pt-0.5">
                <span>Vulnerable Groups:</span>
                <span className="font-bold text-red-600">Infants, Children &amp; Elderly</span>
              </div>
            </div>
          </div>

          {/* Card Meta Content */}
          <div className="flex flex-col flex-grow">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug mb-2 group-hover:text-neutral-300 transition-colors duration-200">
              333,470 acute respiratory infection cases
            </h3>

            <p className="text-xs sm:text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-200 font-normal leading-relaxed">
              Dangerous PM2.5 concentrations enveloped entire cities, triggering widespread respiratory distress among infants, children, and elderly citizens.
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* ===================== INTERACTIVE DETAIL MODAL (PORTALED TO BODY FOR FULL-VIEWPORT DEFOCUS) ===================== */}
      {mounted && activeModal && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fadeIn"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-[#090c12]/95 backdrop-blur-2xl border border-white/20 p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors text-sm font-bold"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* TAB 1: BURNED LAND AREA */}
            {activeModal === 'burned' && (
              <div>
                <h3 className="text-2xl font-black text-white mb-1">
                  1,103,132 ha Scorched
                </h3>
                <p className="text-xs text-neutral-400 mb-5">
                  Detailed distribution of burned forest and land area across Indonesian regions.
                </p>

                <div className="divide-y divide-white/10 border-y border-white/10 mb-5">
                  {REGIONAL_FIRES.map((entry) => (
                    <div
                      key={entry.rank}
                      className="py-2.5 px-3 rounded-xl flex items-center justify-between transition-colors duration-200 hover:bg-black/50"
                    >
                      <span className="text-sm font-medium text-neutral-200">{entry.region}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white tabular-nums">{entry.area}</div>
                        <div className="text-[11px] text-neutral-400 tabular-nums">{entry.percent}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 font-bold text-sm">
                  <span className="text-neutral-400 uppercase tracking-widest text-xs">National Total</span>
                  <span className="text-xl font-black text-white tabular-nums">1,103,132 ha</span>
                </div>
              </div>
            )}

            {/* TAB 2: CASUALTIES */}
            {activeModal === 'casualties' && (
              <div>
                <h3 className="text-2xl font-black text-white mb-1">
                  351 Frontline Casualties
                </h3>
                <p className="text-xs text-neutral-400 mb-5">
                  Brave personnel and volunteers exposed to extreme fire fronts.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-black/40 hover:bg-black/75 border border-white/15 hover:border-white/30 transition-all duration-200">
                    <div className="text-3xl font-black text-red-400 tabular-nums">4</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-red-200 mt-1">Deaths</div>
                    <p className="text-[11px] text-neutral-400 mt-2">Fatal entrapments on volatile perimeters during sudden wind shifts.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 hover:bg-black/75 border border-white/15 hover:border-white/30 transition-all duration-200">
                    <div className="text-3xl font-black text-white tabular-nums">347</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-200 mt-1">Injuries</div>
                    <p className="text-[11px] text-neutral-400 mt-2">Severe burns, smoke inhalation, heat exhaustion, and blunt trauma.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: HEALTH CRISIS */}
            {activeModal === 'health' && (
              <div>
                <h3 className="text-2xl font-black text-white mb-1">
                  333,470 ARI Cases
                </h3>
                <p className="text-xs text-neutral-400 mb-5">
                  Acute Respiratory Infections triggered by toxic smoke particulates (PM2.5).
                </p>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-black/40 hover:bg-black/75 border border-white/15 hover:border-white/30 transition-all duration-200">
                    <div className="text-sm font-bold text-neutral-200">Acute Respiratory Infections (ISPA)</div>
                    <div className="text-2xl font-black text-white mt-0.5 tabular-nums">333,470 cases</div>
                    <p className="text-xs text-neutral-400 mt-1">Continuous inhalation of soot, carbon monoxide, and chemical irritants.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 hover:bg-black/75 border border-white/15 hover:border-white/30 transition-all duration-200">
                    <ul className="text-xs text-neutral-300 list-disc list-inside space-y-1.5">
                      <li>Infants and toddlers with developing pulmonary systems</li>
                      <li>Elderly individuals with existing cardiovascular conditions</li>
                      <li>Asthma, COPD, and bronchitis sufferers</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
