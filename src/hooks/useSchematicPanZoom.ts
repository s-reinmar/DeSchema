/**
 * @file useSchematicPanZoom.ts
 * @description Custom hook delivering robust manual panning, smooth wheel zoom, and zoom-to-fit capabilities.
 * @author @s-reinmar
 * @license MIT
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { PanZoomState } from '../types/annotation.types.ts';

const MIN_SCALE = 0.6;
const MAX_SCALE = 3.5;
const DEFAULT_SCALE = 1.0;

interface UseSchematicPanZoomReturn {
  readonly transform: PanZoomState;
  readonly isDragging: boolean;
  readonly zoomIn: () => void;
  readonly zoomOut: () => void;
  readonly zoomToFit: () => void;
  readonly resetTransform: () => void;
  readonly handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  readonly handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  readonly handleMouseUp: () => void;
}

export function useSchematicPanZoom(
  containerRef?: React.RefObject<HTMLDivElement | null>
): UseSchematicPanZoomReturn {
  const [transform, setTransform] = useState<PanZoomState>({
    scale: DEFAULT_SCALE,
    translateX: 0,
    translateY: 0,
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startTranslateRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const element = containerRef?.current;
    if (!element) return;

    const onNativeWheel = (e: WheelEvent) => {
      // Prevent browser viewport from scrolling when zooming schematic
      e.preventDefault();
      e.stopPropagation();
      const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;

      setTransform((prev) => ({
        ...prev,
        scale: Math.min(Math.max(prev.scale + zoomDelta, MIN_SCALE), MAX_SCALE),
      }));
    };

    element.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => {
      element.removeEventListener('wheel', onNativeWheel);
    };
  }, [containerRef]);

  const zoomIn = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(prev.scale + 0.2, MAX_SCALE),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(prev.scale - 0.2, MIN_SCALE),
    }));
  }, []);

  const zoomToFit = useCallback(() => {
    setTransform({
      scale: 1.0,
      translateX: 0,
      translateY: 0,
    });
  }, []);

  const resetTransform = useCallback(() => {
    setTransform({
      scale: DEFAULT_SCALE,
      translateX: 0,
      translateY: 0,
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only primary mouse button and not if clicking an interactive control
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-no-pan="true"]')) {
      return;
    }

    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    startTranslateRef.current = {
      x: transform.translateX,
      y: transform.translateY,
    };
  }, [transform.translateX, transform.translateY]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    setTransform((prev) => ({
      ...prev,
      translateX: startTranslateRef.current.x + deltaX,
      translateY: startTranslateRef.current.y + deltaY,
    }));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    transform,
    isDragging,
    zoomIn,
    zoomOut,
    zoomToFit,
    resetTransform,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
