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
}

const SCENE_DATA: SceneMeta[] = [
  { id: 1, src: '/scene/scene1/1.webm', duration: 9.93, startProg: 0.000, playEndProg: 0.115, endProg: 0.143 },
  { id: 2, src: '/scene/scene2/2.webm', duration: 9.93, startProg: 0.143, playEndProg: 0.258, endProg: 0.286 },
  { id: 3, src: '/scene/scene3/3.webm', duration: 6.98, startProg: 0.286, playEndProg: 0.401, endProg: 0.429, isRealtime: true },
  { id: 4, src: '/scene/scene4/4.webm', duration: 9.93, startProg: 0.429, playEndProg: 0.544, endProg: 0.571 },
  { id: 5, src: '/scene/scene5/5.webm', duration: 9.93, startProg: 0.571, playEndProg: 0.686, endProg: 0.714 },
  { id: 6, src: '/scene/scene6/6.webm', duration: 9.98, startProg: 0.714, playEndProg: 0.829, endProg: 0.857 },
  { id: 7, src: '/scene/scene7/7.webm', duration: 9.93, startProg: 0.857, playEndProg: 0.975, endProg: 1.000 },
];

export default function ScrollyVideoBackground({
  activeChapter,
  scrollProgress,
}: ScrollyVideoBackgroundProps) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const scrollProgRef = useRef(scrollProgress);
  scrollProgRef.current = scrollProgress;
  const lerpTimesRef = useRef<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const desiredTimesRef = useRef<number[]>([0, 0, 0, 0, 0, 0, 0]);

  // 1. Dedicated Realtime Playback Controller for Scene 3 (THE INFERNO)
  // Ensures Video 3 plays continuously at normal speed, looping forever, even when not scrolling
  const isFireActive = activeChapter === 2 || scrollProgress >= 0.245;

  useEffect(() => {
    const video3 = videoRefs.current[2];
    if (!video3) return;

    if (isFireActive) {
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
  }, [isFireActive]);

  // 2. Prime scrubbing videos on mount (Scenes 1, 2, 4, 5) & setup non-blocking seek coalescing
  useEffect(() => {
    const cleanupListeners: (() => void)[] = [];

    const commitSeek = (index: number) => {
      const video = videoRefs.current[index];
      if (!video || SCENE_DATA[index].isRealtime) return;
      if (video.readyState < 1 || video.seeking) return;

      const target = desiredTimesRef.current[index] ?? 0;
      if (Math.abs(video.currentTime - target) > 0.008) {
        try {
          video.currentTime = target;
        } catch {
          // Ignore if seeking fails before metadata is ready
        }
      }
    };

    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      video.muted = true;
      video.playsInline = true;

      if (SCENE_DATA[index].isRealtime) {
        video.loop = true;
        return;
      }

      const onSeeked = () => {
        commitSeek(index);
      };
      video.addEventListener('seeked', onSeeked);
      cleanupListeners.push(() => video.removeEventListener('seeked', onSeeked));

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

    // 3. Continuous 120fps Lerp Scrubbing Loop for Scenes 1, 2, 4, 5
    let animId: number;

    const scrub = () => {
      animId = requestAnimationFrame(scrub);
      const prog = scrollProgRef.current;

      SCENE_DATA.forEach((scene, index) => {
        // Scene 3 runs independently in realtime; NEVER touch or seek it in scrub loop
        if (scene.isRealtime) return;

        // Performance optimization: Only seek videos that are currently visible or approaching
        const isNearActive =
          prog >= scene.startProg - 0.08 && prog <= scene.endProg + 0.08;
        if (!isNearActive) return;

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

        // Ultra-fluid lerp interpolation to eliminate micro-stutters
        const currentLerp = lerpTimesRef.current[index] ?? 0;
        const diff = targetTime - currentLerp;
        const nextLerp = Math.abs(diff) < 0.002 ? targetTime : currentLerp + diff * 0.28;
        lerpTimesRef.current[index] = nextLerp;

        const safeTime = Math.max(0, Math.min(nextLerp, duration - 0.01));
        desiredTimesRef.current[index] = safeTime;

        // Non-blocking frame seek: never abort an in-flight VP9 decode
        commitSeek(index);
      });
    };

    animId = requestAnimationFrame(scrub);

    return () => {
      cancelAnimationFrame(animId);
      cleanupListeners.forEach((fn) => fn());
    };
  }, []);

  return (
    <div
      suppressHydrationWarning
      className="absolute inset-0 w-full h-full overflow-hidden bg-black select-none pointer-events-none"
    >
      {/* 5 Stacked Optimized WebM Videos with Fast GPU Crossfade */}
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

        const clampedOpacity = Math.max(0, Math.min(1, opacity));

        return (
          <div
            key={scene.id}
            suppressHydrationWarning
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: clampedOpacity,
              zIndex: clampedOpacity > 0.01 ? 2 : 1,
              transition: 'opacity 0.18s ease-out',
              willChange: 'opacity',
            }}
          >
            <video
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              suppressHydrationWarning
              src={scene.src}
              playsInline
              muted
              autoPlay={scene.isRealtime || false}
              loop={scene.isRealtime || false}
              preload="auto"
              className="w-full h-full object-cover"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'translateZ(0) scale(1.01)',
                willChange: 'transform',
                filter:
                  index === 2
                    ? 'contrast(1.15) saturate(1.2)'
                    : index === 3
                    ? 'contrast(1.25) brightness(0.95)'
                    : index === 4
                    ? 'contrast(1.1) saturate(0.55) brightness(0.85)'
                    : index === 5
                    ? 'contrast(1.15) saturate(0.9) brightness(0.95)'
                    : index === 6
                    ? 'contrast(1.08) saturate(1.2) brightness(1.02)'
                    : 'contrast(1.05) saturate(1.05)',
              }}
            />
          </div>
        );
      })}

      {/* Cinematic Vignette Overlays */}
      <div className="absolute inset-0 z-10 vignette-cinematic pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

      {/* Atmospheric Fire/Emergency Gradient for Scene 3 & 4 */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-700"
        style={{
          background:
            activeChapter === 2
              ? 'radial-gradient(circle at 50% 80%, rgba(255, 87, 34, 0.24) 0%, transparent 70%)'
              : activeChapter === 3
              ? 'radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.22) 0%, transparent 60%)'
              : 'transparent',
          opacity: activeChapter === 2 || activeChapter === 3 ? 1 : 0,
        }}
      />
    </div>
  );
}
