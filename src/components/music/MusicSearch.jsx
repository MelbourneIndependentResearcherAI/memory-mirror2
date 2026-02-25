import React, { useState } from 'react';
import { Search, Music, Plus, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

export default function MusicSearch({ onAddToPlaylist }) {
  const [query, setQuery] = useState('');
  const [era, setEra] = useState('');
  const [source, setSource] = useState('youtube');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setMessage('');
    
    try {
      const response = await base44.functions.invoke('searchMusic', {
        query: query.trim(),
        era: era || undefined,
        source
      });

      if (response.data.message) {
        setMessage(response.data.message);
      }
      
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setMessage('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search for songs or artists..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[44px]"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching} className="min-h-[44px] min-w-[44px]">
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </Button>
        </div>

        <div className="flex gap-2">
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-40 min-h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="spotify">Spotify</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>

          <Select value={era} onValueChange={setEra}>
            <SelectTrigger className="w-40 min-h-[44px]">
              <SelectValue placeholder="Any Era" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Any Era</SelectItem>
              <SelectItem value="1940s">1940s</SelectItem>
              <SelectItem value="1960s">1960s</SelectItem>
              <SelectItem value="1980s">1980s</SelectItem>
              <SelectItem value="present">Present</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {message && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">{message}</p>
        </div>
      )}

      <div className="space-y-3">
        {results.map((song, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {song.thumbnail && (
                  <img src={song.thumbnail} alt={song.title} className="w-16 h-16 rounded object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{song.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{song.artist}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {song.source}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => window.open(song.url, '_blank')}
                    className="min-h-[44px] min-w-[44px]"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  {onAddToPlaylist && (
                    <Button
                      size="icon"
                      onClick={() => onAddToPlaylist(song)}
                      className="min-h-[44px] min-w-[44px]"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {results.length === 0 && !isSearching && !message && (
          <div className="text-center py-12 text-slate-500">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Search for songs to add to your playlist</p>
          </div>
        )}
      </div>
    </div>
  );
}