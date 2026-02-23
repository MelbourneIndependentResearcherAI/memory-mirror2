import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, Heart, Bell, Music, BookOpen, Calendar, Image, MessageSquare, Send, Clock, Phone, GitBranch, ListMusic, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WellbeingOverview from '../components/family/WellbeingOverview';
import MessageManager from '../components/family/MessageManager';
import MusicLibrary from '../components/family/MusicLibrary';
import StoryLibrary from '../components/family/StoryLibrary';
import CalendarManager from '../components/family/CalendarManager';
import MediaAlbum from '../components/family/MediaAlbum';
import NotificationCenter from '../components/family/NotificationCenter';
import EmergencyContactsManager from '../components/caregiver/EmergencyContactsManager';
import SharedPhotoAlbum from '../components/family/SharedPhotoAlbum';
import MemoryTimelineBuilder from '../components/family/MemoryTimelineBuilder';
import RemoteTriggerPanel from '../components/family/RemoteTriggerPanel';
import FamilyTreeBuilder from '../components/family/FamilyTreeBuilder';
import PlaylistManager from '../components/music/PlaylistManager';
import SmartAlertSystem from '../components/family/SmartAlertSystem';

function FamilyConnectMain() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split('/')[2] || 'overview';

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 dark:from-slate-950 dark:via-pink-950 dark:to-orange-950 p-4 md:p-6 pb-16">
      <div className="max-w-6xl mx-auto">
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
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <Users className="w-8 h-8 md:w-10 md:h-10 text-pink-600 dark:text-pink-400" />
                Memory Mirror
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-500 italic">
                dementia care kit for carers and their loved ones
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Stay connected with your loved one's well-being
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => navigate(`/FamilyConnect/${val}`)} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 h-auto bg-transparent p-0">
            <TabsTrigger value="overview" className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl border-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-50 data-[state=active]:to-rose-50 bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Overview</span>
            </TabsTrigger>

            <TabsTrigger value="notifications" className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl border-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-50 data-[state=active]:to-orange-50 bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Alerts</span>
            </TabsTrigger>

            <TabsTrigger value="smart-alerts" className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl border-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-50 data-[state=active]:to-pink-50 bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">AI Insights</span>
            </TabsTrigger>

            <TabsTrigger value="photo-album" className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl border-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-50 data-[state=active]:to-violet-50 bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                <Image className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Photos</span>
            </TabsTrigger>

            <TabsTrigger value="timeline" className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl border-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-50 data-[state=active]:to-cyan-50 bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Timeline</span>
            </TabsTrigger>

            <TabsTrigger value="remote" className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl border-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-50 data-[state=active]:to-emerald-50 bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Send className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Send Now</span>
            </TabsTrigger>

            <TabsTrigger value="calendar" className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl border-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-50 data-[state=active]:to-blue-50 bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Calendar</span>
            </TabsTrigger>

            <TabsTrigger value="album" className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl border-2 border-transparent data-[state=active]:border-fuchsia-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-fuchsia-50 data-[state=active]:to-pink-50 bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Image className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Album</span>
            </TabsTrigger>

            <TabsTrigger value="messages" className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl border-2 border-transparent data-[state=active]:border-teal-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-teal-50 data-[state=active]:to-cyan-50 bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Messages</span>
            </TabsTrigger>

            <TabsTrigger value="music" className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl border-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-red-50 data-[state=active]:to-pink-50 bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Music className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Music</span>
            </TabsTrigger>

            <TabsTrigger value="stories" className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl border-2 border-transparent data-[state=active]:border-yellow-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-yellow-50 data-[state=active]:to-amber-50 bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Stories</span>
            </TabsTrigger>

            <TabsTrigger value="contacts" className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl border-2 border-transparent data-[state=active]:border-slate-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-slate-50 data-[state=active]:to-gray-50 bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-500 to-gray-500 flex items-center justify-center shadow-lg">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Contacts</span>
            </TabsTrigger>

            <TabsTrigger value="family-tree" className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl border-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-50 data-[state=active]:to-green-50 bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                <GitBranch className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Family Tree</span>
            </TabsTrigger>

            <TabsTrigger value="playlists" className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl border-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-50 data-[state=active]:to-red-50 bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                <ListMusic className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Playlists</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Well-being Overview</h2>
              <WellbeingOverview />
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Notifications & Alerts</h2>
              <NotificationCenter />
            </div>
          </TabsContent>

          <TabsContent value="smart-alerts">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <SmartAlertSystem />
            </div>
          </TabsContent>

          <TabsContent value="photo-album">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <SharedPhotoAlbum />
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <MemoryTimelineBuilder />
            </div>
          </TabsContent>

          <TabsContent value="remote">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <RemoteTriggerPanel />
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Family Calendar</h2>
              <CalendarManager />
            </div>
          </TabsContent>

          <TabsContent value="album">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Family Photo & Video Album</h2>
              <MediaAlbum />
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Family Messages</h2>
              <MessageManager />
            </div>
          </TabsContent>

          <TabsContent value="music">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Music Library</h2>
              <MusicLibrary />
            </div>
          </TabsContent>

          <TabsContent value="stories">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Story Collection</h2>
              <StoryLibrary />
            </div>
          </TabsContent>

          <TabsContent value="contacts">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Emergency Contacts</h2>
              <EmergencyContactsManager />
            </div>
          </TabsContent>

          <TabsContent value="family-tree">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Family Tree</h2>
              <FamilyTreeBuilder />
            </div>
          </TabsContent>

          <TabsContent value="playlists">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Music Playlists</h2>
              <PlaylistManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function FamilyConnect() {
  return (
    <Routes>
      <Route path="/" element={<FamilyConnectMain />} />
      <Route path="/:tab" element={<FamilyConnectMain />} />
    </Routes>
  );
}