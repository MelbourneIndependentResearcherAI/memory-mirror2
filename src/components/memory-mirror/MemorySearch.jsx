import React, { useState } from 'react';
import { Search, Loader2, Sparkles, Calendar, Users, MapPin, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemorySearch({ onSelectMemory, currentEra = 'present' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please describe what you\'re looking for');
      return;
    }

    setIsSearching(true);
    try {
      const response = await base44.functions.invoke('searchMemories', {
        natural_query: query,
        current_era: currentEra,
        search_type: 'comprehensive'
      });

      setResults(response.data);
      
      if (response.data.memories?.length === 0 && response.data.photos?.length === 0) {
        toast.info('No memories found for this search');
      } else {
        toast.success(`Found ${(response.data.memories?.length || 0) + (response.data.photos?.length || 0)} results`);
      }
    } catch (error) {
      console.error('Memory search error:', error);
      toast.error('Search failed. Please try again.');
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
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="E.g., 'photos from our wedding' or 'memories about mom'"
            className="pl-10 h-14 text-base"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="h-14 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {results.interpretation && (
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
                <CardContent className="pt-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                    💭 {results.interpretation}
                  </p>
                </CardContent>
              </Card>
            )}

            {results.photos?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  📸 Photos ({results.photos.length})
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {results.photos.map((photo) => (
                    <Card
                      key={photo.id}
                      className="cursor-pointer hover:shadow-lg transition-all dark:bg-slate-800"
                      onClick={() => onSelectMemory('photo', photo)}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {photo.media_url && (
                            <img
                              src={photo.media_url}
                              alt={photo.title}
                              className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                              {photo.title}
                            </h4>
                            {photo.caption && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                                {photo.caption}
                              </p>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              {photo.era && (
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {photo.era}
                                </Badge>
                              )}
                              {photo.people_in_media?.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <Users className="w-3 h-3 mr-1" />
                                  {photo.people_in_media[0]}
                                  {photo.people_in_media.length > 1 && ` +${photo.people_in_media.length - 1}`}
                                </Badge>
                              )}
                              {photo.relevance_score && (
                                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">
                                  {Math.round(photo.relevance_score * 100)}% match
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {results.memories?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  💭 Memories ({results.memories.length})
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {results.memories.map((memory) => (
                    <Card
                      key={memory.id}
                      className="cursor-pointer hover:shadow-lg transition-all dark:bg-slate-800"
                      onClick={() => onSelectMemory('memory', memory)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Heart className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                              {memory.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                              {memory.description}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {memory.era && (
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {memory.era}
                                </Badge>
                              )}
                              {memory.emotional_tone && (
                                <Badge className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 text-xs capitalize">
                                  {memory.emotional_tone}
                                </Badge>
                              )}
                              {memory.location && (
                                <Badge variant="outline" className="text-xs">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {memory.location}
                                </Badge>
                              )}
                              {memory.relevance_score && (
                                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">
                                  {Math.round(memory.relevance_score * 100)}% match
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {results && results.memories?.length === 0 && results.photos?.length === 0 && (
              <Card className="bg-slate-50 dark:bg-slate-800">
                <CardContent className="pt-6 pb-6 text-center">
                  <p className="text-slate-600 dark:text-slate-400">
                    No memories found. Try a different search or add more memories to your library.
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!results && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6 pb-6">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              AI-Powered Memory Search
            </h4>
            <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <p><strong>Example searches:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• "Show me photos from the 1960s"</li>
                <li>• "Memories about my wedding day"</li>
                <li>• "Happy memories with mom"</li>
                <li>• "Photos with grandchildren"</li>
                <li>• "Memories from our vacation"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}