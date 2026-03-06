import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';

export default function AlarmList() {
  const [alarms, setAlarms] = useState([]);
  const [ringingAlarm, setRingingAlarm] = useState(null);
  const intervalRef = useRef(null);
  const ringingRef = useRef(null);

  const loadAlarms = () => {
    try {
      const saved = localStorage.getItem('carerAlarms');
      setAlarms(saved ? JSON.parse(saved) : []);
    } catch {
      setAlarms([]);
    }
  };

  useEffect(() => {
    loadAlarms();
    // Check for alarm triggers every 5 seconds
    intervalRef.current = setInterval(() => {
      loadAlarms();
      checkAlarms();
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const checkAlarms = () => {
    try {
      const saved = localStorage.getItem('carerAlarms');
      const currentAlarms = saved ? JSON.parse(saved) : [];
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const dayIndex = now.getDay(); // 0=Sun

      currentAlarms.forEach(alarm => {
        if (!alarm.enabled) return;
        if (alarm.time !== hhmm) return;
        // Check days
        if (alarm.days && alarm.days.length > 0 && !alarm.days.includes(dayIndex)) return;

        // Check we haven't already triggered this minute
        const lastTriggered = localStorage.getItem(`alarm_triggered_${alarm.id}`);
        if (lastTriggered === hhmm) return;

        localStorage.setItem(`alarm_triggered_${alarm.id}`, hhmm);
        setRingingAlarm(alarm);
        triggerAlarmSound();
      });
    } catch {}
  };

  const triggerAlarmSound = () => {
    // Use Web Speech API to announce the alarm
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Alarm! Time for your reminder.');
      utterance.rate = 0.9;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const dismissAlarm = () => {
    setRingingAlarm(null);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  };

  const enabledAlarms = alarms.filter(a => a.enabled);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (ringingAlarm) {
    return (
      <div className="fixed inset-0 z-50 bg-yellow-400 flex flex-col items-center justify-center p-8 animate-pulse">
        <Bell className="w-32 h-32 text-yellow-900 mb-6" />
        <p className="text-5xl font-bold text-yellow-900 mb-4">🔔 ALARM!</p>
        <p className="text-3xl text-yellow-800 mb-2">{ringingAlarm.label || 'Reminder'}</p>
        <p className="text-6xl font-bold text-yellow-900 mb-8">{ringingAlarm.time}</p>
        <button
          onClick={dismissAlarm}
          className="bg-yellow-900 text-white text-3xl font-bold px-12 py-6 rounded-3xl shadow-2xl active:scale-95 transition-transform"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (enabledAlarms.length === 0) return null;

  return (
    <div className="space-y-3 max-w-lg mx-auto w-full">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-5 h-5 text-white/60" />
        <p className="text-white/60 text-sm font-medium">Upcoming Alarms</p>
      </div>
      {enabledAlarms.map(alarm => (
        <div key={alarm.id} className="bg-white/10 backdrop-blur rounded-2xl px-5 py-4 flex items-center justify-between border border-white/20">
          <div>
            <p className="text-white text-3xl font-bold">{alarm.time}</p>
            {alarm.label && <p className="text-white/70 text-sm mt-0.5">{alarm.label}</p>}
            {alarm.days && alarm.days.length > 0 && alarm.days.length < 7 && (
              <p className="text-white/50 text-xs mt-0.5">{alarm.days.map(d => dayNames[d]).join(', ')}</p>
            )}
            {(!alarm.days || alarm.days.length === 0 || alarm.days.length === 7) && (
              <p className="text-white/50 text-xs mt-0.5">Every day</p>
            )}
          </div>
          <Bell className="w-6 h-6 text-yellow-400" />
        </div>
      ))}
    </div>
  );
}