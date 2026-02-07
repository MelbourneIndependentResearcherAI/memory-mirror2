import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children, className = '' }) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const threshold = 80;

  const handleTouchStart = (e) => {
    if (containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const distance = currentY.current - startY.current;

    if (distance > 0 && containerRef.current.scrollTop === 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.5, threshold));
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, isRefreshing, pullDistance]);

  return (
    <div ref={containerRef} className={`relative overflow-y-auto ${className}`}>
      <div
        className="absolute inset-x-0 top-0 flex justify-center items-center transition-opacity"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance / threshold,
        }}
      >
        <Loader2 className={`w-6 h-6 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
      </div>
      <div style={{ transform: `translateY(${isRefreshing ? threshold : pullDistance}px)`, transition: isRefreshing || !isPulling ? 'transform 0.2s' : 'none' }}>
        {children}
      </div>
    </div>
  );
}