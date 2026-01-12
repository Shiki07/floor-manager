import { useState, useRef, useCallback, useEffect } from 'react';

interface SwipeConfig {
  minSwipeDistance?: number;
  maxSwipeTime?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enabled?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export function useSwipeNavigation({
  minSwipeDistance = 50,
  maxSwipeTime = 300,
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
}: SwipeConfig) {
  const touchStart = useRef<TouchPoint | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    setIsSwiping(true);
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStart.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    
    // If vertical scroll is more prominent, don't interfere
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      touchStart.current = null;
      setIsSwiping(false);
    }
  }, [enabled]);

  // Trigger haptic feedback if supported
  const triggerHapticFeedback = useCallback(() => {
    // Try Vibration API first (widely supported on Android)
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Short 10ms vibration
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStart.current) {
      setIsSwiping(false);
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaTime = Date.now() - touchStart.current.time;

    // Check if swipe is valid (fast enough and far enough)
    if (deltaTime <= maxSwipeTime && Math.abs(deltaX) >= minSwipeDistance) {
      // Trigger haptic feedback on successful swipe
      triggerHapticFeedback();
      
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    touchStart.current = null;
    setIsSwiping(false);
  }, [enabled, minSwipeDistance, maxSwipeTime, onSwipeLeft, onSwipeRight, triggerHapticFeedback]);

  const bindSwipeHandlers = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isSwiping,
    bindSwipeHandlers,
  };
}

// Hook variant that auto-binds to a ref
export function useSwipeRef<T extends HTMLElement>({
  minSwipeDistance = 50,
  maxSwipeTime = 300,
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
}: SwipeConfig) {
  const ref = useRef<T>(null);
  const { bindSwipeHandlers, isSwiping } = useSwipeNavigation({
    minSwipeDistance,
    maxSwipeTime,
    onSwipeLeft,
    onSwipeRight,
    enabled,
  });

  useEffect(() => {
    const cleanup = bindSwipeHandlers(ref.current);
    return cleanup;
  }, [bindSwipeHandlers]);

  return { ref, isSwiping };
}