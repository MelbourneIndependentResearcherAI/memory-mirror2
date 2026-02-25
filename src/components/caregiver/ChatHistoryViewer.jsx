import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Calendar, ChevronDown, ChevronUp, Loader2, Heart, Brain } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function ChatHistoryViewer() {
  const [expandedId, setExpandedId] = useState(null);

  const { data: conversations = [], isLoading, isError } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 50)
  });

  const getAnxietyBadge = (level) => {
    if (!level && level !== 0) return null;
    if (level >= 7) return <Badge variant="destructive">High Anxiety ({level})</Badge>;
    if (level >= 4) return <Badge className="bg-yellow-500 hover:bg-yellow-600">Mild Anxiety ({level})</Badge>;
    return <Badge className="bg-green-500 hover:bg-green-600">Calm ({level})</Badge>;
  };

  const getEraBadge = (era) => {
    if (!era) return null;
    const colors = {
      '1940s': 'bg-amber-100 text-amber-800',
      '1960s': 'bg-orange-100 text-orange-800',
      '1980s': 'bg-purple-100 text-purple-800',
      'present': 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[era] || 'bg-slate-100 text-slate-800'}`}>
        {era}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-slate-600 dark:text-slate-400">Loading conversations...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16 text-slate-500 dark:text-slate-400">
        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>Unable to load chat history. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-blue-500" />
            Chat History
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Review past conversations and key moments
          </p>
        </div>
        {conversations.length > 0 && (
          <Badge variant="outline" className="text-sm">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {conversations.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No conversations yet</h3>
            <p className="text-slate-500 dark:text-slate-400">
              Conversations with Memory Mirror will appear here once they begin.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const isExpanded = expandedId === conv.id;
            const messages = conv.messages || [];
            const date = conv.created_date || conv.created_at;

            return (
              <Card
                key={conv.id}
                className="overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {date && (
                          <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(date), 'MMM d, yyyy · h:mm a')}
                          </span>
                        )}
                        {getEraBadge(conv.era || conv.detected_era)}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getAnxietyBadge(conv.anxiety_level || conv.max_anxiety_level)}
                        {conv.mood && (
                          <Badge variant="outline" className="text-xs">
                            <Heart className="w-3 h-3 mr-1" />
                            {conv.mood}
                          </Badge>
                        )}
                        {messages.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {messages.length} message{messages.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : conv.id)}
                      className="flex-shrink-0 min-h-[36px]"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Preview of last message */}
                  {!isExpanded && messages.length > 0 && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-1 italic">
                      &ldquo;{messages[messages.length - 1]?.content || messages[messages.length - 1]?.text || '...'}&rdquo;
                    </p>
                  )}
                  {!isExpanded && conv.summary && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-1">
                      {conv.summary}
                    </p>
                  )}
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 max-h-96 overflow-y-auto">
                      {messages.length > 0 ? (
                        messages.map((msg, idx) => {
                          const isUser = msg.role === 'user' || msg.sender === 'user';
                          const content = msg.content || msg.text || '';
                          return (
                            <div
                              key={idx}
                              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                                  isUser
                                    ? 'bg-blue-500 text-white rounded-br-md'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md'
                                }`}
                              >
                                {content}
                              </div>
                            </div>
                          );
                        })
                      ) : conv.summary ? (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <Brain className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                              Summary
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{conv.summary}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-4">
                          No message details available
                        </p>
                      )}
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
