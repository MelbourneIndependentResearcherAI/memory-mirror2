import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SmartDeviceManager from '@/components/smartHome/SmartDeviceManager';
import SmartHomeRoutineBuilder from '@/components/smartHome/SmartHomeRoutineBuilder';

export default function SmartHomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6 pb-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
          <SmartDeviceManager />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
          <SmartHomeRoutineBuilder />
        </div>
      </div>
    </div>
  );
}