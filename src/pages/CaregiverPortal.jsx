import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Settings, Users, BookHeart, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SafeZonesManager from '../components/caregiver/SafeZonesManager';
import EmergencyContactsManager from '../components/caregiver/EmergencyContactsManager';
import MemoryManager from '../components/caregiver/MemoryManager';
import AnxietyDashboard from '../components/caregiver/AnxietyDashboard';

export default function CaregiverPortal() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3">
                <Settings className="w-10 h-10 text-indigo-600" />
                Caregiver Portal
              </h1>
              <p className="text-slate-600 mt-2">
                Manage safe memory zones, contacts, memories, and view insights
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="memories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="memories" className="flex items-center gap-2 py-3">
              <BookHeart className="w-4 h-4" />
              Memories
            </TabsTrigger>
            <TabsTrigger value="safe-zones" className="flex items-center gap-2 py-3">
              <Settings className="w-4 h-4" />
              Safe Zones
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2 py-3">
              <Users className="w-4 h-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 py-3">
              <TrendingUp className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="memories">
            <MemoryManager />
          </TabsContent>

          <TabsContent value="safe-zones">
            <SafeZonesManager />
          </TabsContent>

          <TabsContent value="contacts">
            <EmergencyContactsManager />
          </TabsContent>

          <TabsContent value="insights">
            <AnxietyDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}