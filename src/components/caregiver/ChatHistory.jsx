import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

export default function ChatHistory({ onBack }) {
  const [expandedConversation, setExpandedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 100)
  });

  const filtered = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (conv.session_theme || '').toLowerCase().includes(q) ||
      (conv.era_detected || '').toLowerCase().includes(q) ||
      (conv.conversation_summary || '').toLowerCase().includes(q)
    );
  });

  const getEraColor = (era) => {
    switch (era) {
      case '1940s': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case '1960s': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case '1980s': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  const getMoodIcon = (anxietyLevel) => {
    if (!anxietyLevel) return '😊';
    if (anxietyLevel >= 7) return '😟';
    if (anxietyLevel >= 4) return '😐';
    return '😊';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 dark:text-slate-400">Loading conversation history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="min-h-[44px] min-w-[44px]">
              <ChevronUp className="w-5 h-5" />
            </Button>
          )}
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            Chat History
          </h2>
        </div>
        <Badge variant="outline" className="text-sm">
          {conversations.length} Sessions
        </Badge>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by theme, era, or summary..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery ? 'No conversations match your search' : 'No conversation history yet'}
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
              {!searchQuery && 'Conversations will appear here after chat sessions'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((conv, idx) => (
            <Card key={conv.id || idx} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl">{getMoodIcon(conv.anxiety_level)}</span>
                    <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                      {conv.session_theme || 'General Conversation'}
                    </CardTitle>
                    {conv.era_detected && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getEraColor(conv.era_detected)}`}>
                        {conv.era_detected}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {conv.anxiety_level !== undefined && (
                      <Badge
                        variant="outline"
                        className={conv.anxiety_level >= 7 ? 'border-red-300 text-red-600' : conv.anxiety_level >= 4 ? 'border-yellow-300 text-yellow-600' : 'border-green-300 text-green-600'}
                      >
                        Mood {conv.anxiety_level}/10
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setExpandedConversation(expandedConversation === (conv.id || idx) ? null : (conv.id || idx))}
                    >
                      {expandedConversation === (conv.id || idx) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <Clock className="w-3 h-3" />
                  {conv.created_date
                    ? format(new Date(conv.created_date), 'MMM d, yyyy • h:mm a')
                    : 'Date unknown'}
                  {conv.message_count != null && (
                    <span className="ml-2">· {conv.message_count} messages</span>
                  )}
                </div>
              </CardHeader>

              {expandedConversation === (conv.id || idx) && (
                <CardContent className="pt-0 border-t border-slate-100 dark:border-slate-800">
                  {conv.conversation_summary ? (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Summary</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{conv.conversation_summary}</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400 italic">No summary available for this session.</p>
                  )}
                  {conv.key_moments && conv.key_moments.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Key Moments</p>
                      <ul className="space-y-1">
                        {conv.key_moments.map((moment, i) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5">•</span>
                            {moment}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {conv.topics_discussed && conv.topics_discussed.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {conv.topics_discussed.map((topic, i) => (
                        <span key={i} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
