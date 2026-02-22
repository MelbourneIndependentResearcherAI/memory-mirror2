import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Upload, ListMusic, Clock } from 'lucide-react';
import CustomMusicUploader from './CustomMusicUploader';
import PlaylistBuilder from './PlaylistBuilder';
import PlaylistScheduler from './PlaylistScheduler';

export default function MusicTherapyManager() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Music Therapy Manager</h1>
        <p className="text-gray-600">
          Upload custom music, create playlists, and schedule therapeutic listening sessions
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Music
          </TabsTrigger>
          <TabsTrigger value="playlists" className="flex items-center gap-2">
            <ListMusic className="w-4 h-4" />
            Playlists
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Schedules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <CustomMusicUploader />
        </TabsContent>

        <TabsContent value="playlists" className="mt-6">
          <PlaylistBuilder />
        </TabsContent>

        <TabsContent value="schedules" className="mt-6">
          <PlaylistScheduler />
        </TabsContent>
      </Tabs>
    </div>
  );
}