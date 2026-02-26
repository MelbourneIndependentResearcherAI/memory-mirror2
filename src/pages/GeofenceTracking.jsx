import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GeofenceManager from '@/components/caregiver/GeofenceManager';
import LiveLocationTracker from '@/components/caregiver/LiveLocationTracker';

export default function GeofenceTracking() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('zones'); // 'zones' or 'tracking'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 p-4 md:p-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
            <MapPin className="w-10 h-10 text-green-600" />
            Location Safety Tracking
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Set up safe zones and monitor your loved one's location in real-time
          </p>
        </div>

        <div className="flex gap-3 mb-6">
          <Button
            variant={activeTab === 'zones' ? 'default' : 'outline'}
            onClick={() => setActiveTab('zones')}
            className="flex-1"
          >
            Safe Zones Setup
          </Button>
          <Button
            variant={activeTab === 'tracking' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tracking')}
            className="flex-1"
          >
            Live Tracking
          </Button>
        </div>

        {activeTab === 'zones' && <GeofenceManager />}
        {activeTab === 'tracking' && <LiveLocationTracker />}
      </div>
    </div>
  );
}