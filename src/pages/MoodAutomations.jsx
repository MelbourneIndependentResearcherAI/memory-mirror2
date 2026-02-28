import React from 'react';
import { ArrowLeft, Brain, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function MoodAutomations() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-slate-950 dark:via-purple-950 dark:to-indigo-950 p-4 md:p-6 pb-16">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Mood Automations</h1>
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left mb-6">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">Requires Smart Home Setup</p>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Mood-based automations automatically adjust your smart home environment (lights, temperature, music) based on detected anxiety or emotional state. 
                This feature requires smart home devices to be connected first.
              </p>
            </div>
          </div>
          <div className="text-left space-y-3 mb-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">How it works:</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-purple-500">😰</span> When anxiety is detected → dim lights, play calm music
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">😊</span> When mood is happy → brighter lights, upbeat music
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">🌙</span> At night → night lights on, doors checked
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">🌅</span> In the morning → gradual light increase, gentle alarm
              </li>
            </ul>
          </div>
          <Button onClick={() => navigate('/CaregiverPortal')} className="w-full bg-purple-600 hover:bg-purple-700">
            Return to Caregiver Portal
          </Button>
        </div>
      </div>
    </div>
  );
}