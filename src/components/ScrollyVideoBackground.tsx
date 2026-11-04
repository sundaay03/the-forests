'use client';

import { useEffect, useRef } from 'react';

interface ScrollyVideoBackgroundProps {
  activeChapter: number;
  scrollProgress: number; // 0.0 to 1.0
}

interface SceneMeta {
  id: number;
  src: string;
  duration: number;
  startProg: number;
  playEndProg: number;
  endProg: number;
  isRealtime?: boolean;
  isImage?: boolean;
}

const SCENE_DATA: SceneMeta[] = [
  { id: 1, src: '/scene/scene1/1.mp4', duration: 10.03, startProg: 0.0,   playEndProg: 0.135, endProg: 0.167 },
  { id: 2, src: '/scene/scene2/2.mp4', duration: 10.03, startProg: 0.167, playEndProg: 0.300, endProg: 0.333 },
  { id: 3, src: '/scene/scene3/3.mp4', duration: 7.01,  startProg: 0.333, playEndProg: 0.465, endProg: 0.500, isRealtime: true },
  { id: 4, src: '/scene/scene4/4.mp4', duration: 10.03, startProg: 0.500, playEndProg: 0.635, endProg: 0.667 },
  { id: 5, src: '/scene/scene5/5.mp4', duration: 9.75,  startProg: 0.667, playEndProg: 0.800, endProg: 0.833 },
  { id: 6, src: '/scene/scene6/6.png', duration: 0,     startProg: 0.833, playEndProg: 0.970, endProg: 1.000, isImage: true },
];

