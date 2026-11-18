'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import CursorTiltCard from './CursorTiltCard';
import type { Language } from '@/lib/i18n';

export interface HealthImpactItem {
  id: number;
  title: string;
  desc: string;
}

const HEALTH_IMPACTS_BY_LANG: Record<Language, HealthImpactItem[]> = {
  en: [
    {
      id: 1,
      title: 'Acute Respiratory Infections',
      desc: 'The most dominant illness caused by weakened lung immunity due to continuous inhalation of irritants in smoke.',
    },
    {
      id: 2,
      title: 'Chronic Lung Disease',
      desc: 'Smog triggers severe flare-ups and worsens the condition of asthma sufferers.',
    },
    {
      id: 3,
      title: 'Pneumonia',
      desc: 'A more serious lung infection that poses a high risk to vulnerable groups such as infants, toddlers, and the elderly.',
    },
    {
      id: 4,
      title: 'Irritation',
      desc: 'Irritation of the eyes, nose, throat, and skin.',
    },
    {
      id: 5,
      title: 'Heart and Cardiovascular Disorders',
      desc: 'Poor air quality forces the heart to work harder, increasing the risk of coronary heart attacks, arrhythmia, and stroke.',
    },
    {
      id: 6,
      title: 'Digestive System Disorders',
      desc: 'Settling smoke pollutants can contaminate drinking water and food sources, triggering illnesses like diarrhea.',
    },
  ],
  id: [
    {
      id: 1,
      title: 'Infeksi Saluran Pernapasan Akut (ISPA)',
      desc: 'Penyakit paling dominan akibat melemahnya daya tahan paru-paru karena menghirup zat iritan dalam asap secara terus-menerus.',
    },
    {
      id: 2,
      title: 'Penyakit Paru-paru Kronis',
      desc: 'Asap pekat memicu kekambuhan parah dan memperburuk kondisi penderita asma.',
    },
    {
      id: 3,
      title: 'Pneumonia',
      desc: 'Infeksi paru-paru lebih serius yang sangat berisiko bagi kelompok rentan seperti bayi, balita, dan lansia.',
    },
    {
      id: 4,
      title: 'Iritasi',
      desc: 'Iritasi pada mata, hidung, tenggorokan, dan kulit.',
    },
    {
      id: 5,
      title: 'Gangguan Jantung dan Kardiovaskular',
      desc: 'Kualitas udara yang buruk memaksa jantung bekerja lebih keras, meningkatkan risiko serangan jantung koroner, aritmia, hingga stroke.',
    },
    {
      id: 6,
      title: 'Gangguan Sistem Pencernaan',
      desc: 'Polutan asap yang mengendap dapat mencemari sumber air minum dan makanan, memicu penyakit seperti diare.',
    },
  ],
};

export const HEALTH_IMPACTS_DATA: HealthImpactItem[] = HEALTH_IMPACTS_BY_LANG.en;

const cardGlassStyle: CSSProperties = {
  backdropFilter: 'blur(22px) saturate(185%) brightness(1.04)',
  WebkitBackdropFilter: 'blur(22px) saturate(185%) brightness(1.04)',
};

const cardGlassClassName =
  'group relative overflow-hidden w-full rounded-3xl px-6 py-6 sm:px-8 sm:py-7 bg-[linear-gradient(155deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.06)_42%,rgba(10,12,18,0.44)_100%)] hover:bg-[linear-gradient(155deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.09)_42%,rgba(10,12,18,0.36)_100%)] border border-white/30 hover:border-white/55 flex flex-col items-center text-center shadow-[0_24px_50px_-12px_rgba(0,0,0,0.65),0_8px_20px_-6px_rgba(0,0,0,0.45),inset_0_1.5px_1.5px_rgba(255,255,255,0.65),inset_0_-2px_8px_rgba(0,0,0,0.35)] hover:shadow-[0_32px_65px_-12px_rgba(0,0,0,0.75),0_12px_28px_-6px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,255,255,0.85),inset_0_-2px_8px_rgba(0,0,0,0.30),0_0_28px_rgba(255,255,255,0.14)]';

interface HealthImpactsProps {
  s6Prog: number; // 0.0 to 1.0 (local progress within Scene 6)
  isInteractive?: boolean;
  isActive?: boolean;
  lang?: Language;
}

