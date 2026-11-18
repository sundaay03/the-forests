'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent,
  type ReactNode,
} from 'react';

interface CursorTiltCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  maxTilt?: number;
  maxShift?: number;
  hoverScale?: number;
  perspective?: number;
  spotlightColor?: string;
  glareClassName?: string;
  disabled?: boolean;
}

interface TiltState {
  rx: number;
  ry: number;
  tx: number;
  ty: number;
  scale: number;
  gx: number;
  gy: number;
  glareOpacity: number;
}

const REST_STATE: TiltState = {
  rx: 0,
  ry: 0,
  tx: 0,
  ty: 0,
  scale: 1,
  gx: 50,
  gy: 50,
  glareOpacity: 0,
};

const GLARE_BASE_STYLE: CSSProperties = { opacity: 0 };

/**
 * Reusable 3D cursor-following tilt + spotlight glass reflection wrapper for cards.
 * Animates via requestAnimationFrame directly on DOM refs for 60fps zero-re-render motion.
 */
export default function CursorTiltCard({
  children,
  className = '',
  style,
  maxTilt = 10,
  maxShift = 8,
  hoverScale = 1.03,
  perspective = 1000,
  spotlightColor = 'rgba(255, 255, 255, 0.16)',
  glareClassName = '',
  disabled = false,
  onPointerMove,
  onPointerLeave,
  onPointerCancel,
  ...rest
}: CursorTiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);
  const currentRef = useRef<TiltState>({ ...REST_STATE });
  const targetRef = useRef<TiltState>({ ...REST_STATE });
  const rafRef = useRef<number | null>(null);
  const isHoveredRef = useRef(false);
  const configRef = useRef({ perspective, spotlightColor });
  const applyFrameRef = useRef<() => void>(() => {});

  useEffect(() => {
    configRef.current = { perspective, spotlightColor };
  }, [perspective, spotlightColor]);

  const applyFrame = useCallback(() => {
    const cur = currentRef.current;
    const tgt = targetRef.current;
    const { perspective: persp, spotlightColor: spotColor } = configRef.current;
    const lerp = isHoveredRef.current ? 0.16 : 0.11;

    cur.rx += (tgt.rx - cur.rx) * lerp;
    cur.ry += (tgt.ry - cur.ry) * lerp;
    cur.tx += (tgt.tx - cur.tx) * lerp;
    cur.ty += (tgt.ty - cur.ty) * lerp;
    cur.scale += (tgt.scale - cur.scale) * lerp;
    cur.gx += (tgt.gx - cur.gx) * 0.2;
    cur.gy += (tgt.gy - cur.gy) * 0.2;
    cur.glareOpacity += (tgt.glareOpacity - cur.glareOpacity) * 0.15;

    if (cardRef.current) {
      const isAtRest =
        !isHoveredRef.current &&
        Math.abs(cur.rx) < 0.01 &&
        Math.abs(cur.ry) < 0.01 &&
        Math.abs(cur.tx) < 0.01 &&
        Math.abs(cur.ty) < 0.01 &&
        Math.abs(cur.scale - 1) < 0.0005;

      if (isAtRest) {
        currentRef.current = { ...REST_STATE };
        cardRef.current.style.transform = '';
      } else {
        cardRef.current.style.transform = `perspective(${persp}px) translate3d(${cur.tx.toFixed(
          2
        )}px, ${cur.ty.toFixed(2)}px, 0) rotateX(${cur.rx.toFixed(2)}deg) rotateY(${cur.ry.toFixed(
          2
        )}deg) scale3d(${cur.scale.toFixed(4)}, ${cur.scale.toFixed(4)}, 1)`;
      }
    }

    if (glareRef.current) {
      glareRef.current.style.opacity = cur.glareOpacity.toFixed(3);
      glareRef.current.style.background = `radial-gradient(380px circle at ${cur.gx.toFixed(
        1
      )}% ${cur.gy.toFixed(1)}%, ${spotColor}, transparent 68%)`;
    }

    const settled =
      !isHoveredRef.current &&
      Math.abs(tgt.rx - cur.rx) < 0.01 &&
      Math.abs(tgt.ry - cur.ry) < 0.01 &&
      Math.abs(tgt.tx - cur.tx) < 0.01 &&
      Math.abs(tgt.ty - cur.ty) < 0.01 &&
      Math.abs(tgt.scale - cur.scale) < 0.0005 &&
      Math.abs(tgt.glareOpacity - cur.glareOpacity) < 0.005;

    if (settled) {
      rafRef.current = null;
      return;
    }

    rafRef.current = requestAnimationFrame(() => applyFrameRef.current());
  }, []);

  useEffect(() => {
    applyFrameRef.current = applyFrame;
  }, [applyFrame]);

  const ensureLoop = useCallback(() => {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => applyFrameRef.current());
    }
  }, []);

  useEffect(() => {
    if (!disabled) return;
    const cur = currentRef.current;
    const hasTilt =
      isHoveredRef.current ||
      Math.abs(cur.rx) >= 0.01 ||
      Math.abs(cur.ry) >= 0.01 ||
      Math.abs(cur.tx) >= 0.01 ||
      Math.abs(cur.ty) >= 0.01 ||
      Math.abs(cur.scale - 1) >= 0.0005 ||
      cur.glareOpacity >= 0.005;

    isHoveredRef.current = false;
    targetRef.current = { ...REST_STATE };
    if (hasTilt) {
      ensureLoop();
    }
  }, [disabled, ensureLoop]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    if (disabled || e.pointerType === 'touch') return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const px = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const nx = px - 0.5;
    const ny = py - 0.5;

    isHoveredRef.current = true;
    targetRef.current = {
      rx: -ny * maxTilt * 2,
      ry: nx * maxTilt * 2,
      tx: nx * maxShift * 2,
      ty: ny * maxShift * 2 - 4,
      scale: hoverScale,
      gx: px * 100,
      gy: py * 100,
      glareOpacity: 1,
    };
    ensureLoop();
  };

  const resetHover = () => {
    isHoveredRef.current = false;
    targetRef.current = {
      ...REST_STATE,
      gx: currentRef.current.gx,
      gy: currentRef.current.gy,
    };
    ensureLoop();
  };

  const handlePointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(e);
    resetHover();
  };

  const handlePointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    onPointerCancel?.(e);
    resetHover();
  };

  const mergedStyle: CSSProperties = {
    willChange: 'transform',
    ...style,
  };

  return (
    <div
      ref={cardRef}
      style={mergedStyle}
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerCancel}
      {...rest}
    >
      {children}
      <div
        ref={glareRef}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-[inherit] z-20 ${glareClassName}`}
        style={GLARE_BASE_STYLE}
      />
    </div>
  );
}
