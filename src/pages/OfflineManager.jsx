import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, WifiOff, Wifi, HardDrive, Download, Trash2,
  CheckCircle2, RefreshCw, Image, Music, BookOpen, Brain,
  AlertCircle, CloudOff, CloudDownload, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  downloadPhotoForOffline,
  downloadMusicForOffline,
  downloadStoryForOffline,
  downloadMemoryForOffline,
  getCachedContent,
  getOfflineContentSize
} from '@/components/utils/offlineContentSync';
import { offlineSyncManager } from '@/components/utils/offlineSyncManager';
import { initOfflineStorage, deleteFromStore, STORES } from '@/components/utils/offlineStorage';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtSize(kb) {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

const CONTENT_TYPES = [
  { key: 'photo',  label: 'Photos',   icon: Image,    store: STORES.familyMedia, entity: 'FamilyMedia', estKB: 500 },
  { key: 'music',  label: 'Music',    icon: Music,    store: STORES.music,       entity: 'Music',       estKB: 3000 },
  { key: 'story',  label: 'Stories',  icon: BookOpen, store: STORES.stories,     entity: 'Story',       estKB: 50 },
  { key: 'memory', label: 'Memories', icon: Brain,    store: STORES.memories,    entity: 'Memory',      estKB: 200 },
];

// ─── ContentRow ─────────────────────────────────────────────────────────────

function ContentRow({ item, type, cachedIds, onDownload, onDelete, downloading }) {
  const isCached = cachedIds.has(item.id);
  const isDownloading = downloading === item.id;
  const Icon = type.icon;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-500 transition-all">
      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
        {item.media_url && type.key === 'photo' ? (
          <img src={item.media_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <Icon className="w-5 h-5 text-slate-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{item.title || item.name || 'Untitled'}</p>
        <p className="text-xs text-slate-400 truncate">
          {item.artist || item.era || item.theme || ''} · ~{fmtSize(type.estKB)}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isCached && (
          <Badge className="bg-green-900/60 text-green-300 border-green-700 text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />Saved
          </Badge>
        )}
        {isCached ? (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/30"
            onClick={() => onDelete(item.id, type)}
            title="Remove offline copy"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            className="h-8 bg-blue-600 hover:bg-blue-500 text-white px-3"
            onClick={() => onDownload(item, type)}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <><Download className="w-3.5 h-3.5 mr-1" />Save</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── StorageBar ──────────────────────────────────────────────────────────────

function StorageBar({ storageInfo, offlineSize }) {
  const used = parseFloat(storageInfo.used) || 0;
  const total = parseFloat(storageInfo.total) || 1;
  const pct = Math.min((used / total) * 100, 100);
  return (
    <div className="space-y-1">
      <Progress value={pct} className="h-2" />
      <div className="flex justify-between text-xs text-slate-400">
        <span>{used.toFixed(1)} MB used</span>
        <span>{total.toFixed(0)} MB total</span>
      </div>
      {offlineSize?.totalItems > 0 && (
        <p className="text-xs text-blue-400">
          {offlineSize.totalItems} offline items · {offlineSize.totalSizeMB} MB cached
        </p>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function OfflineManagerPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloading, setDownloading] = useState(null); // item id
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [cachedIdsByType, setCachedIdsByType] = useState({}); // { photo: Set, music: Set, ... }
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0 });
  const [offlineSize, setOfflineSize] = useState(null);

  // ── network status ──
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  // ── storage info ──
  const loadStorageInfo = useCallback(async () => {
    if (navigator.storage?.estimate) {
      const est = await navigator.storage.estimate();
      setStorageInfo({
        used: ((est.usage || 0) / 1024 / 1024).toFixed(2),
        total: ((est.quota || 0) / 1024 / 1024).toFixed(0)
      });
    }
    const size = await getOfflineContentSize();
    setOfflineSize(size);
  }, []);

  // ── cached ids ──
  const loadCachedIds = useCallback(async () => {
    const result = {};
    for (const type of CONTENT_TYPES) {
      const cached = await getCachedContent(type.key);
      result[type.key] = new Set(cached.map(c => c.id));
    }
    setCachedIdsByType(result);
  }, []);

  useEffect(() => {
    initOfflineStorage().then(() => {
      loadStorageInfo();
      loadCachedIds();
    });
  }, [loadStorageInfo, loadCachedIds]);

  // ── fetch data from API ──
  const { data: photos = [] }   = useQuery({ queryKey: ['offline-photos'],   queryFn: () => base44.entities.FamilyMedia.list('-created_date', 50) });
  const { data: music = [] }    = useQuery({ queryKey: ['offline-music'],    queryFn: () => base44.entities.Music.list('-created_date', 50) });
  const { data: stories = [] }  = useQuery({ queryKey: ['offline-stories'],  queryFn: () => base44.entities.Story.list('-created_date', 50) });
  const { data: memories = [] } = useQuery({ queryKey: ['offline-memories'], queryFn: () => base44.entities.Memory.list('-created_date', 50) });

  const dataByType = { photo: photos, music, story: stories, memory: memories };

  // ── download one item ──
  const handleDownload = async (item, type) => {
    setDownloading(item.id);
    try {
      if (type.key === 'photo')  await downloadPhotoForOffline(item);
      if (type.key === 'music')  await downloadMusicForOffline(item);
      if (type.key === 'story')  await downloadStoryForOffline(item);
      if (type.key === 'memory') await downloadMemoryForOffline(item);
      toast.success(`"${item.title || 'Item'}" saved for offline use`);
      await loadCachedIds();
      await loadStorageInfo();
    } catch (e) {
      toast.error(`Download failed: ${e.message}`);
    } finally {
      setDownloading(null);
    }
  };

  // ── delete one item ──
  const handleDelete = async (itemId, type) => {
    try {
      await deleteFromStore(type.store, itemId);
      toast.success('Removed offline copy');
      await loadCachedIds();
      await loadStorageInfo();
    } catch (e) {
      toast.error('Could not remove item');
    }
  };

  // ── download all visible items of a type ──
  const handleDownloadAll = async (type) => {
    const items = (dataByType[type.key] || []).filter(i => !(cachedIdsByType[type.key] || new Set()).has(i.id));
    if (!items.length) { toast.info('All items already saved'); return; }
    toast.info(`Downloading ${items.length} ${type.label.toLowerCase()}…`);
    for (const item of items) {
      setDownloading(item.id);
      try {
        if (type.key === 'photo')  await downloadPhotoForOffline(item);
        if (type.key === 'music')  await downloadMusicForOffline(item);
        if (type.key === 'story')  await downloadStoryForOffline(item);
        if (type.key === 'memory') await downloadMemoryForOffline(item);
      } catch (_) { /* skip failed */ }
    }
    setDownloading(null);
    await loadCachedIds();
    await loadStorageInfo();
    toast.success(`Downloaded ${items.length} ${type.label.toLowerCase()}`);
  };

  // ── sync pending changes ──
  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('Syncing pending changes…');
    try {
      await offlineSyncManager.syncPendingChanges();
      setSyncMsg('Sync complete ✓');
      toast.success('All changes synced');
      queryClient.invalidateQueries();
    } catch (e) {
      setSyncMsg('Sync error: ' + e.message);
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(''), 3000);
    }
  };

  // ── count cached per type ──
  const cachedCount = type => (cachedIdsByType[type] || new Set()).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CloudOff className="w-6 h-6 text-blue-400" />
              Offline Manager
            </h1>
            <p className="text-sm text-slate-400">Download content to use without internet</p>
          </div>
          <div className="ml-auto">
            {isOnline ? (
              <Badge className="bg-green-900/60 text-green-300 border-green-700">
                <Wifi className="w-3 h-3 mr-1" />Online
              </Badge>
            ) : (
              <Badge className="bg-red-900/60 text-red-300 border-red-700">
                <WifiOff className="w-3 h-3 mr-1" />Offline
              </Badge>
            )}
          </div>
        </div>

        {/* Storage + Sync Row */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-800/70 border-slate-700">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <HardDrive className="w-4 h-4" />Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <StorageBar storageInfo={storageInfo} offlineSize={offlineSize} />
            </CardContent>
          </Card>

          <Card className="bg-slate-800/70 border-slate-700">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />Sync
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <Button
                onClick={handleSync}
                disabled={!isOnline || syncing}
                className="w-full h-8 bg-blue-600 hover:bg-blue-500 text-sm"
              >
                {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                {syncing ? 'Syncing…' : 'Sync Now'}
              </Button>
              {syncMsg && <p className="text-xs text-blue-300">{syncMsg}</p>}
              {!isOnline && <p className="text-xs text-slate-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Offline — sync when back online</p>}
            </CardContent>
          </Card>
        </div>

        {/* Cached summary pills */}
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map(type => {
            const count = cachedCount(type.key);
            const Icon = type.icon;
            return (
              <div key={type.key} className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-full px-3 py-1 text-sm">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300">{type.label}</span>
                <span className={`font-semibold ${count > 0 ? 'text-green-400' : 'text-slate-500'}`}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* Content tabs */}
        <Tabs defaultValue="photo">
          <TabsList className="grid grid-cols-4 bg-slate-800 border border-slate-700">
            {CONTENT_TYPES.map(type => {
              const Icon = type.icon;
              return (
                <TabsTrigger key={type.key} value={type.key} className="data-[state=active]:bg-blue-600">
                  <Icon className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline text-xs">{type.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {CONTENT_TYPES.map(type => {
            const items = dataByType[type.key] || [];
            const cached = cachedIdsByType[type.key] || new Set();
            const uncachedCount = items.filter(i => !cached.has(i.id)).length;
            return (
              <TabsContent key={type.key} value={type.key} className="space-y-3 mt-4">
                {/* Download All bar */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                  <span className="text-sm text-slate-300">
                    <span className="font-semibold text-white">{cached.size}</span> of <span className="font-semibold text-white">{items.length}</span> {type.label.toLowerCase()} saved offline
                  </span>
                  {uncachedCount > 0 && (
                    <Button
                      size="sm"
                      className="h-8 bg-indigo-600 hover:bg-indigo-500 text-xs"
                      onClick={() => handleDownloadAll(type)}
                      disabled={!!downloading}
                    >
                      <CloudDownload className="w-3.5 h-3.5 mr-1" />
                      Save All ({uncachedCount})
                    </Button>
                  )}
                </div>

                {/* Item list */}
                {items.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <type.icon className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No {type.label.toLowerCase()} found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map(item => (
                      <ContentRow
                        key={item.id}
                        item={item}
                        type={type}
                        cachedIds={cached}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        downloading={downloading}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}