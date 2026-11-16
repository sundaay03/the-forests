'use client';

interface PortalTransitionProps {
  /**
   * Black Fade + 4 Sequential Dots transition progress (0.0 -> 1.0):
   * - 0.00 -> 0.22: Scene 7 fades smoothly to solid black
   * - 0.22 -> 0.74: Full black screen with 4 centered dots appearing sequentially
   * - 0.74 -> 1.00: Dots & black screen fade out cleanly as Scene 8 fades in
   */
  progress: number;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

// Appearance windows [start, end] for the 4 sequential dots while the screen is black
const DOT_WINDOWS: readonly [number, number][] = [
  [0.22, 0.32],
  [0.34, 0.44],
  [0.46, 0.56],
  [0.58, 0.68],
];

export default function PortalTransition({ progress }: PortalTransitionProps) {
  const p = clamp01(progress);
  if (p <= 0.001 || p >= 0.999) return null;

  // Fade to full black (0.00 -> 0.22), hold full black (0.22 -> 0.74), fade out (0.74 -> 1.00)
  const blackFadeIn = smoothstep(0.0, 0.22, p);
  const blackFadeOut = 1 - smoothstep(0.74, 1.0, p);
  const blackOpacity = blackFadeIn * blackFadeOut;

  // Dots fade out smoothly as the black screen starts revealing Scene 8
  const dotsGroupFadeOut = 1 - smoothstep(0.7, 0.84, p);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-30 flex items-center justify-center bg-black pointer-events-none select-none"
      style={{ opacity: blackOpacity }}
    >
      <div
        className="flex items-center justify-center gap-4 sm:gap-5"
        style={{ opacity: dotsGroupFadeOut }}
      >
        {DOT_WINDOWS.map(([start, end], idx) => {
          const dotProg = smoothstep(start, end, p);
          const scale = 0.35 + dotProg * 0.65;
          return (
            <span
              key={idx}
              className="block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.65)]"
              style={{
                opacity: dotProg,
                transform: `scale(${scale.toFixed(3)})`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
