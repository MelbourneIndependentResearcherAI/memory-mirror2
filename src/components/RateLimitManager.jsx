import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

// Rate limit check - max 10 messages per minute for free tier
const MAX_MESSAGES_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

// Store per-session timestamps so each page load starts fresh
// but persists across re-renders (module-level singleton)
const messageTimestamps = [];

export function checkRateLimit() {
  const now = Date.now();
  
  // Remove old timestamps outside the window
  while (messageTimestamps.length > 0 && messageTimestamps[0] < now - RATE_LIMIT_WINDOW) {
    messageTimestamps.shift();
  }
  
  // Check BEFORE pushing — don't push if we're at the limit
  if (messageTimestamps.length >= MAX_MESSAGES_PER_MINUTE) {
    return {
      limited: true,
      remaining: 0,
      resetTime: messageTimestamps[0] + RATE_LIMIT_WINDOW
    };
  }
  
  messageTimestamps.push(now);
  return {
    limited: false,
    remaining: MAX_MESSAGES_PER_MINUTE - messageTimestamps.length,
    resetTime: null
  };
}

export default function RateLimitAlert({ limited, resetTime }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!limited || !resetTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = resetTime - now;
      setTimeLeft(Math.ceil(remaining / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [limited, resetTime]);

  if (!limited) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-yellow-900">
          Rate limit reached
        </p>
        <p className="text-xs text-yellow-700 mt-1">
          You've sent many messages quickly. Please wait {timeLeft}s before sending more.
        </p>
      </div>
    </div>
  );
}