export default function HealthImpacts({
  s6Prog,
  isInteractive = true,
  isActive = true,
  lang = 'en',
}: HealthImpactsProps) {
  const [hasEntered, setHasEntered] = useState(false);
  const items = HEALTH_IMPACTS_BY_LANG[lang];

  // Trigger upward fade-in entrance whenever Scene 6 becomes active
  useEffect(() => {
    if (!isActive) {
      setHasEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => {
      setHasEntered(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [isActive]);

  // Map active viewing range (0.00 to 0.70) sequentially across all 6 cards one by one
  const scrollRatio = Math.max(0, Math.min(0.9999, s6Prog / 0.70));
  const activeIndex = Math.min(
    HEALTH_IMPACTS_DATA.length - 1,
    Math.floor(scrollRatio * HEALTH_IMPACTS_DATA.length)
  );

  return (
    <div
      className={`w-full max-w-xl mx-auto flex flex-col items-center justify-center ${
        isInteractive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Centered Single-Slot Card Stage (3D glass cards rising & fading in from below) */}
      <div className="relative w-full grid grid-cols-1 items-center">
        {items.map((item, idx) => {
          const isCurrent = hasEntered && idx === activeIndex;
          const isPast = hasEntered && idx < activeIndex;

          const slotClass = isCurrent
            ? 'translate-y-0 scale-100 z-20 pointer-events-auto duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]'
            : isPast
              ? 'translate-y-6 scale-[0.94] z-10 pointer-events-none duration-500 ease-out'
              : 'translate-y-28 scale-[0.97] z-20 pointer-events-none duration-500 ease-out';

          return (
            <div
              key={item.id}
              aria-hidden={!isCurrent}
              className={`col-start-1 row-start-1 w-full transition-transform will-change-transform ${slotClass}`}
            >
              <CursorTiltCard
                maxTilt={10}
                maxShift={8}
                hoverScale={1.03}
                perspective={1000}
                spotlightColor="rgba(255, 255, 255, 0.2)"
                disabled={!isInteractive || !isCurrent}
                style={{
                  ...cardGlassStyle,
                  opacity: isCurrent ? 1 : 0,
                  transition:
                    'opacity 550ms ease-out, border-color 300ms ease, box-shadow 300ms ease, background 300ms ease',
                }}
                className={cardGlassClassName}
              >
                {/* Specular 3D Glass Top-Edge Curved Highlight */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(180deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.06)_26%,rgba(255,255,255,0)_56%,rgba(255,255,255,0.08)_100%)]"
                />

                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Title */}
                  <h3 className="text-[clamp(1.05rem,min(2.1vw,2.9dvh),1.6rem)] font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] leading-snug">
                    {item.title}
                  </h3>

                  {/* Always-Visible Description */}
                  <p className="mt-2 sm:mt-2.5 text-[clamp(0.8rem,min(1.25vw,2dvh),1.02rem)] font-normal text-white/85 group-hover:text-white/95 leading-relaxed max-w-md drop-shadow-[0_1px_6px_rgba(0,0,0,0.75)] transition-colors duration-200">
                    {item.desc}
                  </p>
                </div>
              </CursorTiltCard>
            </div>
          );
        })}
      </div>

      {/* Centered 6-Step Non-Interactive Progress Indicator */}
      <div
        aria-hidden="true"
        className="relative z-30 mt-7 sm:mt-8 flex items-center justify-center gap-2 pointer-events-none select-none"
      >
        {HEALTH_IMPACTS_DATA.map((item, idx) => {
          const isCurrent = idx === activeIndex;
          return (
            <span
              key={item.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isCurrent ? 'w-7 bg-white shadow-[0_0_10px_rgba(255,255,255,0.65)]' : 'w-1.5 bg-white/35'
              }`}
            />
          );
        })}
      </div>

      {/* Data Source Attribution */}
      <p
        className={`relative z-30 mt-3 sm:mt-3.5 text-[clamp(0.66rem,min(0.95vw,1.5dvh),0.8rem)] font-mono tracking-wide text-white/60 text-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)] pointer-events-none select-none transition-opacity duration-500 ${
          hasEntered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {lang === 'id' ? 'Sumber: Ucare Indonesia' : 'Source: Ucare Indonesia'}
      </p>
    </div>
  );
}
