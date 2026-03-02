import React, { useState, useEffect } from 'react';

export default function BigClockDisplay() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dayStr = now.toLocaleDateString('en-AU', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

  // Determine time of day label
  const hour = now.getHours();
  let timeOfDay = '🌙 Night';
  let timeColor = 'text-indigo-300';
  if (hour >= 5 && hour < 12) { timeOfDay = '🌅 Morning'; timeColor = 'text-yellow-300'; }
  else if (hour >= 12 && hour < 17) { timeOfDay = '☀️ Afternoon'; timeColor = 'text-orange-300'; }
  else if (hour >= 17 && hour < 21) { timeOfDay = '🌇 Evening'; timeColor = 'text-pink-300'; }

  return (
    <div className="flex flex-col items-center text-center gap-6 select-none">
      {/* Time of day */}
      <div className={`text-3xl md:text-4xl font-semibold ${timeColor}`}>
        {timeOfDay}
      </div>

      {/* Big time */}
      <div className="text-7xl md:text-9xl font-bold text-white tracking-tight leading-none drop-shadow-2xl">
        {timeStr.split(':').slice(0, 2).join(':')}
        <span className="text-4xl md:text-6xl text-white/60 ml-2">{timeStr.split(' ')[1]}</span>
      </div>

      {/* Seconds */}
      <div className="text-2xl md:text-3xl text-white/50 font-mono">
        :{timeStr.split(':')[2].split(' ')[0]}
      </div>

      {/* Day */}
      <div className="text-4xl md:text-6xl font-bold text-white/90">
        {dayStr}
      </div>

      {/* Date */}
      <div className="text-2xl md:text-4xl text-white/70 font-medium">
        {dateStr}
      </div>
    </div>
  );
}