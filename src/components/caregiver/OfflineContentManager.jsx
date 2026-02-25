import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Download, HardDrive, RefreshCw, Trash2, CheckCircle2, 
  AlertCircle, Music, Image, BookOpen, Brain
} from 'lucide-react';
import {
  getOfflineContentSize
} from '@/components/utils/offlineContentSync';

const priorityColors = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
};

const contentTypeIcons = {
  photo: Image,
  music: Music,
  story: BookOpen,
  memory: Brain
};

export default function OfflineContentManager({ onBack }) {
  const queryClient = useQueryClient();
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0, total: 0 });
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  // Fetch all content entities
  const { data: photos = [] } = useQuery({
    queryKey: ['familyMedia'],
    queryFn: () => base44.entities.FamilyMedia.list('-created_date', 100)
  });

  const { data: music = [] } = useQuery({
    queryKey: ['music'],
    queryFn: () => base44.entities.Music.list('-created_date', 100)
  });

  const { data: stories = [] } = useQuery({
    queryKey: ['stories'],
    queryFn: () => base44.entities.Story.list('-created_date', 100)
  });

  const { data: memories = [] } = useQuery({
    queryKey: ['memories'],
    queryFn: () => base44.entities.Memory.list('-created_date', 100)
  });

  const { data: offlinePriorities = [], isLoading } = useQuery({
    queryKey: ['offlineContentPriority'],
    queryFn: () => base44.entities.OfflineContentPriority.list('-priority', 200)
  });

  // Calculate storage estimate
  useEffect(() => {
    const loadStorage = async () => {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const usedMB = (estimate.usage || 0) / (1024 * 1024);
        const totalMB = (estimate.quota || 0) / (1024 * 1024);
        const availableMB = totalMB - usedMB;
        setStorageInfo({
          used: usedMB.toFixed(2),
          available: availableMB.toFixed(2),
          total: totalMB.toFixed(2)
        });
      }
      
      // Also load offline content specific size
      const contentSize = await getOfflineContentSize();
      setStorageInfo(prev => ({
        ...prev,
        offlineContent: contentSize.totalSizeMB
      }));
    };
    
    loadStorage();
    const interval = setInterval(loadStorage, 10000);
    return () => clearInterval(interval);
  }, [offlinePriorities]);

  const updatePriorityMutation = useMutation({
    mutationFn: ({ id, priority }) => 
      base44.entities.OfflineContentPriority.update(id, { priority }),
    onSuccess: () => queryClient.invalidateQueries(['offlineContentPriority'])
  });

  const _toggleSyncMutation = useMutation({
    mutationFn: ({ id, enabled }) => 
      base44.entities.OfflineContentPriority.update(id, { sync_enabled: enabled }),
    onSuccess: () => queryClient.invalidateQueries(['offlineContentPriority'])
  });

  const createPriorityMutation = useMutation({
    mutationFn: (data) => base44.entities.OfflineContentPriority.create(data),
    onSuccess: () => queryClient.invalidateQueries(['offlineContentPriority'])
  });

  const deletePriorityMutation = useMutation({
    mutationFn: (id) => base44.entities.OfflineContentPriority.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['offlineContentPriority'])
  });

  const handleAddToOffline = async (contentType, item) => {
    // Estimate file sizes
    let fileSize = 100; // Default estimate in KB
    if (contentType === 'photo') fileSize = 500;
    if (contentType === 'music') fileSize = 3000;
    if (contentType === 'story') fileSize = 50;
    if (contentType === 'memory') fileSize = 200;

    await createPriorityMutation.mutateAsync({
      content_type: contentType,
      content_id: item.id,
      content_title: item.title || item.name || 'Untitled',
      priority: 'medium',
      file_size_kb: fileSize,
      sync_enabled: true,
      is_synced: false
    });
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncStatus('Starting sync...');
    
    const syncItems = offlinePriorities.filter(p => p.sync_enabled && !p.is_synced);
    
    if (syncItems.length === 0) {
      setSyncStatus('All content already synced!');
      setTimeout(() => {
        setSyncing(false);
        setSyncStatus('');
      }, 2000);
      return;
    }
    
    let successCount = 0;
    
    for (let i = 0; i < syncItems.length; i++) {
      const item = syncItems[i];
      setSyncStatus(`Syncing ${i + 1} of ${syncItems.length}: ${item.content_title}...`);
      
      try {
        // Actually download the content based on type
        if (item.content_type === 'music') {
          const musicItem = music.find(m => m.id === item.content_id);
          if (musicItem?.audio_file_url || musicItem?.youtube_url) {
            // Cache music metadata locally
            await saveToOfflineStore('music', musicItem);
          }
        } else if (item.content_type === 'photo') {
          const photoItem = photos.find(p => p.id === item.content_id);
          if (photoItem?.media_url) {
            // Cache photo metadata locally
            await saveToOfflineStore('familyMedia', photoItem);
          }
        } else if (item.content_type === 'story') {
          const storyItem = stories.find(s => s.id === item.content_id);
          if (storyItem) {
            await saveToOfflineStore('stories', storyItem);
          }
        } else if (item.content_type === 'memory') {
          const memoryItem = memories.find(m => m.id === item.content_id);
          if (memoryItem) {
            await saveToOfflineStore('memories', memoryItem);
          }
        }
        
        // Mark as synced in database
        await base44.entities.OfflineContentPriority.update(item.id, {
          is_synced: true,
          last_synced: new Date().toISOString()
        });
        
        successCount++;
      } catch (error) {
        console.error(`Failed to sync ${item.content_title}:`, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setSyncStatus(`✅ Sync complete! ${successCount} of ${syncItems.length} items synced.`);
    queryClient.invalidateQueries(['offlineContentPriority']);
    
    setTimeout(() => {
      setSyncing(false);
      setSyncStatus('');
    }, 3000);
  };

  const saveToOfflineStore = async (storeName, data) => {
    try {
      const offlineSync = await import('@/components/utils/offlineContentSync');
      
      // Use appropriate download function based on content type
      if (storeName === 'music') {
        await offlineSync.downloadMusicForOffline(data);
      } else if (storeName === 'familyMedia') {
        await offlineSync.downloadPhotoForOffline(data);
      } else if (storeName === 'stories') {
        await offlineSync.downloadStoryForOffline(data);
      } else if (storeName === 'memories') {
        await offlineSync.downloadMemoryForOffline(data);
      } else {
        // Fallback to direct storage
        const { initOfflineStorage, saveToStore } = await import('@/components/utils/offlineStorage');
        await initOfflineStorage();
        await saveToStore(storeName, data);
      }
    } catch (error) {
      console.error('Failed to save to offline store:', error);
      throw error;
    }
  };

  const storagePercentage = storageInfo.total > 0 
    ? (parseFloat(storageInfo.used) / parseFloat(storageInfo.total)) * 100 
    : 0;

  const syncedCount = offlinePriorities.filter(p => p.is_synced).length;
  const totalSize = offlinePriorities.reduce((sum, p) => sum + (p.file_size_kb || 0), 0);

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back
        </Button>
      )}

      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Offline Content Manager
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Configure which content is available offline and manage device storage
        </p>
      </div>

      {/* Storage Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Storage Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {storageInfo.used} MB
            </div>
            <Progress value={storagePercentage} className="mt-2" />
            <p className="text-xs text-slate-500 mt-1">
              of {storageInfo.total} MB total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Synced Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {syncedCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              of {offlinePriorities.length} items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Download className="w-4 h-4" />
              Total Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {(totalSize / 1024).toFixed(1)} MB
            </div>
            <p className="text-xs text-slate-500 mt-1">
              queued for offline
            </p>
          </CardContent>
        </Card>
      </div>

      {syncStatus && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertDescription className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncStatus}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleSyncAll}
          disabled={syncing || offlinePriorities.every(p => p.is_synced || !p.sync_enabled)}
          className="min-h-[44px]"
        >
          {syncing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Sync All Content
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            queryClient.invalidateQueries(['offlineContentPriority']);
            window.location.reload();
          }}
          className="min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="priorities" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="priorities">Offline Priorities</TabsTrigger>
          <TabsTrigger value="available">Add Content</TabsTrigger>
        </TabsList>

        <TabsContent value="priorities" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-400" />
            </div>
          ) : offlinePriorities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No content configured for offline access yet</p>
                <p className="text-sm text-slate-400 mt-2">
                  Switch to "Add Content" tab to configure offline content
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {offlinePriorities.map(item => {
                const Icon = contentTypeIcons[item.content_type] || Brain;
                return (
                  <Card key={item.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${priorityColors[item.priority]}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {item.content_title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="capitalize">{item.content_type}</span>
                            <span>•</span>
                            <span>{(item.file_size_kb / 1024).toFixed(1)} MB</span>
                            {item.is_synced && (
                              <>
                                <span>•</span>
                                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Synced
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={item.priority}
                            onValueChange={(val) => updatePriorityMutation.mutate({ id: item.id, priority: val })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="critical">Critical</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePriorityMutation.mutate(item.id)}
                            className="min-h-[44px] min-w-[44px]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-6">
          {/* Photos */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Image className="w-5 h-5" />
              Photos ({photos.length})
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {photos.slice(0, 10).map(photo => {
                const alreadyAdded = offlinePriorities.some(p => p.content_id === photo.id);
                return (
                  <Card key={photo.id} className={alreadyAdded ? 'opacity-50' : ''}>
                    <CardContent className="py-3 flex items-center justify-between">
                      <span className="font-medium truncate">{photo.title}</span>
                      <Button
                        size="sm"
                        variant={alreadyAdded ? 'outline' : 'default'}
                        onClick={() => !alreadyAdded && handleAddToOffline('photo', photo)}
                        disabled={alreadyAdded}
                        className="min-h-[40px]"
                      >
                        {alreadyAdded ? 'Added' : 'Add'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Music */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Music className="w-5 h-5" />
              Music ({music.length})
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {music.slice(0, 10).map(song => {
                const alreadyAdded = offlinePriorities.some(p => p.content_id === song.id);
                return (
                  <Card key={song.id} className={alreadyAdded ? 'opacity-50' : ''}>
                    <CardContent className="py-3 flex items-center justify-between">
                      <span className="font-medium truncate">{song.title}</span>
                      <Button
                        size="sm"
                        variant={alreadyAdded ? 'outline' : 'default'}
                        onClick={() => !alreadyAdded && handleAddToOffline('music', song)}
                        disabled={alreadyAdded}
                        className="min-h-[40px]"
                      >
                        {alreadyAdded ? 'Added' : 'Add'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Stories */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Stories ({stories.length})
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {stories.slice(0, 10).map(story => {
                const alreadyAdded = offlinePriorities.some(p => p.content_id === story.id);
                return (
                  <Card key={story.id} className={alreadyAdded ? 'opacity-50' : ''}>
                    <CardContent className="py-3 flex items-center justify-between">
                      <span className="font-medium truncate">{story.title}</span>
                      <Button
                        size="sm"
                        variant={alreadyAdded ? 'outline' : 'default'}
                        onClick={() => !alreadyAdded && handleAddToOffline('story', story)}
                        disabled={alreadyAdded}
                        className="min-h-[40px]"
                      >
                        {alreadyAdded ? 'Added' : 'Add'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Memories */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Memories ({memories.length})
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {memories.slice(0, 10).map(memory => {
                const alreadyAdded = offlinePriorities.some(p => p.content_id === memory.id);
                return (
                  <Card key={memory.id} className={alreadyAdded ? 'opacity-50' : ''}>
                    <CardContent className="py-3 flex items-center justify-between">
                      <span className="font-medium truncate">{memory.title}</span>
                      <Button
                        size="sm"
                        variant={alreadyAdded ? 'outline' : 'default'}
                        onClick={() => !alreadyAdded && handleAddToOffline('memory', memory)}
                        disabled={alreadyAdded}
                        className="min-h-[40px]"
                      >
                        {alreadyAdded ? 'Added' : 'Add'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}