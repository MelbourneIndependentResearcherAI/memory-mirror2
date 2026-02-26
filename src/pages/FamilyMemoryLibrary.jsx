import React, { useState } from 'react';
import { ArrowLeft, Share2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FamilyMemorySharing from '@/components/family/FamilyMemorySharing';
import SharedCareJournal from '@/components/family/SharedCareJournal';
import PageLoadTip from '@/components/tips/PageLoadTip';

export default function FamilyMemoryLibrary() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('memories');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 dark:from-slate-950 dark:via-pink-950 dark:to-orange-950 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-white/20 text-white mb-4 min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Share2 className="w-8 h-8" />
            Family Collaboration Hub
          </h1>
          <p className="text-pink-100">
            Share memories, contribute content, and log care observations together
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1">
            <TabsTrigger value="memories" className="flex items-center gap-2 py-3">
              <Share2 className="w-4 h-4" />
              Shared Memories
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-2 py-3">
              <BookOpen className="w-4 h-4" />
              Care Journal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="memories">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6">
              <FamilyMemorySharing />
            </div>
          </TabsContent>

          <TabsContent value="journal">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6">
              <SharedCareJournal />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <PageLoadTip pageName="FamilyMemoryLibrary" />
    </div>
  );
}