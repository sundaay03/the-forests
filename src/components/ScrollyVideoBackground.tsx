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
  { id: 8, src: '/scene/scene8/8new.webm', duration: 10.0, startProg: 1.000, playEndProg: 1.115, endProg: 1.143, isRealtime: true },
];

export default function ScrollyVideoBackground({
  activeChapter,
  scrollProgress,
}: ScrollyVideoBackgroundProps) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const scrollProgRef = useRef(scrollProgress);
  scrollProgRef.current = scrollProgress;
  const lerpTimesRef = useRef<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const desiredTimesRef = useRef<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const seekStartTimesRef = useRef<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);

  // 1. Dedicated Realtime Playback Controller for Scene 3 (THE INFERNO) & Scene 8 (THE CONTACT)
  // Ensures Video 3 and Video 8 play continuously at normal speed, looping forever, even when user is stationary
  const isFireActive = activeChapter === 2 || (scrollProgress >= 0.245 && scrollProgress <= 0.445);
  const isContactActive = activeChapter === 7 || scrollProgress >= 0.92;

  const playRealtimeVideo = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.playbackRate = 1.0;
    if (video.paused) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  };

  useEffect(() => {
    const video3 = videoRefs.current[2];
    if (video3) {
      if (isFireActive) {
        playRealtimeVideo(2);
      } else if (!video3.paused && (scrollProgress < 0.20 || scrollProgress > 0.48)) {
        video3.pause();
      }
    }

    const video8 = videoRefs.current[7];
    if (video8) {
      if (isContactActive) {
        playRealtimeVideo(7);
      } else if (!video8.paused && scrollProgress < 0.88) {
        video8.pause();
      }
    }
  }, [isFireActive, isContactActive, scrollProgress]);

  // 2. Prime scrubbing videos on mount (Scenes 1, 2, 4, 5, 6, 7) & setup deadlock-proof seek coalescing
  useEffect(() => {
    const cleanupListeners: (() => void)[] = [];

    const commitSeek = (index: number) => {
      const video = videoRefs.current[index];
      if (!video || SCENE_DATA[index].isRealtime) return;
      if (video.readyState < 1) return;

      const now = performance.now();
      // Never allow video.seeking to permanently deadlock scrubbing if a range seek stalls (> 160ms)
      if (video.seeking && now - seekStartTimesRef.current[index] < 160) return;

      const target = desiredTimesRef.current[index] ?? 0;
      if (Math.abs(video.currentTime - target) > 0.008) {
        try {
          seekStartTimesRef.current[index] = now;
          video.currentTime = target;
        } catch {
          // Ignore if seeking fails before metadata is ready
        }
      }
    };

    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;

      if (SCENE_DATA[index].isRealtime) {
        video.loop = true;
        const playRealtime = () => {
          const curProg = scrollProgRef.current;
          const s = SCENE_DATA[index];
          if (curProg >= s.startProg - 0.08 && curProg <= s.endProg + 0.06) {
            video.play().catch(() => {});
          }
        };
        video.addEventListener('canplay', playRealtime, { once: true });
        video.load();
        cleanupListeners.push(() => video.removeEventListener('canplay', playRealtime));
        return;
      }

      const onSeekedOrLoaded = () => {
        seekStartTimesRef.current[index] = 0;
        commitSeek(index);
      };
      video.addEventListener('seeked', onSeekedOrLoaded);
      video.addEventListener('loadeddata', onSeekedOrLoaded);
      cleanupListeners.push(() => {
        video.removeEventListener('seeked', onSeekedOrLoaded);
        video.removeEventListener('loadeddata', onSeekedOrLoaded);
      });

      const wakeUp = () => {
        const p = video.play();
        if (p !== undefined) {
          p.then(() => {
            video.pause();
            commitSeek(index);
          }).catch(() => {
            video.pause();
            commitSeek(index);
          });
        }
      };

      if (video.readyState >= 2) {
        wakeUp();
      } else {
        video.addEventListener('canplay', wakeUp, { once: true });
        cleanupListeners.push(() => video.removeEventListener('canplay', wakeUp));
        video.load();
      }
    });

    // Interaction unlocker to satisfy strict browser autoplay requirements (Scene 3 & Scene 8)
    const handleUserInteraction = () => {
      SCENE_DATA.forEach((s, idx) => {
        if (!s.isRealtime) return;
        const v = videoRefs.current[idx];
        if (v) {
          v.muted = true;
          v.defaultMuted = true;
          const curProg = scrollProgRef.current;
          if (curProg >= s.startProg - 0.08 && curProg <= s.endProg + 0.06) {
            v.play().catch(() => {});
          }
        }
      });
    };
    ['pointerdown', 'touchstart', 'scroll', 'wheel', 'keydown'].forEach((evt) => {
      window.addEventListener(evt, handleUserInteraction, { passive: true });
      cleanupListeners.push(() => window.removeEventListener(evt, handleUserInteraction));
    });

    // 3. Continuous 120fps Lerp Scrubbing Loop for Scenes 1, 2, 4, 5, 6, 7 & Realtime Keeper for Scene 3
    let animId: number;

    const scrub = () => {
      animId = requestAnimationFrame(scrub);
      const prog = scrollProgRef.current;

      SCENE_DATA.forEach((scene, index) => {
        // Realtime looping mode for Scene 3 & Scene 8
        if (scene.isRealtime) {
          const isNearRealtime = prog >= scene.startProg - 0.06 && prog <= scene.endProg + 0.05;
          const v = videoRefs.current[index];
          if (v) {
            if (isNearRealtime) {
              if (v.paused) {
                v.muted = true;
                v.defaultMuted = true;
                v.loop = true;
                v.playsInline = true;
                const p = v.play();
                if (p !== undefined) p.catch(() => {});
              }
            } else if (prog < scene.startProg - 0.10 || prog > scene.endProg + 0.10) {
              if (!v.paused) {
                v.pause();
              }
            }
          }
          return;
        }

        // Only seek videos that are currently visible or approaching
        const isNearActive =
          prog >= scene.startProg - 0.08 && prog <= scene.endProg + 0.08;
        if (!isNearActive) return;

        const video = videoRefs.current[index];
        if (!video) return;

        // Recover if Chrome's initial concurrent connection pool stalled this video's load
        if (video.readyState === 0 && video.networkState !== 2) {
          video.load();
        }

        // Ensure paused so browser playback never overrides scroll-scrubbed position
        if (!video.paused) {
          video.pause();
        }

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

        // Snap directly after large jumps (e.g. navbar transition), lerp smoothly during continuous scroll
        const currentLerp = lerpTimesRef.current[index] ?? 0;
        const diff = targetTime - currentLerp;
        const nextLerp =
          Math.abs(diff) < 0.002 || Math.abs(diff) > 0.6
            ? targetTime
            : currentLerp + diff * 0.28;
        lerpTimesRef.current[index] = nextLerp;

        const safeTime = Math.max(0, Math.min(nextLerp, duration - 0.01));
        desiredTimesRef.current[index] = safeTime;

        // Non-blocking frame seek with deadlock protection
        commitSeek(index);
      });
    };

    animId = requestAnimationFrame(scrub);

    return () => {
      cancelAnimationFrame(animId);
      cleanupListeners.forEach((fn) => fn());
    };
  }, []);

  const vpW = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const vpH = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const minDim = Math.min(vpW, vpH);
  const maxCornerR = Math.hypot(vpW, vpH) * 0.56;
  const isPortalWindow = scrollProgress >= 0.942 && scrollProgress <= 1.05;

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
          // Scene 8 stays hidden while Scene 7 gets sucked into the portal (prog < 0.992),
          // then opens cleanly out from inside the liquid portal core (0.992 -> 1.045)
          if (prog < 0.992) {
            opacity = 0;
          } else if (prog < 1.012) {
            opacity = (prog - 0.992) / (1.012 - 0.992);
          } else {
            opacity = 1;
          }
        } else if (index === 6) {
          // Scene 7 stays visible while shrinking into the liquid portal center (0.945 -> 0.995)
          const prevScene = SCENE_DATA[index - 1];
          if (prog < prevScene.playEndProg) {
            opacity = 0;
          } else if (prog < scene.startProg) {
            opacity = (prog - prevScene.playEndProg) / (scene.startProg - prevScene.playEndProg);
          } else if (prog <= 0.982) {
            opacity = 1;
          } else if (prog <= 0.996) {
            opacity = 1 - (prog - 0.982) / (0.996 - 0.982);
          } else {
            opacity = 0;
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

        // Portal Suction Zoom Transform between end of Scene 7 (index 6) and start of Scene 8 (index 7)
        // Background videos stay upright (zero rotation) and zoom cleanly into/out of the liquid portal
        let videoTransform = 'translateZ(0) scale(1.01)';
        let wrapperClipPath = 'none';
        let videoFilter =
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
            : 'contrast(1.05) saturate(1.05)';

        if (index === 6 && prog > 0.945 && prog <= 0.998) {
          // Scene 7 stays upright (no rotation) and zooms forward straight into the center liquid portal
          const suctionRatio = Math.max(0, Math.min(1, (prog - 0.945) / (0.995 - 0.945)));
          const suctionEase = Math.pow(suctionRatio, 1.9);
          const scale = 1.01 + suctionEase * 0.88;
          const blur = suctionEase * 6;

          videoTransform = `translateZ(0) scale(${scale.toFixed(3)})`;
          videoFilter = `contrast(${(1.08 + suctionEase * 0.22).toFixed(2)}) saturate(${(1.2 + suctionEase * 0.25).toFixed(2)}) brightness(${(1.02 + suctionEase * 0.22).toFixed(2)}) blur(${blur.toFixed(1)}px)`;
        } else if (index === 7 && prog >= 0.992 && prog < 1.045) {
          // Scene 8 stays upright (no rotation) and opens cleanly inside the expanding circular liquid portal aperture
          const emergeRatio = Math.max(0, Math.min(1, (prog - 0.995) / (1.045 - 0.995)));
          const emergeEase = 1 - Math.pow(1 - emergeRatio, 2.2);
          const apertureR = minDim * 0.05 + (maxCornerR - minDim * 0.05) * emergeEase;
          const scale = 1.24 - emergeEase * 0.23;
          const blur = (1 - emergeEase) * 5;

          wrapperClipPath = `circle(${apertureR.toFixed(1)}px at 50% 50%)`;
          videoTransform = `translateZ(0) scale(${scale.toFixed(3)})`;
          videoFilter = `contrast(1.06) saturate(1.1) brightness(${(1.0 + (1 - emergeEase) * 0.22).toFixed(2)}) blur(${blur.toFixed(1)}px)`;
        }

        const disableOpacityLag = (index === 6 || index === 7) && isPortalWindow;

        return (
          <div
            key={scene.id}
            suppressHydrationWarning
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: clampedOpacity,
              zIndex: clampedOpacity > 0.01 ? 2 : 1,
              clipPath: wrapperClipPath,
              transition: disableOpacityLag ? 'none' : 'opacity 0.18s ease-out',
              willChange: 'opacity, clip-path',
            }}
          >
            <video
              ref={(el) => {
                videoRefs.current[index] = el;
                if (el) {
                  el.muted = true;
                  el.defaultMuted = true;
                  if (scene.isRealtime) {
                    el.loop = true;
                    el.playsInline = true;
                  }
                }
              }}
              suppressHydrationWarning
              src={scene.src}
              playsInline
              muted
              autoPlay={scene.isRealtime || false}
              loop={scene.isRealtime || false}
              preload="auto"
              onLoadedMetadata={(e) => {
                if (scene.isRealtime) {
                  e.currentTarget.muted = true;
                  e.currentTarget.defaultMuted = true;
                  e.currentTarget.play().catch(() => {});
                }
              }}
              onCanPlay={(e) => {
                if (scene.isRealtime) {
                  e.currentTarget.muted = true;
                  e.currentTarget.defaultMuted = true;
                  e.currentTarget.play().catch(() => {});
                }
              }}
              className="w-full h-full object-cover"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: videoTransform,
                willChange: 'transform, filter',
                filter: videoFilter,
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
