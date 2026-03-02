import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Mic, Users, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuickMessages from '@/components/carer-messaging/QuickMessages';
import VoiceMessages from '@/components/carer-messaging/VoiceMessages';
import ContactGroups from '@/components/carer-messaging/ContactGroups';

export default function CarerMessaging() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-32">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="min-h-[44px]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Carer Messaging</h1>
            <p className="text-sm text-slate-500">Quick messages, voice notes & contacts</p>
          </div>
        </div>

        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-6 h-14">
            <TabsTrigger value="quick" className="flex flex-col gap-0.5 h-full text-xs">
              <MessageSquare className="w-4 h-4" />
              Quick Send
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex flex-col gap-0.5 h-full text-xs">
              <Mic className="w-4 h-4" />
              Voice Notes
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex flex-col gap-0.5 h-full text-xs">
              <Users className="w-4 h-4" />
              Contacts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick"><QuickMessages /></TabsContent>
          <TabsContent value="voice"><VoiceMessages /></TabsContent>
          <TabsContent value="contacts"><ContactGroups /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}