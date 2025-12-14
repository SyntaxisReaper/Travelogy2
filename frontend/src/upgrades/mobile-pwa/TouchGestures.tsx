import React, { useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';

interface TouchPosition {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeGestureProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPinch?: (scale: number) => void;
  threshold?: number;
  velocity?: number;
  longPressDelay?: number;
  disabled?: boolean;
}

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
  disabled?: boolean;
}

// Swipe and Touch Gesture Component
export const SwipeGesture: React.FC<SwipeGestureProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  onLongPress,
  onPinch,
  threshold = 50,
  velocity = 0.5,
  longPressDelay = 500,
  disabled = false
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const startPos = useRef<TouchPosition | null>(null);
  const lastTap = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const initialDistance = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;

    const touch = e.touches[0];
    const now = Date.now();
    
    startPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: now
    };

    // Handle long press
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
      }, longPressDelay);
    }

    // Handle pinch (two fingers)
    if (e.touches.length === 2 && onPinch) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialDistance.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    }
  }, [disabled, onLongPress, onPinch, longPressDelay]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || !startPos.current) return;

    // Clear long press if moving
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Handle pinch
    if (e.touches.length === 2 && onPinch && initialDistance.current > 0) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const scale = currentDistance / initialDistance.current;
      onPinch(scale);
    }
  }, [disabled, onPinch]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (disabled || !startPos.current) return;

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    const touch = e.changedTouches[0];
    const endPos = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    const deltaX = endPos.x - startPos.current.x;
    const deltaY = endPos.y - startPos.current.y;
    const deltaTime = endPos.timestamp - startPos.current.timestamp;
    const distance = Math.hypot(deltaX, deltaY);
    const speed = distance / deltaTime;

    // Check for tap/double tap
    if (distance < 10 && deltaTime < 200) {
      const now = Date.now();
      if (now - lastTap.current < 300 && onDoubleTap) {
        onDoubleTap();
        lastTap.current = 0;
      } else {
        if (onTap) {
          setTimeout(() => {
            if (lastTap.current === now) {
              onTap();
            }
          }, 200);
        }
        lastTap.current = now;
      }
    }
    // Check for swipe
    else if (distance > threshold && speed > velocity) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    startPos.current = null;
  }, [disabled, threshold, velocity, onTap, onDoubleTap, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <Box ref={elementRef} sx={{ touchAction: disabled ? 'auto' : 'none' }}>
      {children}
    </Box>
  );
};

// Pull to Refresh Component
export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  maxPull = 120,
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isRefreshing = useRef<boolean>(false);
  const pullDistance = useRef<number>(0);

  const updatePullIndicator = useCallback((distance: number) => {
    const container = containerRef.current;
    if (!container) return;

    const normalizedDistance = Math.min(distance, maxPull);
    const opacity = Math.min(normalizedDistance / threshold, 1);
    const scale = Math.min(0.5 + (normalizedDistance / threshold) * 0.5, 1);

    container.style.transform = `translateY(${normalizedDistance}px)`;
    
    // Update pull indicator (you can customize this)
    const indicator = container.querySelector('.pull-indicator') as HTMLElement;
    if (indicator) {
      indicator.style.opacity = opacity.toString();
      indicator.style.transform = `scale(${scale})`;
    }
  }, [threshold, maxPull]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing.current) return;
    
    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing.current) return;

    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;

    // Only handle pull down when at top of page
    const isAtTop = window.scrollY === 0;
    
    if (deltaY > 0 && isAtTop) {
      e.preventDefault();
      pullDistance.current = deltaY;
      updatePullIndicator(deltaY);
    }
  }, [disabled, updatePullIndicator]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing.current) return;

    const shouldRefresh = pullDistance.current >= threshold;
    
    if (shouldRefresh) {
      isRefreshing.current = true;
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        isRefreshing.current = false;
      }
    }

    // Reset pull indicator
    const container = containerRef.current;
    if (container) {
      container.style.transform = 'translateY(0px)';
      const indicator = container.querySelector('.pull-indicator') as HTMLElement;
      if (indicator) {
        indicator.style.opacity = '0';
        indicator.style.transform = 'scale(0.5)';
      }
    }

    pullDistance.current = 0;
  }, [disabled, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <Box ref={containerRef} sx={{ position: 'relative', transition: 'transform 0.3s ease' }}>
      {/* Pull to refresh indicator */}
      <Box
        className="pull-indicator"
        sx={{
          position: 'absolute',
          top: -40,
          left: '50%',
          transform: 'translateX(-50%) scale(0.5)',
          opacity: 0,
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: '#1de9b6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          fontSize: '1.2rem',
          zIndex: 1000,
          transition: 'opacity 0.2s ease, transform 0.2s ease'
        }}
      >
        ↓
      </Box>
      {children}
    </Box>
  );
};

// Mobile-optimized button with haptic feedback
interface HapticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  hapticType?: 'light' | 'medium' | 'heavy';
  disabled?: boolean;
  sx?: any;
}

export const HapticButton: React.FC<HapticButtonProps> = ({
  children,
  onClick,
  hapticType = 'light',
  disabled = false,
  sx
}) => {
  const triggerHaptic = useCallback(() => {
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[hapticType]);
    }
  }, [hapticType]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    
    triggerHaptic();
    onClick?.();
  }, [disabled, triggerHaptic, onClick]);

  return (
    <Box
      onClick={handleClick}
      sx={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'transform 0.1s ease',
        '&:active': {
          transform: disabled ? 'none' : 'scale(0.95)'
        },
        ...sx
      }}
    >
      {children}
    </Box>
  );
};

export default SwipeGesture;