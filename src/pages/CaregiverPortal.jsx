import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Users, BookHeart, TrendingUp, Shield, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SafeZonesManager from '../components/caregiver/SafeZonesManager';
import EmergencyContactsManager from '../components/caregiver/EmergencyContactsManager';
import MemoryManager from '../components/caregiver/MemoryManager';
import AnxietyDashboard from '../components/caregiver/AnxietyDashboard';
import InsightsPanel from '../components/caregiver/InsightsPanel';
import Settings from '../components/caregiver/Settings';
import ProactiveSuggestions from '../components/caregiver/ProactiveSuggestions';

export default function CaregiverPortal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6 pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="min-h-[44px] min-w-[44px] hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <SettingsIcon className="w-8 h-8 md:w-10 md:h-10 text-indigo-600 dark:text-indigo-400" />
                Caregiver Portal
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Manage safe memory zones, contacts, memories, and view insights
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="ai-insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 h-auto bg-white dark:bg-slate-900">
            <TabsTrigger value="ai-insights" className="flex items-center gap-2 py-3 min-h-[44px]">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI Insights</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 py-3 min-h-[44px]">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Alerts</span>
              <span className="sm:hidden">🔔</span>
            </TabsTrigger>
            <TabsTrigger value="memories" className="flex items-center gap-2 py-3 min-h-[44px]">
              <BookHeart className="w-4 h-4" />
              <span className="hidden sm:inline">Memories</span>
            </TabsTrigger>
            <TabsTrigger value="safe-zones" className="flex items-center gap-2 py-3 min-h-[44px]">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Safe Zones</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2 py-3 min-h-[44px]">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2 py-3 min-h-[44px]">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Trends</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 py-3 min-h-[44px]">
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-insights">
            <ProactiveSuggestions />
          </TabsContent>

          <TabsContent value="insights">
            <InsightsPanel />
          </TabsContent>

          <TabsContent value="memories">
            <MemoryManager />
          </TabsContent>

          <TabsContent value="safe-zones">
            <SafeZonesManager />
          </TabsContent>

          <TabsContent value="contacts">
            <EmergencyContactsManager />
          </TabsContent>

          <TabsContent value="trends">
            <AnxietyDashboard />
          </TabsContent>

          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}