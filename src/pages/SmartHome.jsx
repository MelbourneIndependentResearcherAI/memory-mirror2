import React from 'react';
import { ArrowLeft, Home, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function SmartHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-slate-950 dark:via-blue-950 dark:to-sky-950 p-4 md:p-6 pb-16">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Smart Home</h1>
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left mb-6">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">Feature Under Development</p>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Smart Home device integration requires external hardware setup (smart bulbs, thermostats, locks). 
                To use this feature, connect compatible smart home devices via your home hub (e.g., Google Home, Amazon Alexa, Apple HomeKit) and configure the API integrations in the backend settings.
              </p>
            </div>
          </div>
          <div className="text-left space-y-3 mb-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">What this feature will do:</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-blue-500">💡</span> Control smart lights (dim/brighten based on time or mood)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">🌡️</span> Adjust thermostat for comfort
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">🔒</span> Check and lock doors remotely
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">📷</span> View indoor cameras
              </li>
            </ul>
          </div>
          <Button onClick={() => navigate('/CaregiverPortal')} className="w-full bg-blue-600 hover:bg-blue-700">
            Return to Caregiver Portal
          </Button>
        </div>
      </div>
    </div>
  );
}