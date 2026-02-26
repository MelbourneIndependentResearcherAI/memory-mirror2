import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Music2, Heart, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SingAlongPlayer from '@/components/music/SingAlongPlayer';
import { motion } from 'framer-motion';

export default function SingAlongStudio() {
  const [selectedSong, setSelectedSong] = useState(null);
  const [currentEra, setCurrentEra] = useState('timeless');

  const { data: songs = [] } = useQuery({
    queryKey: ['singAlongSongs'],
    queryFn: () => base44.entities.SingAlongSong.list()
  });

  const eraOptions = ['timeless', '1940s', '1960s', '1980s'];
  const filteredSongs = songs.filter(s => 
    s.era === currentEra || s.era === 'timeless'
  );

  const songStats = {
    total: songs.length,
    nurseryRhymes: songs.filter(s => s.category === 'nursery_rhyme').length,
    classicSongs: songs.filter(s => s.category === 'classic_song').length,
    hymns: songs.filter(s => s.category === 'hymn').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 pb-20">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music2 className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Sing-Along Studio
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Sing along to your favorite songs, nursery rhymes, and classics
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Songs', value: songStats.total, icon: Music2, color: 'purple' },
            { label: 'Nursery Rhymes', value: songStats.nurseryRhymes, icon: Heart, color: 'pink' },
            { label: 'Classics', value: songStats.classicSongs, icon: Zap, color: 'blue' },
            { label: 'Hymns', value: songStats.hymns, icon: Clock, color: 'indigo' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-4 text-center dark:bg-slate-800">
                  <Icon className={`w-6 h-6 mx-auto mb-2 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {stat.label}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Era Selection */}
        <div className="space-y-3">
          <h2 className="font-bold text-slate-900 dark:text-white">Choose an Era</h2>
          <div className="flex flex-wrap gap-2">
            {eraOptions.map(era => (
              <Button
                key={era}
                onClick={() => setCurrentEra(era)}
                variant={currentEra === era ? 'default' : 'outline'}
                className={currentEra === era ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                {era === 'timeless' ? '✨ All Time' : `📅 ${era}`}
              </Button>
            ))}
          </div>
        </div>

        {/* Song Grid */}
        <div className="space-y-3">
          <h2 className="font-bold text-slate-900 dark:text-white">
            Available Songs ({filteredSongs.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSongs.map((song, idx) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedSong(song)}
              >
                <Card className="p-4 cursor-pointer hover:shadow-lg transition-all dark:bg-slate-800 hover:border-purple-400 dark:hover:border-purple-600 border-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {song.title}
                      </h3>
                      {song.artist && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {song.artist}
                        </p>
                      )}
                    </div>
                    {song.popular && (
                      <Heart className="w-5 h-5 text-red-500 fill-red-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                      {song.category?.replace('_', ' ')}
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                      {song.mood}
                    </span>
                    {song.lyrics?.length && (
                      <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                        {song.lyrics.length} lines
                      </span>
                    )}
                  </div>

                  {song.times_sung > 0 && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
                      🎤 Sung {song.times_sung} times
                    </p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {filteredSongs.length === 0 && (
          <Card className="p-8 text-center dark:bg-slate-800">
            <Music2 className="w-12 h-12 mx-auto mb-3 opacity-50 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400">
              No songs available for this era.
            </p>
          </Card>
        )}
      </div>

      {/* Sing-Along Modal */}
      {selectedSong && (
        <SingAlongPlayer
          currentEra={currentEra}
          onClose={() => setSelectedSong(null)}
        />
      )}
    </div>
  );
}