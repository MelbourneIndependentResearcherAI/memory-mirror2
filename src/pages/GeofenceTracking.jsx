import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GeofenceManager from '@/components/caregiver/GeofenceManager';
import LiveLocationTracker from '@/components/caregiver/LiveLocationTracker';
import PageLoadTip from '@/components/tips/PageLoadTip';

export default function GeofenceTracking() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('zones'); // 'zones' or 'tracking'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 dark:from-slate-950 dark:via-green-950 dark:to-blue-950 p-4 md:p-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 min-h-[44px] hover:bg-green-100 dark:hover:bg-green-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-premium border-2 border-green-200 dark:border-green-800">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
            <MapPin className="w-10 h-10 text-green-600 drop-shadow-lg" />
            Location Safety Tracking
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            GPS-powered safe zone monitoring with instant breach alerts
          </p>
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-950 rounded-lg border border-green-300 dark:border-green-700">
            <p className="text-sm text-green-800 dark:text-green-200 font-semibold">
              🛡️ Critical Safety Feature: Real-time geofence protection for your loved one
            </p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <Button
            variant={activeTab === 'zones' ? 'default' : 'outline'}
            onClick={() => setActiveTab('zones')}
            className={`flex-1 min-h-[48px] font-bold text-lg ${
              activeTab === 'zones' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-premium' 
                : 'border-2 hover:bg-blue-50 dark:hover:bg-blue-950'
            }`}
          >
            🗺️ Safe Zones Setup
          </Button>
          <Button
            variant={activeTab === 'tracking' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tracking')}
            className={`flex-1 min-h-[48px] font-bold text-lg ${
              activeTab === 'tracking' 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-premium' 
                : 'border-2 hover:bg-green-50 dark:hover:bg-green-950'
            }`}
          >
            📡 Live Tracking
          </Button>
        </div>

        {activeTab === 'zones' && <GeofenceManager />}
        {activeTab === 'tracking' && <LiveLocationTracker />}
      </div>

      <PageLoadTip pageName="GeofenceTracking" />
    </div>
  );
}