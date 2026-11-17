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
  isInteractive?: boolean;
}

export default function HealthImpacts({
  s6Prog,
  isInteractive = true,
}: HealthImpactsProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Divide the active viewing range (0.00 to 0.70) into 2 groups of 3 items:
  // Group 0: Items 1, 2, 3 (0.00 - 0.35)
  // Group 1: Items 4, 5, 6 (0.35 - 0.70)
  const scrollGroup = s6Prog >= 0.35 ? 1 : 0;

  const currentGroupItems = HEALTH_IMPACTS_DATA.slice(
    scrollGroup * 3,
    scrollGroup * 3 + 3
  );

  const toggleItem = (id: number) => {
    if (!isInteractive) return;
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className={`w-full max-w-[calc(100vw-2.5rem)] sm:max-w-[460px] md:max-w-[560px] lg:max-w-[620px] flex flex-col mt-1.5 sm:mt-3 ${
        isInteractive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* 3 Pure White Text Subtitles per group (no black boxes, no badges, no icons) */}
      <div
        key={scrollGroup}
        className="flex flex-col gap-3 sm:gap-5 transition-all duration-500 animate-fadeIn"
      >
        {currentGroupItems.map((item) => {
          const isOpen = isInteractive && (hoveredId === item.id || selectedId === item.id);

          return (
            <div
              key={item.id}
              onMouseEnter={() => {
                if (isInteractive) setHoveredId(item.id);
              }}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => toggleItem(item.id)}
              className={`group flex flex-col select-none text-left transition-all duration-300 ${
                isInteractive ? 'cursor-pointer' : 'cursor-default pointer-events-none'
              }`}
            >
              {/* Pure White Enlarged Title with Bullet Point */}
              <h3 className="flex items-start sm:items-center gap-2.5 sm:gap-4 text-[clamp(0.95rem,min(2.1vw,2.9dvh),1.875rem)] font-extrabold tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] transition-all duration-300 group-hover:text-white group-hover:translate-x-1.5">
                <span className={`mt-2 sm:mt-0 w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-white flex-shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-all duration-300 ${
                  isOpen ? 'scale-125' : 'group-hover:scale-125'
                }`} />
                <span>{item.title}</span>
              </h3>

              {/* Description (reveals smoothly on hover or click in enlarged pure white text) */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-out pl-4 sm:pl-6.5 ${
                  isOpen
                    ? `max-h-48 opacity-100 mt-1.5 sm:mt-2 ${isInteractive ? 'pointer-events-auto' : 'pointer-events-none'}`
                    : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                }`}
              >
                <p className="text-[clamp(0.75rem,min(1.4vw,2.1dvh),1.125rem)] font-light text-white/95 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] max-w-lg">
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