export default function ScrollyVideoBackground({
  activeChapter,
  scrollProgress,
}: ScrollyVideoBackgroundProps) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const scrollProgRef = useRef(scrollProgress);
  scrollProgRef.current = scrollProgress;

  // 1. Dedicated Realtime Playback Controller for Scene 3 (THE INFERNO)
  // Ensures Video 3 plays continuously at normal speed, looping forever, even when not scrolling
  useEffect(() => {
    const video3 = videoRefs.current[2];
    if (!video3) return;

    if (activeChapter === 2) {
      video3.muted = true;
      video3.loop = true;
      video3.playsInline = true;
      video3.playbackRate = 1.0;
      const playPromise = video3.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      if (!video3.paused) {
        video3.pause();
      }
    }
  }, [activeChapter]);

  // 2. Prime scrubbing videos on mount (Scenes 1, 2, 4, 5)
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      const scene = SCENE_DATA[index];
      if (!video || !scene || scene.isImage) return;
      video.muted = true;
      video.playsInline = true;

      if (scene.isRealtime) {
        video.loop = true;
        return;
      }

      const wakeUp = () => {
        const p = video.play();
        if (p !== undefined) {
          p.then(() => {
            video.pause();
            video.currentTime = 0;
          }).catch(() => {
            video.pause();
          });
        }
      };

      if (video.readyState >= 2) {
        wakeUp();
      } else {
        video.addEventListener('canplay', wakeUp, { once: true });
        video.load();
      }
    });

    // 3. Continuous 60fps Scrubbing Loop for Scenes 1, 2, 4, 5
    let animId: number;

    const scrub = () => {
      animId = requestAnimationFrame(scrub);
      const prog = scrollProgRef.current;

      SCENE_DATA.forEach((scene, index) => {
        // Scene 3 runs independently in realtime, Scene 6 is static image; NEVER seek in scrub loop
        if (scene.isRealtime || scene.isImage) return;

        const video = videoRefs.current[index];
        if (!video) return;

        const duration =
          video.duration && !isNaN(video.duration) && video.duration > 0
            ? video.duration
            : scene.duration;

        // Calculate target playback time (0 to duration) based on scroll
        let targetTime = 0;
        if (prog <= scene.startProg) {
          targetTime = 0;
        } else if (prog >= scene.playEndProg) {
          targetTime = duration;
        } else {
          const ratio = (prog - scene.startProg) / (scene.playEndProg - scene.startProg);
          targetTime = ratio * duration;
        }

        const safeTime = Math.max(0, Math.min(targetTime, duration - 0.01));

        // Direct seek when threshold > 0.02s
        if (Math.abs(video.currentTime - safeTime) > 0.02) {
          try {
            video.currentTime = safeTime;
          } catch {
            // Ignore if seeking fails before metadata
          }
        }
      });
    };

    animId = requestAnimationFrame(scrub);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black select-none pointer-events-none">
      {/* 5 Stacked Optimized Videos with Fast GPU Crossfade */}
      {SCENE_DATA.map((scene, index) => {
        // Calculate crossfade opacity
        let opacity = 0;
        const prog = scrollProgress;

        if (index === 0) {
          if (prog < scene.playEndProg) {
            opacity = 1;
          } else if (prog <= scene.endProg) {
            opacity = 1 - (prog - scene.playEndProg) / (scene.endProg - scene.playEndProg);
          } else {
            opacity = 0;
          }
        } else if (index === SCENE_DATA.length - 1) {
          const prevScene = SCENE_DATA[index - 1];
          if (prog < prevScene.playEndProg) {
            opacity = 0;
          } else if (prog <= scene.startProg) {
            opacity = (prog - prevScene.playEndProg) / (scene.startProg - prevScene.playEndProg);
          } else {
            opacity = 1;
          }
        } else {
          const prevScene = SCENE_DATA[index - 1];
          if (prog < prevScene.playEndProg) {
            opacity = 0;
          } else if (prog < scene.startProg) {
            opacity = (prog - prevScene.playEndProg) / (scene.startProg - prevScene.playEndProg);
          } else if (prog <= scene.playEndProg) {
            opacity = 1;
          } else if (prog <= scene.endProg) {
            opacity = 1 - (prog - scene.playEndProg) / (scene.endProg - scene.playEndProg);
          } else {
            opacity = 0;
          }
        }

        return (
          <div
            key={scene.id}
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: Math.max(0, Math.min(1, opacity)),
              zIndex: opacity > 0.01 ? 2 : 1,
              transition: 'opacity 0.25s ease-out',
            }}
          >
            {scene.isImage ? (
              /* Scene 6: 360° Rotated Cosmic / Earth Forest Image */
              <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
                {/* Outer wrapper: scroll-scrubbed rotation (spins 0 to 360 deg as you scroll) */}
                <div
                  className="w-[150vmax] h-[150vmax] flex-shrink-0 flex items-center justify-center will-change-transform"
                  style={{
                    transform: `rotate(${Math.max(0, Math.min(1, (scrollProgress - scene.startProg) / (scene.endProg - scene.startProg))) * 360}deg)`,
                  }}
                >
                  {/* Inner wrapper: continuous ambient 360-degree rotation animation */}
                  <div className="w-full h-full flex items-center justify-center animate-rotate-360 will-change-transform">
                    <img
                      src={scene.src}
                      alt="Scene 6 - The Rebirth"
                      className="w-full h-full object-cover scale-[1.08]"
                      style={{
                        filter: 'contrast(1.1) saturate(1.15) brightness(0.95)',
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={scene.src}
                playsInline
                muted
                autoPlay={scene.isRealtime || false}
                loop={scene.isRealtime || false}
                preload="auto"
                className="w-full h-full object-cover scale-[1.01]"
                style={{
                  filter:
                    index === 2
                      ? 'contrast(1.15) saturate(1.2)'
                      : index === 3
                      ? 'contrast(1.25) brightness(0.95)'
                      : index === 4
                      ? 'contrast(1.1) saturate(0.55) brightness(0.85)'
                      : 'contrast(1.05) saturate(1.05)',
                }}
              />
            )}
          </div>
        );
      })}

      {/* Cinematic Vignette Overlays */}
      <div className="absolute inset-0 z-10 bg-radial-gradient from-transparent via-black/35 to-black/85 pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />

      {/* Atmospheric Fire/Emergency/Renewal Gradient */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-700"
        style={{
          background:
            activeChapter === 2
              ? 'radial-gradient(circle at 50% 80%, rgba(255, 87, 34, 0.24) 0%, transparent 70%)'
              : activeChapter === 3
              ? 'radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.22) 0%, transparent 60%)'
              : activeChapter === 5
              ? 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.16) 0%, transparent 75%)'
              : 'transparent',
          opacity: activeChapter === 2 || activeChapter === 3 || activeChapter === 5 ? 1 : 0,
        }}
      />
    </div>
  );
}
