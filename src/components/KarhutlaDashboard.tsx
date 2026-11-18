'use client';

import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import CursorTiltCard from './CursorTiltCard';
import CursorParallaxText from './CursorParallaxText';
import type { Language } from '@/lib/i18n';

interface RegionalFireEntry {
  rank: number;
  region: string;
  area: string;
  percent: string;
}

const REGIONAL_FIRES_BY_LANG: Record<Language, RegionalFireEntry[]> = {
  en: [
    { rank: 1, region: 'Papua', area: '313,777 ha', percent: '28.4%' },
    { rank: 2, region: 'Bali, Nusa Tenggara, and Maluku', area: '297,732 ha', percent: '27.0%' },
    { rank: 3, region: 'Kalimantan', area: '258,149 ha', percent: '23.4%' },
    { rank: 4, region: 'Sumatra, Java, and Sulawesi', area: '233,474 ha', percent: '21.2%' },
  ],
  id: [
    { rank: 1, region: 'Papua', area: '313.777 ha', percent: '28,4%' },
    { rank: 2, region: 'Bali, Nusa Tenggara, dan Maluku', area: '297.732 ha', percent: '27,0%' },
    { rank: 3, region: 'Kalimantan', area: '258.149 ha', percent: '23,4%' },
    { rank: 4, region: 'Sumatra, Jawa, dan Sulawesi', area: '233.474 ha', percent: '21,2%' },
  ],
};

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
    <div className="relative z-10 w-full h-[clamp(108px,19dvh,208px)] rounded-xl overflow-hidden mb-[clamp(0.6rem,1.6dvh,1.25rem)] border border-white/20 group-hover:border-white/40 bg-black/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),inset_0_-3px_10px_rgba(0,0,0,0.55),0_8px_20px_-6px_rgba(0,0,0,0.55)] p-2.5 sm:p-3 lg:p-3.5 flex flex-col transition-all duration-300 select-none">
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
  lang?: Language;
}

interface StatisticCardConfig {
  id: 'burned' | 'casualties' | 'health';
  unitLabel: string;
  yMax: number;
  yTicks: string[];
  data: BarDatum[];
  title: string;
  description: string;
  source: string;
}

const STATISTIC_CARDS_BY_LANG: Record<Language, StatisticCardConfig[]> = {
  en: [
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
      source: 'MapBiomas Fire Indonesia',
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
      source: 'Databoks and CNBC Indonesia',
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
      source: 'BNPB and Kemenkes',
    },
  ],
  id: [
    {
      id: 'burned',
      unitLabel: 'Luas (ha)',
      yMax: 400000,
      yTicks: ['400.000', '300.000', '200.000', '100.000', '0'],
      data: [
        { label: 'Papua', value: 313777, displayValue: '313.777' },
        { label: 'Bali, Nusa Tenggara, dan Maluku', value: 297732, displayValue: '297.732' },
        { label: 'Kalimantan', value: 258149, displayValue: '258.149' },
        { label: 'Sumatra, Jawa, dan Sulawesi', value: 233474, displayValue: '233.474' },
      ],
      title: '1.103.132 ha lahan terbakar di Indonesia',
      description:
        'Papua, Bali-Nusa Tenggara, Kalimantan, dan Sumatra mencatat kebakaran lahan masif yang merusak lahan gambut penyerap karbon.',
      source: 'MapBiomas Fire Indonesia',
    },
    {
      id: 'casualties',
      unitLabel: 'Jiwa',
      yMax: 400,
      yTicks: ['400', '300', '200', '100', '0'],
      data: [
        { label: 'Total Korban', value: 351, displayValue: '351' },
        { label: 'Luka-luka', value: 347, displayValue: '347' },
        { label: 'Meninggal', value: 4, displayValue: '4' },
      ],
      title: '351 korban langsung di garis api',
      description:
        'Tercatat 4 korban jiwa dan 347 luka-luka di antara petugas pemadam, relawan penjaga hutan, dan warga sekitar.',
      source: 'Databoks dan CNBC Indonesia',
    },
    {
      id: 'health',
      unitLabel: 'Kasus',
      yMax: 400000,
      yTicks: ['400.000', '300.000', '200.000', '100.000', '0'],
      data: [
        { label: 'Infeksi Saluran Pernapasan Akut (ISPA)', value: 333470, displayValue: '333.470' },
      ],
      title: '333.470 kasus infeksi pernapasan akut',
      description:
        'Konsentrasi PM2.5 berbahaya menyelimuti berbagai kota, memicu gangguan pernapasan luas pada bayi, anak-anak, hingga lansia.',
      source: 'BNPB dan Kemenkes',
    },
  ],
};

