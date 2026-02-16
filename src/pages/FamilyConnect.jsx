import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Heart, Bell, Music, BookOpen, Calendar, Image, MessageSquare } from 'lucide-react';
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

export default function FamilyConnect() {
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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto bg-white dark:bg-slate-900">
            <TabsTrigger value="overview" className="flex items-center gap-2 py-3 min-h-[44px]">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 py-3 min-h-[44px]">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 py-3 min-h-[44px]">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="album" className="flex items-center gap-2 py-3 min-h-[44px]">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Album</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2 py-3 min-h-[44px]">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="music" className="flex items-center gap-2 py-3 min-h-[44px]">
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline">Music</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2 py-3 min-h-[44px]">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2 py-3 min-h-[44px]">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Contacts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Well-being Overview
              </h2>
              <WellbeingOverview />
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Notifications & Alerts
              </h2>
              <NotificationCenter />
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Family Calendar
              </h2>
              <CalendarManager />
            </div>
          </TabsContent>

          <TabsContent value="album">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Family Photo & Video Album
              </h2>
              <MediaAlbum />
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Family Messages
              </h2>
              <MessageManager />
            </div>
          </TabsContent>

          <TabsContent value="music">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Music Library
              </h2>
              <MusicLibrary />
            </div>
          </TabsContent>

          <TabsContent value="stories">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Story Collection
              </h2>
              <StoryLibrary />
            </div>
          </TabsContent>

          <TabsContent value="contacts">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Emergency Contacts
              </h2>
              <EmergencyContactsManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}