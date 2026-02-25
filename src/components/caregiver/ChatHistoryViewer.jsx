import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, ChevronDown, ChevronUp, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

function groupByDate(logs) {
  return logs.reduce((acc, log) => {
    const raw = log.created_date || log.date || '';
    let day = 'Unknown date';
    try {
      const d = raw ? parseISO(raw) : null;
      if (d && isValid(d)) day = format(d, 'EEEE, MMMM d, yyyy');
    } catch {
      // ignore parse errors
    }
    if (!acc[day]) acc[day] = [];
    acc[day].push(log);
    return acc;
  }, {});
}

function AnxietyBadge({ level }) {
  if (!level) return null;
  const color =
    level >= 8 ? 'bg-red-100 text-red-700 border-red-300' :
    level >= 5 ? 'bg-amber-100 text-amber-700 border-amber-300' :
    'bg-green-100 text-green-700 border-green-300';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      <AlertTriangle className="w-3 h-3" />
      Anxiety {level}/10
    </span>
  );
}
import { MessageCircle, Clock, ChevronDown, ChevronUp, AlertTriangle, Calendar, TrendingDown } from 'lucide-react';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';

export default function ChatHistoryViewer({ onBack }) {
  const [expandedDay, setExpandedDay] = useState(null);

  const { data: chatLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['chatActivityLogs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 200),
  });

  const { data: anxietyTrends = [], isLoading: anxietyLoading } = useQuery({
    queryKey: ['anxietyTrendsHistory'],
    queryFn: () => base44.entities.AnxietyTrend.list('-created_date', 100),
  });

  const isLoading = logsLoading || anxietyLoading;

  // Filter to chat-related activity only
  const relevantLogs = chatLogs.filter(l =>
    l.activity_type === 'chat' || l.activity_type === 'anxiety_detected'
  );

  // Build a combined timeline: chat logs + anxiety trends
  const combined = [
    ...relevantLogs.map(l => ({ ...l, _type: 'activity' })),
    ...anxietyTrends.map(t => ({ ...t, created_date: t.created_date || t.date, _type: 'anxiety' })),
  ].sort((a, b) => {
    const da = new Date(a.created_date || 0);
    const db = new Date(b.created_date || 0);
    return db - da;
  });

  const grouped = groupByDate(combined);
  const days = Object.keys(grouped);

  const formatTime = (raw) => {
    try {
      const d = raw ? parseISO(raw) : null;
      return d && isValid(d) ? format(d, 'h:mm a') : '';
    } catch {
      return '';
    }
  const { data: activityLogs = [], isLoading } = useQuery({
    queryKey: ['chatActivityLogs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 200)
  });

  const chatLogs = activityLogs.filter(
    (log) => log.activity_type === 'chat' || log.activity_type === 'anxiety_detected'
  );

  // Group logs by day
  const groupedByDay = chatLogs.reduce((acc, log) => {
    const dateKey = format(startOfDay(new Date(log.created_date)), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(log);
    return acc;
  }, {});

  const sortedDays = Object.keys(groupedByDay).sort((a, b) => b.localeCompare(a));

  const getDayLabel = (dateKey) => {
    const date = new Date(dateKey);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const getAnxietyBadgeVariant = (level) => {
    if (level >= 8) return 'destructive';
    if (level >= 5) return 'secondary';
    return 'outline';
  };

  const getActivityIcon = (type) => {
    if (type === 'anxiety_detected') return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    return <MessageCircle className="w-4 h-4 text-blue-500" />;
  };

  const formatActivityLabel = (log) => {
    if (log.activity_type === 'anxiety_detected') {
      return `Anxiety detected — level ${log.anxiety_level ?? '?'}/10`;
    }
    const details = log.details || {};
    if (details.proactive) return 'Proactive check-in';
    if (details.message_length) return `Chat message (${details.message_length} chars)`;
    return 'Chat session';
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
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading chat history...</div>
        <div className="text-slate-500">Loading chat history…</div>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="min-h-[44px] min-w-[44px]">
              <ChevronUp className="w-5 h-5" />
            </Button>
          )}
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            Chat History
          </h2>
        </div>
        <Badge variant="outline" className="text-sm">
          {combined.length} Events
        </Badge>
      </div>

      {/* Empty state */}
      {days.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No chat history recorded yet</p>
            <p className="text-sm text-slate-400 mt-2">
              Conversations will appear here once your loved one starts using the AI companion
            </p>
          </CardContent>
        </Card>
      )}

      {/* Day groups */}
      {days.map((day) => {
        const entries = grouped[day];
        const chatCount = entries.filter(e => e.activity_type === 'chat').length;
        const anxietyEntries = entries.filter(e =>
          e.activity_type === 'anxiety_detected' || e._type === 'anxiety'
        );
        const maxAnxiety = anxietyEntries.length > 0
          ? Math.max(...anxietyEntries.map(e => e.anxiety_level || 0))
          : null;
        const isExpanded = expandedDay === day;

        return (
          <Card key={day} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors py-4"
              onClick={() => setExpandedDay(isExpanded ? null : day)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  {day}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {chatCount} message{chatCount !== 1 ? 's' : ''}
                  </span>
                  {maxAnxiety !== null && maxAnxiety > 0 && (
                    <AnxietyBadge level={maxAnxiety} />
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0 pb-4">
                <div className="space-y-2 mt-2">
                  {entries.map((entry, idx) => {
                    const time = formatTime(entry.created_date);
                    const isAnxiety =
                      entry.activity_type === 'anxiety_detected' || entry._type === 'anxiety';

                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                          isAnxiety
                            ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800'
                            : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isAnxiety ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          ) : (
                            <MessageCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {isAnxiety ? 'Anxiety detected' : 'Chat message'}
                            </span>
                            {time && (
                              <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                                <Clock className="w-3 h-3" />
                                {time}
                              </span>
                            )}
                          </div>
                          {entry.anxiety_level > 0 && (
                            <AnxietyBadge level={entry.anxiety_level} />
                          )}
                          {entry.details && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
                              {entry.details.era && (
                                <span className="inline-block mr-3">Era: {entry.details.era}</span>
                              )}
                              {entry.details.language && entry.details.language !== 'en' && (
                                <span className="inline-block mr-3">Language: {entry.details.language.toUpperCase()}</span>
                              )}
                              {entry.details.trigger && (
                                <p className="truncate">Trigger: {entry.details.trigger}</p>
                              )}
                              {entry.details.type === 'time_based' && (
                                <span className="inline-block">Proactive check-in</span>
                              )}
                            </div>
                          )}
                          {entry.trigger_category && entry.trigger_category !== 'none' && (
                            <p className="text-xs text-slate-500 mt-1">
                              Category: {entry.trigger_category}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
          {chatLogs.length} events
        </Badge>
      </div>

      {/* Summary stats */}
      {chatLogs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <div className="text-2xl font-bold">{sortedDays.length}</div>
              <div className="text-xs text-slate-500">Active days</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <div className="text-2xl font-bold">
                {chatLogs.filter((l) => l.activity_type === 'chat').length}
              </div>
              <div className="text-xs text-slate-500">Chat interactions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingDown className="w-6 h-6 text-orange-500 mx-auto mb-1" />
              <div className="text-2xl font-bold">
                {chatLogs.filter((l) => l.activity_type === 'anxiety_detected').length}
              </div>
              <div className="text-xs text-slate-500">Anxiety events</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {chatLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No chat history recorded yet</p>
            <p className="text-sm text-slate-400 mt-2">
              Conversations with your loved one will appear here
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
          {sortedDays.map((dateKey) => {
            const dayLogs = groupedByDay[dateKey];
            const isExpanded = expandedDay === dateKey;
            const anxietyEvents = dayLogs.filter((l) => l.activity_type === 'anxiety_detected');
            const chatEvents = dayLogs.filter((l) => l.activity_type === 'chat');

            return (
              <Card key={dateKey} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-base">{getDayLabel(dateKey)}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                          <MessageCircle className="w-3 h-3" />
                          <span>{chatEvents.length} chat{chatEvents.length !== 1 ? 's' : ''}</span>
                          {anxietyEvents.length > 0 && (
                            <>
                              <span>·</span>
                              <AlertTriangle className="w-3 h-3 text-orange-500" />
                              <span className="text-orange-600">
                                {anxietyEvents.length} anxiety event{anxietyEvents.length !== 1 ? 's' : ''}
                              </span>
                            </>
                          )}
                        </div>
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
                      onClick={() => setExpandedDay(isExpanded ? null : dateKey)}
                      className="min-h-[44px]"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
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
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {dayLogs.map((log) => (
                        <div
                          key={log.id}
                          className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                            log.activity_type === 'anxiety_detected'
                              ? 'bg-orange-50 dark:bg-orange-950/20'
                              : 'bg-slate-50 dark:bg-slate-800/40'
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0">{getActivityIcon(log.activity_type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {formatActivityLabel(log)}
                            </div>
                            {log.details?.trigger && (
                              <div className="text-xs text-slate-500 mt-0.5 truncate">
                                "{log.details.trigger}"
                              </div>
                            )}
                            {log.details?.era && log.details.era !== 'auto' && (
                              <div className="text-xs text-slate-400 mt-0.5">
                                Era: {log.details.era}
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0 flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock className="w-3 h-3" />
                              {format(new Date(log.created_date), 'h:mm a')}
                            </div>
                            {log.anxiety_level != null && (
                              <Badge variant={getAnxietyBadgeVariant(log.anxiety_level)} className="text-xs">
                                Anxiety {log.anxiety_level}/10
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
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