const cardGlassStyle: CSSProperties = {
  backdropFilter: 'blur(22px) saturate(185%) brightness(1.04)',
  WebkitBackdropFilter: 'blur(22px) saturate(185%) brightness(1.04)',
};

const cardGlassClassName =
  'group relative overflow-hidden rounded-2xl bg-[linear-gradient(155deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.06)_42%,rgba(10,12,18,0.34)_100%)] hover:bg-[linear-gradient(155deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.09)_42%,rgba(10,12,18,0.28)_100%)] border border-white/30 hover:border-white/55 p-4 sm:p-[clamp(0.9rem,2dvh,1.5rem)] flex flex-col h-full transition-[border-color,box-shadow,background] duration-300 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.65),0_8px_20px_-6px_rgba(0,0,0,0.45),inset_0_1.5px_1.5px_rgba(255,255,255,0.65),inset_0_-2px_8px_rgba(0,0,0,0.35)] hover:shadow-[0_32px_65px_-12px_rgba(0,0,0,0.75),0_12px_28px_-6px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,255,255,0.85),inset_0_-2px_8px_rgba(0,0,0,0.30),0_0_28px_rgba(255,255,255,0.14)] cursor-pointer';

function CardGlassSpecularOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.06)_26%,rgba(255,255,255,0)_56%,rgba(255,255,255,0.08)_100%)]"
    />
  );
}

function computeWindowMotion(
  prog: number,
  enterStart: number,
  enterEnd: number,
  exitStart: number,
  exitEnd: number
) {
  const enterRaw = Math.max(0, Math.min(1, (prog - enterStart) / (enterEnd - enterStart)));
  const enterEase = 1 - Math.pow(1 - enterRaw, 2.4);
  const exitRaw =
    prog > exitStart
      ? Math.max(0, Math.min(1, (prog - exitStart) / (exitEnd - exitStart)))
      : 0;
  const exitEase = exitRaw * exitRaw;

  return {
    opacity: enterEase * (1 - exitEase),
    translateY: (1 - enterEase) * 34 - exitEase * 30,
    blur: exitEase * 7,
  };
}

const DESKTOP_CARD_WINDOWS: readonly {
  enterStart: number;
  enterEnd: number;
  exitStart: number;
  exitEnd: number;
}[] = [
  { enterStart: 0.04, enterEnd: 0.16, exitStart: 0.66, exitEnd: 0.77 },
  { enterStart: 0.16, enterEnd: 0.28, exitStart: 0.76, exitEnd: 0.87 },
  { enterStart: 0.28, enterEnd: 0.40, exitStart: 0.86, exitEnd: 0.97 },
];

