'use client';

import { useState } from 'react';

export interface HealthImpactItem {
  id: number;
  title: string;
  desc: string;
}

export const HEALTH_IMPACTS_DATA: HealthImpactItem[] = [
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
];

interface HealthImpactsProps {
  s6Prog: number; // 0.0 to 1.0 (local progress within Scene 6)
}

export default function HealthImpacts({ s6Prog }: HealthImpactsProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Divide the active viewing range (0.00 to 0.70) into 2 groups of 3 items:
  // Group 0: Items 1, 2, 3 (0.00 - 0.35)
  // Group 1: Items 4, 5, 6 (0.35 - 0.70)
  const scrollGroup = s6Prog >= 0.35 ? 1 : 0;

  const currentGroupItems = HEALTH_IMPACTS_DATA.slice(
    scrollGroup * 3,
    scrollGroup * 3 + 3
  );

  return (
    <div className="w-full max-w-[360px] sm:max-w-[460px] md:max-w-[560px] lg:max-w-[620px] flex flex-col pointer-events-auto mt-2 sm:mt-3">
      {/* 3 Pure White Text Subtitles per group (no black boxes, no badges, no icons) */}
      <div
        key={scrollGroup}
        className="flex flex-col gap-4 sm:gap-5 transition-all duration-500 animate-fadeIn"
      >
        {currentGroupItems.map((item) => {
          const isHovered = hoveredId === item.id;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setHoveredId((prev) => (prev === item.id ? null : item.id))}
              className="group flex flex-col cursor-pointer select-none text-left transition-all duration-300"
            >
              {/* Pure White Enlarged Title */}
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] transition-all duration-300 group-hover:text-white group-hover:translate-x-1.5">
                {item.title}
              </h3>

              {/* Description (Hidden by default, reveals smoothly on hover in enlarged pure white text) */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  isHovered
                    ? 'max-h-48 opacity-100 mt-2'
                    : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                }`}
              >
                <p className="text-sm sm:text-base md:text-lg font-light text-white/95 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] max-w-lg">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
