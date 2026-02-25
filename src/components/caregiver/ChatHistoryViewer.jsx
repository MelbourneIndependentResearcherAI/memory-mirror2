import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Clock, ChevronDown, ChevronUp, Search, ArrowLeft, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

function getEraLabel(era) {
  const labels = {
    '1940s': '1940s Era',
    '1960s': '1960s Era',
    '1980s': '1980s Era',
    'present': 'Present Day',
  };
  return labels[era] || era || 'Unknown';
}

export default function ChatHistoryViewer({ onBack }) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['chatHistoryViewer'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 100).catch(() => []),
  });

  const filtered = conversations.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.summary || '').toLowerCase().includes(q) ||
      (c.detected_era || '').toLowerCase().includes(q) ||
      (c.session_theme || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 min-h-[44px]">
          <ArrowLeft className="w-5 h-5" /> Back
        </Button>
      )}

      <CardTitle className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-blue-500" />
        Conversation History
      </CardTitle>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No conversations found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(conv => {
            const isExpanded = expandedId === conv.id;
            const date = conv.created_date || conv.date;
            const messages = conv.messages ? (typeof conv.messages === 'string' ? JSON.parse(conv.messages) : conv.messages) : [];
            return (
              <Card key={conv.id} className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 items-center">
                        {date && (
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {format(new Date(date), 'MMM d, yyyy — h:mm a')}
                          </span>
                        )}
                        {conv.detected_era && (
                          <Badge variant="outline" className="text-xs">{getEraLabel(conv.detected_era)}</Badge>
                        )}
                        {conv.anxiety_level != null && (
                          <Badge className={conv.anxiety_level >= 7 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                            Anxiety: {conv.anxiety_level}/10
                          </Badge>
                        )}
                      </div>
                      {conv.message_count != null && (
                        <p className="text-xs text-slate-500 mt-1">{conv.message_count} messages</p>
                      )}
                      {conv.summary && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{conv.summary}</p>
                      )}
                    </div>
                    {messages.length > 0 && (
                      <Button variant="ghost" size="icon" onClick={() => setExpandedId(isExpanded ? null : conv.id)} className="min-h-[36px] min-w-[36px]">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                {isExpanded && messages.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="space-y-2 max-h-64 overflow-y-auto border-t border-slate-100 dark:border-slate-800 pt-3">
                      {messages.map((m, i) => (
                        <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            m.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}>
                            {m.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
