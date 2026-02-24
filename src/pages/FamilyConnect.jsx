import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, Heart, Bell, Music, BookOpen, Calendar, Image, MessageSquare, Send, Clock, Phone, GitBranch, ListMusic, Brain, MessagesSquare, Video } from 'lucide-react';
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
import FamilyChatRoom from '../components/family/FamilyChatRoom';
import VideoCallLauncher from '../components/video/VideoCallLauncher';

function FamilyConnectMain() {
  const navigate = useNavigate();

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/FamilyVideoCall')}
            className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <Video className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Video Call</span>
          </button>

          <button
            onClick={() => navigate('/FamilyChatRoom')}
            className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <MessagesSquare className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Family Chat</span>
          </button>

          <button
            onClick={() => navigate('/FamilyOverview')}
            className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Overview</span>
          </button>

          <button
            onClick={() => navigate('/FamilyNotifications')}
            className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Alerts</span>
          </button>

          <button
            onClick={() => navigate('/FamilyAIInsights')}
            className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">AI Insights</span>
          </button>

          <button
            onClick={() => navigate('/FamilyPhotoAlbum')}
            className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
              <Image className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Photos</span>
          </button>

          <button
            onClick={() => navigate('/FamilyTimeline')}
            className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Timeline</span>
          </button>

          <button
            onClick={() => navigate('/FamilyRemoteTrigger')}
            className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <Send className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Send Now</span>
          </button>

          <button
            onClick={() => navigate('/FamilyCalendar')}
            className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Calendar</span>
          </button>

          <button
            onClick={() => navigate('/FamilyMediaAlbum')}
            className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Image className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Album</span>
          </button>

          <button
            onClick={() => navigate('/FamilyMessages')}
            className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Messages</span>
          </button>

          <button
            onClick={() => navigate('/FamilyMusic')}
            className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Music className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Music</span>
          </button>

          <button
            onClick={() => navigate('/FamilyStories')}
            className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Stories</span>
          </button>

          <button
            onClick={() => navigate('/FamilyContacts')}
            className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-500 to-gray-500 flex items-center justify-center shadow-lg">
              <Phone className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Contacts</span>
          </button>

          <button
            onClick={() => navigate('/FamilyTreePage')}
            className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
              <GitBranch className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Family Tree</span>
          </button>

          <button
            onClick={() => navigate('/FamilyPlaylists')}
            className="flex flex-col items-center gap-3 p-6 h-auto rounded-2xl bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
              <ListMusic className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Playlists</span>
          </button>
        </div>
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