export default function KarhutlaDashboard({
  isActive,
  cardsProgress = 1,
  exitProgress = 0,
  localProgress = 0.43,
  lang = 'en',
}: KarhutlaDashboardProps) {
  const statisticCards = STATISTIC_CARDS_BY_LANG[lang];
  const regionalFires = REGIONAL_FIRES_BY_LANG[lang];
  const sourceLabel = lang === 'id' ? 'Sumber' : 'Source';
  const [activeModal, setActiveModal] = useState<'burned' | 'casualties' | 'health' | null>(null);
  const [mounted, setMounted] = useState(false);
  const [manualMobileIndex, setManualMobileIndex] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const lastLocalProgRef = useRef(localProgress);

  useEffect(() => {
    setMounted(true);
    const updateViewport = () => setIsDesktop(window.innerWidth >= 1024);
    updateViewport();
    window.addEventListener('resize', updateViewport, { passive: true });
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Return to scroll-driven alternating cards whenever user scrolls
  useEffect(() => {
    if (Math.abs(localProgress - lastLocalProgRef.current) > 0.04) {
      setManualMobileIndex(null);
      lastLocalProgRef.current = localProgress;
    }
  }, [localProgress]);

  const scrollMobileIndex = localProgress < 0.52 ? 0 : localProgress < 0.69 ? 1 : 2;
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

  // Desktop staggered header motion (enters early 0.00 -> 0.14, exits last 0.86 -> 0.99)
  const desktopHeader = isActive
    ? computeWindowMotion(localProgress, 0.0, 0.14, 0.86, 0.99)
    : { opacity: 0, translateY: 34, blur: 0 };

  const headerOpacity = isDesktop
    ? activeModal
      ? desktopHeader.opacity * 0.65
      : desktopHeader.opacity
    : cardOpacity;
  const headerTranslateY = isDesktop ? desktopHeader.translateY : translateY;
  const headerBlur = isDesktop
    ? activeModal
      ? Math.max(desktopHeader.blur, 5)
      : desktopHeader.blur
    : contentBlur;

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
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-12 lg:pt-6 pb-6 lg:pb-12 flex flex-col items-center justify-center"
      style={{
        visibility: isActive && (opacity > 0.01 || desktopHeader.opacity > 0.01) ? 'visible' : 'hidden',
        pointerEvents: isActive && opacity > 0.05 && !activeModal ? 'auto' : 'none',
      }}
    >
      {/* ===================== DASHBOARD CONTENT (NO ANCESTOR OPACITY/FILTER SO BACKDROP-FILTER STAYS ACTIVE) ===================== */}
      <div className="w-full flex flex-col items-center justify-center">
        {/* ===================== SECTION HEADER (Positioned higher toward marked zone) ===================== */}
        <div
          className="text-center mb-6 sm:mb-8 lg:mb-[clamp(1.75rem,5.5dvh,3.75rem)] max-w-4xl sm:max-w-5xl mx-auto flex flex-col items-center justify-center"
          style={{
            transform: `translate3d(0, ${headerTranslateY.toFixed(1)}px, 0)${activeModal ? ' scale(0.99)' : ''}`,
            filter: headerBlur > 0.05 ? `blur(${headerBlur.toFixed(1)}px)` : 'none',
            opacity: headerOpacity,
          }}
        >
          <CursorParallaxText
            shiftX={24}
            shiftY={15}
            tilt={6}
            disabled={!isActive || Boolean(activeModal)}
          >
            <h2 className="text-[clamp(1.45rem,min(4.6vw,5.8dvh),3.75rem)] font-black uppercase tracking-tight text-white animate-heat-shimmer drop-shadow-[0_0_35px_rgba(255,87,34,0.8)] leading-[1.05] text-center px-4">
              {lang === 'id' ? 'STATISTIK' : 'STATISTICS'}
            </h2>
          </CursorParallaxText>
        </div>

        {/* ===================== 3-CARD GRID (Staggered in-place on desktop lg+, alternating stack on mobile) ===================== */}
        <div className="w-full max-w-[350px] sm:max-w-[390px] lg:max-w-none mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
          {statisticCards.map((card, idx) => {
            const win = DESKTOP_CARD_WINDOWS[idx];
            const desktopMotion = isActive
              ? computeWindowMotion(
                  localProgress,
                  win.enterStart,
                  win.enterEnd,
                  win.exitStart,
                  win.exitEnd
                )
              : { opacity: 0, translateY: 34, blur: 0 };

            const perCardOpacity = isDesktop
              ? activeModal
                ? desktopMotion.opacity * 0.65
                : desktopMotion.opacity
              : cardOpacity;
            const perCardTransform: CSSProperties = isDesktop
              ? {
                  transform: `translate3d(0, ${desktopMotion.translateY.toFixed(1)}px, 0)${
                    activeModal ? ' scale(0.99)' : ''
                  }`,
                }
              : slotTransformStyle;
            const perCardBlurVal = isDesktop
              ? activeModal
                ? Math.max(desktopMotion.blur, 5)
                : desktopMotion.blur
              : contentBlur;
            const perCardBlurStyle: CSSProperties = {
              filter: perCardBlurVal > 0.05 ? `blur(${perCardBlurVal.toFixed(1)}px)` : 'none',
            };
            const perCardStyle: CSSProperties = {
              ...cardGlassStyle,
              opacity: perCardOpacity,
            };

            const isMobileCurrent = idx === activeMobileIndex;
            const mobilePositionClass = isMobileCurrent
              ? 'opacity-100 translate-y-0 scale-100 z-20 pointer-events-auto'
              : idx < activeMobileIndex
                ? 'opacity-0 -translate-y-5 scale-95 z-10 pointer-events-none'
                : 'opacity-0 translate-y-5 scale-95 z-10 pointer-events-none';

            const desktopPointerClass =
              isDesktop && desktopMotion.opacity > 0.15 && !activeModal
                ? 'lg:pointer-events-auto'
                : 'lg:pointer-events-none';

            return (
              <div
                key={card.id}
                style={perCardTransform}
                className={`col-start-1 row-start-1 lg:col-auto lg:row-auto h-full transition-all duration-500 ease-out lg:opacity-100 lg:translate-y-0 lg:scale-100 lg:z-auto lg:transition-none ${mobilePositionClass} ${desktopPointerClass}`}
              >
                <CursorTiltCard
                  onClick={() => setActiveModal(card.id)}
                  style={perCardStyle}
                  className={cardGlassClassName}
                  maxTilt={8}
                  maxShift={6}
                  hoverScale={1.025}
                  disabled={
                    !isActive ||
                    Boolean(activeModal) ||
                    (isDesktop ? desktopMotion.opacity < 0.2 : !isMobileCurrent)
                  }
                >
                  <CardGlassSpecularOverlay />
                  <div style={perCardBlurStyle} className="relative z-10 flex flex-col flex-grow">
                    {/* Top Visual Box (Monochrome Bar Chart) */}
                    <MonochromeBarChart
                      unitLabel={card.unitLabel}
                      yMax={card.yMax}
                      yTicks={card.yTicks}
                      data={card.data}
                    />

                    {/* Card Meta Content */}
                    <div className="flex flex-col flex-grow">
                      <h3 className="text-[clamp(0.95rem,min(1.4vw,2.3dvh),1.25rem)] font-bold text-white tracking-tight leading-snug mb-1.5 sm:mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] group-hover:text-white transition-colors duration-200">
                        {card.title}
                      </h3>

                      <p className="text-[clamp(0.72rem,min(1.05vw,1.7dvh),0.875rem)] text-white/80 group-hover:text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)] transition-colors duration-200 font-normal leading-relaxed">
                        {card.description}
                      </p>

                      <p className="mt-auto pt-2.5 sm:pt-3 border-t border-white/10 text-[clamp(0.62rem,min(0.88vw,1.35dvh),0.75rem)] font-mono tracking-wide text-white/55 group-hover:text-white/75 transition-colors duration-200">
                        {sourceLabel}: {card.source}
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
            {statisticCards.map((card, idx) => {
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
              aria-label={lang === 'id' ? 'Tutup modal' : 'Close modal'}
            >
              ✕
            </button>

            {/* TAB 1: BURNED LAND AREA */}
            {activeModal === 'burned' && (
              <div>
                <h3 className="text-2xl font-black text-white mb-1">
                  {lang === 'id' ? '1.103.132 ha Lahan Terbakar' : '1,103,132 ha Scorched'}
                </h3>
                <p className="text-xs text-neutral-400 mb-5">
                  {lang === 'id'
                    ? 'Rincian sebaran luas hutan dan lahan terbakar di berbagai wilayah Indonesia.'
                    : 'Detailed distribution of burned forest and land area across Indonesian regions.'}
                </p>

                <div className="divide-y divide-white/10 border-y border-white/10 mb-5">
                  {regionalFires.map((entry) => (
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
                  <span className="text-neutral-400 uppercase tracking-widest text-xs">
                    {lang === 'id' ? 'Total Nasional' : 'National Total'}
                  </span>
                  <span className="text-xl font-black text-white tabular-nums">
                    {lang === 'id' ? '1.103.132 ha' : '1,103,132 ha'}
                  </span>
                </div>
                <p className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-neutral-400">
                  {sourceLabel}: {statisticCards[0].source}
                </p>
              </div>
            )}

            {/* TAB 2: CASUALTIES */}
            {activeModal === 'casualties' && (
              <div>
                <h3 className="text-2xl font-black text-white mb-1">
                  {lang === 'id' ? '351 Korban di Garis Depan' : '351 Frontline Casualties'}
                </h3>
                <p className="text-xs text-neutral-400 mb-5">
                  {lang === 'id'
                    ? 'Petugas pemadam dan relawan yang berhadapan langsung dengan kobaran api ekstrem.'
                    : 'Brave personnel and volunteers exposed to extreme fire fronts.'}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-black/40 hover:bg-black/75 border border-white/15 hover:border-white/30 transition-all duration-200">
                    <div className="text-3xl font-black text-red-400 tabular-nums">4</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-red-200 mt-1">
                      {lang === 'id' ? 'Meninggal' : 'Deaths'}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-2">
                      {lang === 'id'
                        ? 'Terjebak kepungan api di perimeter berisiko saat arah angin berubah mendadak.'
                        : 'Fatal entrapments on volatile perimeters during sudden wind shifts.'}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 hover:bg-black/75 border border-white/15 hover:border-white/30 transition-all duration-200">
                    <div className="text-3xl font-black text-white tabular-nums">347</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-200 mt-1">
                      {lang === 'id' ? 'Luka-luka' : 'Injuries'}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-2">
                      {lang === 'id'
                        ? 'Luka bakar, menghirup asap pekat, kelelahan panas, dan cedera lapangan.'
                        : 'Severe burns, smoke inhalation, heat exhaustion, and blunt trauma.'}
                    </p>
                  </div>
                </div>
                <p className="mt-5 pt-3 border-t border-white/10 text-[11px] font-mono text-neutral-400">
                  {sourceLabel}: {statisticCards[1].source}
                </p>
              </div>
            )}

            {/* TAB 3: HEALTH CRISIS */}
            {activeModal === 'health' && (
              <div>
                <h3 className="text-2xl font-black text-white mb-1">
                  {lang === 'id' ? '333.470 Kasus ISPA' : '333,470 ARI Cases'}
                </h3>
                <p className="text-xs text-neutral-400 mb-5">
                  {lang === 'id'
                    ? 'Infeksi Saluran Pernapasan Akut akibat partikel asap beracun (PM2.5).'
                    : 'Acute Respiratory Infections triggered by toxic smoke particulates (PM2.5).'}
                </p>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-black/40 hover:bg-black/75 border border-white/15 hover:border-white/30 transition-all duration-200">
                    <div className="text-sm font-bold text-neutral-200">
                      {lang === 'id'
                        ? 'Infeksi Saluran Pernapasan Akut (ISPA)'
                        : 'Acute Respiratory Infections (ISPA)'}
                    </div>
                    <div className="text-2xl font-black text-white mt-0.5 tabular-nums">
                      {lang === 'id' ? '333.470 kasus' : '333,470 cases'}
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      {lang === 'id'
                        ? 'Paparan jelaga, karbon monoksida, dan zat iritan kimia secara terus-menerus.'
                        : 'Continuous inhalation of soot, carbon monoxide, and chemical irritants.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 hover:bg-black/75 border border-white/15 hover:border-white/30 transition-all duration-200">
                    <ul className="text-xs text-neutral-300 list-disc list-inside space-y-1.5">
                      {lang === 'id' ? (
                        <>
                          <li>Bayi dan balita dengan sistem pernapasan yang masih berkembang</li>
                          <li>Lansia dengan riwayat penyakit kardiovaskular</li>
                          <li>Penderita asma, PPOK, dan bronkitis</li>
                        </>
                      ) : (
                        <>
                          <li>Infants and toddlers with developing pulmonary systems</li>
                          <li>Elderly individuals with existing cardiovascular conditions</li>
                          <li>Asthma, COPD, and bronchitis sufferers</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
                <p className="mt-5 pt-3 border-t border-white/10 text-[11px] font-mono text-neutral-400">
                  {sourceLabel}: {statisticCards[2].source}
                </p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
