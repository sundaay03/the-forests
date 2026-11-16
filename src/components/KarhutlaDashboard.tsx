'use client';

import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import CursorTiltCard from './CursorTiltCard';
import CursorParallaxText from './CursorParallaxText';

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

interface BarDatum {
  label: string;
  value: number;
  displayValue: string;
}

interface MonochromeBarChartProps {
  unitLabel: string;
  yMax: number;
  yTicks: string[];
  data: BarDatum[];
}

function MonochromeBarChart({
  unitLabel,
  yMax,
  yTicks,
  data,
}: MonochromeBarChartProps) {
  const isSingleBar = data.length === 1;

  return (
    <div className="relative z-10 w-full h-36 sm:h-44 lg:h-52 rounded-xl overflow-hidden mb-3.5 sm:mb-4 lg:mb-5 border border-white/20 group-hover:border-white/40 bg-black/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),inset_0_-3px_10px_rgba(0,0,0,0.55),0_8px_20px_-6px_rgba(0,0,0,0.55)] p-2.5 sm:p-3 lg:p-3.5 flex flex-col transition-all duration-300 select-none">
      {/* Top-left Y-Axis Unit Label */}
      <div className="text-[9.5px] sm:text-[10.5px] font-bold text-white tracking-tight text-left leading-none mb-2">
        {unitLabel}
      </div>

      {/* Main Chart Plot Area (Y-Ticks + Grid/Bars) */}
      <div className="relative flex-1 min-h-0 flex items-stretch">
        {/* Left Y-Axis Labels */}
        <div className="relative w-10 sm:w-11 shrink-0 pr-1.5 text-right">
          {yTicks.map((tick, idx) => {
            const topPct = (idx / (yTicks.length - 1)) * 100;
            return (
              <span
                key={tick}
                style={{ top: `${topPct}%` }}
                className="absolute right-1.5 -translate-y-1/2 text-[8px] sm:text-[9px] font-medium text-neutral-300 tabular-nums leading-none"
              >
                {tick}
              </span>
            );
          })}
        </div>

        {/* L-Frame Axes & Vertical Bars */}
        <div className="relative flex-1 border-l-[1.5px] border-b-[1.5px] border-white/85">
          {/* Horizontal Gridlines */}
          {yTicks.slice(0, -1).map((tick, idx) => {
            const topPct = (idx / (yTicks.length - 1)) * 100;
            return (
              <div
                key={tick}
                style={{ top: `${topPct}%` }}
                className="absolute left-0 right-0 border-t border-white/12 pointer-events-none"
              />
            );
          })}

          {/* Vertical Pure White Bars + Top Value Labels */}
          <div className="relative z-10 h-full w-full flex items-end justify-around px-2 sm:px-3 gap-2 sm:gap-3">
            {data.map((item) => {
              const rawPct = Math.max(0, Math.min(100, (item.value / yMax) * 100));
              return (
                <div
                  key={item.label}
                  className={`relative h-full flex items-end justify-center ${
                    isSingleBar ? 'w-14 sm:w-16' : 'flex-1 max-w-[44px]'
                  }`}
                >
                  <span
                    style={{ bottom: `calc(${rawPct}% + 4px)` }}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] sm:text-[10.5px] font-extrabold text-white tabular-nums leading-none whitespace-nowrap"
                  >
                    {item.displayValue}
                  </span>
                  <div
                    style={{
                      height: `${rawPct}%`,
                      minHeight: item.value > 0 ? '3px' : '0px',
                    }}
                    className="w-full bg-white transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(255,255,255,0.25)]"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom X-Axis Category Labels */}
      <div className="pl-10 sm:pl-11 pt-1.5">
        <div className="flex items-start justify-around px-2 sm:px-3 gap-2 sm:gap-3">
          {data.map((item) => (
            <div
              key={item.label}
              className={`text-center text-[7.5px] sm:text-[8.5px] font-medium text-neutral-200 leading-[1.15] ${
                isSingleBar ? 'w-32 sm:w-40' : 'flex-1'
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface KarhutlaDashboardProps {
  isActive: boolean;
  cardsProgress?: number; // 0.0 to 1.0
  exitProgress?: number; // 0.0 to 1.0
  localProgress?: number; // 0.0 to 1.0 across Scene 4
}

interface StatisticCardConfig {
  id: 'burned' | 'casualties' | 'health';
  unitLabel: string;
  yMax: number;
  yTicks: string[];
  data: BarDatum[];
  title: string;
  description: string;
}

const STATISTIC_CARDS: StatisticCardConfig[] = [
  {
    id: 'burned',
    unitLabel: 'Area (ha)',
    yMax: 400000,
    yTicks: ['400.000', '300.000', '200.000', '100.000', '0'],
    data: [
      { label: 'Papua', value: 313777, displayValue: '313.777' },
      { label: 'Bali, Nusa Tenggara, and Maluku', value: 297732, displayValue: '297.732' },
      { label: 'Kalimantan', value: 258149, displayValue: '258.149' },
      { label: 'Sumatra, Java, and Sulawesi', value: 233474, displayValue: '233.474' },
    ],
    title: '1,103,132 ha scorched across Indonesia',
    description:
      'Papua, Bali-Nusa Tenggara, Kalimantan, and Sumatra recorded massive scorched acreage, ravaging pristine carbon-sink peatland.',
  },
  {
    id: 'casualties',
    unitLabel: 'People',
    yMax: 400,
    yTicks: ['400', '300', '200', '100', '0'],
    data: [
      { label: 'Total Casualties', value: 351, displayValue: '351' },
      { label: 'Injuries', value: 347, displayValue: '347' },
      { label: 'Fatalities', value: 4, displayValue: '4' },
    ],
    title: '351 direct casualties on the fire front',
    description:
      '4 fatalities and 347 injuries recorded among courageous ground firefighters, volunteer rangers, and local villagers holding perimeters.',
  },
  {
    id: 'health',
    unitLabel: 'Cases',
    yMax: 400000,
    yTicks: ['400.000', '300.000', '200.000', '100.000', '0'],
    data: [
      { label: 'Acute Respiratory Infections (ISPA)', value: 333470, displayValue: '333.470' },
    ],
    title: '333,470 acute respiratory infection cases',
    description:
      'Dangerous PM2.5 concentrations enveloped entire cities, triggering widespread respiratory distress among infants, children, and elderly citizens.',
  },
];

const cardGlassStyle: CSSProperties = {
  backdropFilter: 'blur(22px) saturate(185%) brightness(1.04)',
  WebkitBackdropFilter: 'blur(22px) saturate(185%) brightness(1.04)',
};

const cardGlassClassName =
  'group relative overflow-hidden rounded-2xl bg-[linear-gradient(155deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.06)_42%,rgba(10,12,18,0.34)_100%)] hover:bg-[linear-gradient(155deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.09)_42%,rgba(10,12,18,0.28)_100%)] border border-white/30 hover:border-white/55 p-4 sm:p-5 lg:p-6 flex flex-col h-full transition-[border-color,box-shadow,background] duration-300 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.65),0_8px_20px_-6px_rgba(0,0,0,0.45),inset_0_1.5px_1.5px_rgba(255,255,255,0.65),inset_0_-2px_8px_rgba(0,0,0,0.35)] hover:shadow-[0_32px_65px_-12px_rgba(0,0,0,0.75),0_12px_28px_-6px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,255,255,0.85),inset_0_-2px_8px_rgba(0,0,0,0.30),0_0_28px_rgba(255,255,255,0.14)] cursor-pointer';

function CardGlassSpecularOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.06)_26%,rgba(255,255,255,0)_56%,rgba(255,255,255,0.08)_100%)]"
    />
  );
}

export default function KarhutlaDashboard({
  isActive,
  cardsProgress = 1,
  exitProgress = 0,
  localProgress = 0.25,
}: KarhutlaDashboardProps) {
  const [activeModal, setActiveModal] = useState<'burned' | 'casualties' | 'health' | null>(null);
  const [mounted, setMounted] = useState(false);
  const [manualMobileIndex, setManualMobileIndex] = useState<number | null>(null);
  const lastLocalProgRef = useRef(localProgress);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return to scroll-driven alternating cards whenever user scrolls
  useEffect(() => {
    if (Math.abs(localProgress - lastLocalProgRef.current) > 0.04) {
      setManualMobileIndex(null);
      lastLocalProgRef.current = localProgress;
    }
  }, [localProgress]);

  const scrollMobileIndex = localProgress < 0.42 ? 0 : localProgress < 0.64 ? 1 : 2;
  const activeMobileIndex = manualMobileIndex !== null ? manualMobileIndex : scrollMobileIndex;

  useEffect(() => {
    if (!activeModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveModal(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  const canKeepModal = isActive && exitProgress < 0.75;

  // Automatically dismiss modal if user scrolls out of Scene 4
  useEffect(() => {
    if (!canKeepModal && activeModal) {
      setActiveModal(null);
    }
  }, [canKeepModal, activeModal]);

  const p = isActive ? Math.max(0, Math.min(1, cardsProgress)) : 0;
  const ease = 1 - Math.pow(1 - p, 2.5);
  const enterOpacity = p <= 0.01 ? 0 : Math.min(1, p * 1.4);
  const enterTranslateY = (1 - ease) * 40;

  const ex = Math.max(0, Math.min(1, exitProgress));
  const exitOpacity = 1 - ex;
  const exitTranslateY = -ex * 35;
  const exitBlur = ex * 8;

  const opacity = isActive ? enterOpacity * exitOpacity : 0;
  const translateY = enterTranslateY + exitTranslateY;
  const cardOpacity = activeModal ? opacity * 0.65 : opacity;
  const contentBlur = activeModal ? Math.max(exitBlur, 5) : exitBlur;

  const slotTransformStyle: CSSProperties = {
    transform: `translate3d(0, ${translateY.toFixed(1)}px, 0)${activeModal ? ' scale(0.99)' : ''}`,
  };
  const cardStyle: CSSProperties = {
    ...cardGlassStyle,
    opacity: cardOpacity,
  };
  const contentBlurStyle: CSSProperties = {
    filter: contentBlur > 0.05 ? `blur(${contentBlur.toFixed(1)}px)` : 'none',
  };

  return (
    <div
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-14 lg:pt-0 flex flex-col items-center justify-center"
      style={{
        visibility: opacity > 0.01 ? 'visible' : 'hidden',
        pointerEvents: isActive && opacity > 0.05 && !activeModal ? 'auto' : 'none',
      }}
    >
      {/* ===================== DASHBOARD CONTENT (NO ANCESTOR OPACITY/FILTER SO BACKDROP-FILTER STAYS ACTIVE) ===================== */}
      <div className="w-full flex flex-col items-center justify-center">
        {/* ===================== SECTION HEADER (Matches Scene 3 BURNING THE FUTURE typography) ===================== */}
        <div
          className="text-center mb-4 sm:mb-6 lg:mb-10 max-w-4xl sm:max-w-5xl mx-auto flex flex-col items-center justify-center"
          style={{
            ...slotTransformStyle,
            ...contentBlurStyle,
            opacity: cardOpacity,
          }}
        >
          <CursorParallaxText
            shiftX={24}
            shiftY={15}
            tilt={6}
            disabled={!isActive || Boolean(activeModal)}
          >
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white animate-heat-shimmer drop-shadow-[0_0_35px_rgba(255,87,34,0.8)] leading-[1.05] text-center px-4">
              STATISTICS
            </h2>
          </CursorParallaxText>
        </div>

        {/* ===================== 3-CARD GRID (Scroll-alternating stack on mobile/tablet, 3-column grid on lg+) ===================== */}
        <div className="w-full max-w-[350px] sm:max-w-[390px] lg:max-w-none mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
          {STATISTIC_CARDS.map((card, idx) => {
            const isMobileCurrent = idx === activeMobileIndex;
            const mobilePositionClass = isMobileCurrent
              ? 'opacity-100 translate-y-0 scale-100 z-20 pointer-events-auto'
              : idx < activeMobileIndex
                ? 'opacity-0 -translate-y-5 scale-95 z-10 pointer-events-none'
                : 'opacity-0 translate-y-5 scale-95 z-10 pointer-events-none';

            return (
              <div
                key={card.id}
                style={slotTransformStyle}
                className={`col-start-1 row-start-1 lg:col-auto lg:row-auto h-full transition-all duration-500 ease-out lg:opacity-100 lg:translate-y-0 lg:scale-100 lg:pointer-events-auto lg:z-auto lg:transition-none ${mobilePositionClass}`}
              >
                <CursorTiltCard
                  onClick={() => setActiveModal(card.id)}
                  style={cardStyle}
                  className={cardGlassClassName}
                  maxTilt={8}
                  maxShift={6}
                  hoverScale={1.025}
                  disabled={!isActive || Boolean(activeModal)}
                >
                  <CardGlassSpecularOverlay />
                  <div style={contentBlurStyle} className="relative z-10 flex flex-col flex-grow">
                    {/* Top Visual Box (Monochrome Bar Chart) */}
                    <MonochromeBarChart
                      unitLabel={card.unitLabel}
                      yMax={card.yMax}
                      yTicks={card.yTicks}
                      data={card.data}
                    />

                    {/* Card Meta Content */}
                    <div className="flex flex-col flex-grow">
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] group-hover:text-white transition-colors duration-200">
                        {card.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-white/80 group-hover:text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)] transition-colors duration-200 font-normal leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </CursorTiltCard>
              </div>
            );
          })}
        </div>

        {/* Mobile / Tablet Alternating Indicator Dots + Tap Hint */}
        <div
          className="mt-4 lg:hidden flex flex-col items-center gap-2"
          style={{ opacity: cardOpacity }}
        >
          <div className="flex items-center gap-2">
            {STATISTIC_CARDS.map((card, idx) => {
              const isCurrent = idx === activeMobileIndex;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setManualMobileIndex(idx)}
                  aria-label={`Show statistic card ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isCurrent ? 'w-6 bg-white' : 'w-1.5 bg-white/35 hover:bg-white/60'
                  }`}
                />
              );
            })}
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
