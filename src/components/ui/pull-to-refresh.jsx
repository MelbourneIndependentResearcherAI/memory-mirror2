import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Pull-to-Refresh Component - WCAG 2.1 Compliant
 * Provides native mobile pull-to-refresh with keyboard alternative
 */
export default function PullToRefresh({ onRefresh, children, disabled = false }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const containerRef = useRef(null);
  
  const PULL_THRESHOLD = 80; // Distance to trigger refresh
  const MAX_PULL = 120; // Max pull distance

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    let startY = 0;
    let currentY = 0;
    let scrollTop = 0;

    const handleTouchStart = (e) => {
      scrollTop = container.scrollTop;
      if (scrollTop <= 0) {
        startY = e.touches[0].pageY;
        setTouchStartY(startY);
      }
    };

    const handleTouchMove = (e) => {
      if (isRefreshing || startY === 0) return;
      
      currentY = e.touches[0].pageY;
      const diff = currentY - startY;
      
      // Only pull if at top and pulling down
      if (scrollTop <= 0 && diff > 0) {
        e.preventDefault();
        const distance = Math.min(diff * 0.5, MAX_PULL);
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD);
        
        try {
          await onRefresh?.();
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          }, 300);
        }
      } else {
        setPullDistance(0);
      }
      
      startY = 0;
      setTouchStartY(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, disabled, onRefresh]);

  const handleKeyboardRefresh = async (e) => {
    if ((e.key === 'r' || e.key === 'R') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!isRefreshing && !disabled) {
        setIsRefreshing(true);
        try {
          await onRefresh?.();
        } finally {
          setTimeout(() => setIsRefreshing(false), 300);
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardRefresh);
    return () => window.removeEventListener('keydown', handleKeyboardRefresh);
  }, [isRefreshing, disabled, onRefresh]);

  const rotation = isRefreshing ? 360 : (pullDistance / PULL_THRESHOLD) * 180;
  const opacity = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div 
      ref={containerRef} 
      className="relative h-full overflow-auto"
      role="main"
      aria-live="polite"
      aria-busy={isRefreshing}
    >
      {/* Pull-to-Refresh Indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-all z-50 pointer-events-none",
          pullDistance > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: `${Math.max(pullDistance, 0)}px`,
          opacity: opacity
        }}
        aria-hidden="true"
      >
        <div className="bg-white dark:bg-slate-800 rounded-full p-3 shadow-lg border-2 border-blue-500">
          <RefreshCw
            className={cn(
              "w-6 h-6 text-blue-600 dark:text-blue-400 transition-transform",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: `rotate(${rotation}deg)`
            }}
          />
        </div>
      </div>

      {/* Screen Reader Announcement */}
      <div className="sr-only" role="status" aria-live="assertive">
        {isRefreshing && "Refreshing content..."}
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing || pullDistance === 0 ? 'transform 0.2s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
}