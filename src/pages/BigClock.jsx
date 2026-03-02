import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BigClockDisplay from '@/components/clock/BigClockDisplay';
import AlarmList from '@/components/clock/AlarmList';
import AlarmManagerModal from '@/components/clock/AlarmManagerModal';
import { Button } from '@/components/ui/button';

export default function BigClock() {
  const navigate = useNavigate();
  const [showAlarmManager, setShowAlarmManager] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col pb-32">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          onClick={() => setShowAlarmManager(true)}
          className="text-white hover:bg-white/10 flex items-center gap-2 text-sm"
        >
          <Lock className="w-4 h-4" />
          Carer Settings
        </Button>
      </div>

      {/* Big clock */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <BigClockDisplay />
      </div>

      {/* Alarms display (read-only for patient) */}
      <div className="px-4 pb-4">
        <AlarmList />
      </div>

      {/* Alarm Manager (carer PIN protected) */}
      {showAlarmManager && (
        <AlarmManagerModal onClose={() => setShowAlarmManager(false)} />
      )}
    </div>
  );
}