'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface SubscriberEntry {
  el: HTMLDivElement;
  shiftX: number;
  shiftY: number;
  tilt: number;
  perspective: number;
}

const subscribers = new Set<SubscriberEntry>();
let targetX = 0;
let targetY = 0;
let currX = 0;
let currY = 0;
let rafId: number | null = null;
let listenersAttached = false;

const clampHalf = (v: number) => Math.max(-0.5, Math.min(0.5, v));

function applySubscriberTransform(entry: SubscriberEntry, x: number, y: number) {
  const tx = x * entry.shiftX;
  const ty = y * entry.shiftY;
  const rx = -y * entry.tilt;
  const ry = x * entry.tilt;
  entry.el.style.transform = `perspective(${entry.perspective}px) translate3d(${tx.toFixed(
    2
  )}px, ${ty.toFixed(2)}px, 0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
}

function tickParallax() {
  currX += (targetX - currX) * 0.1;
  currY += (targetY - currY) * 0.1;

  subscribers.forEach((entry) => {
    applySubscriberTransform(entry, currX, currY);
  });

  if (Math.abs(targetX - currX) < 0.0004 && Math.abs(targetY - currY) < 0.0004) {
    currX = targetX;
    currY = targetY;
    subscribers.forEach((entry) => {
      applySubscriberTransform(entry, currX, currY);
    });
    rafId = null;
    return;
  }

  rafId = requestAnimationFrame(tickParallax);
}

function startParallaxLoop() {
  if (rafId === null && subscribers.size > 0) {
    rafId = requestAnimationFrame(tickParallax);
  }
}

function handleGlobalPointerMove(e: PointerEvent) {
  if (e.pointerType === 'touch') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;
  targetX = clampHalf(e.clientX / vw - 0.5);
  targetY = clampHalf(e.clientY / vh - 0.5);
  startParallaxLoop();
}

function handleGlobalReset() {
  targetX = 0;
  targetY = 0;
  startParallaxLoop();
}

function attachGlobalListeners() {
  if (listenersAttached || typeof window === 'undefined') return;
  listenersAttached = true;
  window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
  document.addEventListener('mouseleave', handleGlobalReset);
  window.addEventListener('blur', handleGlobalReset);
}

function detachGlobalListeners() {
  if (!listenersAttached || typeof window === 'undefined') return;
  listenersAttached = false;
  window.removeEventListener('pointermove', handleGlobalPointerMove);
  document.removeEventListener('mouseleave', handleGlobalReset);
  window.removeEventListener('blur', handleGlobalReset);
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

interface CursorParallaxTextProps {
  children: ReactNode;
  className?: string;
  shiftX?: number;
  shiftY?: number;
  tilt?: number;
  perspective?: number;
  disabled?: boolean;
}

/**
 * Shared 3D cursor-following parallax wrapper for editorial titles, subtitles, and narrative text.
 * Uses a single global pointer listener & requestAnimationFrame loop to update DOM transforms at 60fps.
 */
export default function CursorParallaxText({
  children,
  className = '',
  shiftX = 24,
  shiftY = 16,
  tilt = 6,
  perspective = 1000,
  disabled = false,
}: CursorParallaxTextProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || disabled) {
      if (el) el.style.transform = '';
      return;
    }

    const entry: SubscriberEntry = {
      el,
      shiftX,
      shiftY,
      tilt,
      perspective,
    };

    subscribers.add(entry);
    attachGlobalListeners();
    applySubscriberTransform(entry, currX, currY);

    return () => {
      subscribers.delete(entry);
      el.style.transform = '';
      if (subscribers.size === 0) {
        detachGlobalListeners();
      }
    };
  }, [shiftX, shiftY, tilt, perspective, disabled]);

  return (
    <div ref={wrapperRef} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}

