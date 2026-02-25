import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, AlertTriangle, Clock, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

export default function ChatHistory({ onBack }) {
  const [expandedGroup, setExpandedGroup] = useState(null);

  const { data: activityLogs = [], isLoading } = useQuery({
    queryKey: ['chatActivityLogs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 200).catch(() => [])
  });

  const { data: anxietyTrends = [] } = useQuery({
    queryKey: ['anxietyTrendsChat'],
    queryFn: () => base44.entities.AnxietyTrend.list('-date', 50).catch(() => [])
  });

  // Filter to chat-related activity logs
  const chatLogs = activityLogs.filter(log =>
    log.activity_type === 'chat' || log.activity_type === 'anxiety_detected'
  );

  // Group logs by day
  const groupedByDay = chatLogs.reduce((groups, log) => {
    const date = log.created_date ? format(parseISO(log.created_date), 'yyyy-MM-dd') : 'unknown';
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
    return groups;
  }, {});

  const sortedDays = Object.keys(groupedByDay).sort((a, b) => b.localeCompare(a));

  const getDayLabel = (dateStr) => {
    if (dateStr === 'unknown') return 'Unknown Date';
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return 'Today';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'EEEE, MMMM d');
    } catch {
      return dateStr;
    }
  };

  const getAnxietyBadge = (level) => {
    if (!level && level !== 0) return null;
    if (level >= 8) return <Badge className="bg-red-500 text-white text-xs">High Anxiety {level}/10</Badge>;
    if (level >= 5) return <Badge className="bg-yellow-500 text-white text-xs">Moderate {level}/10</Badge>;
    return <Badge className="bg-green-500 text-white text-xs">Calm {level}/10</Badge>;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'anxiety_detected': return '⚠️';
      default: return '💬';
    }
  };

  const formatActivityDetails = (log) => {
    if (!log.details) return null;
    const parts = [];
    if (log.details.era && log.details.era !== 'auto') parts.push(`Era: ${log.details.era}`);
    if (log.details.language && log.details.language !== 'en') parts.push(`Language: ${log.details.language}`);
    if (log.details.message_length) parts.push(`${log.details.message_length} chars`);
    if (log.details.trigger) parts.push(`Trigger: "${log.details.trigger.substring(0, 60)}..."`);
    return parts.length > 0 ? parts.join(' · ') : null;
  };

  // Summary stats
  const totalSessions = chatLogs.filter(l => l.activity_type === 'chat').length;
  const highAnxietyEvents = chatLogs.filter(l => l.anxiety_level >= 8).length;
  const avgAnxiety = anxietyTrends.length > 0
    ? (anxietyTrends.reduce((sum, t) => sum + (t.anxiety_level || 0), 0) / anxietyTrends.length).toFixed(1)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading chat history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
          {totalSessions} Sessions
        </Badge>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-blue-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalSessions}</p>
              <p className="text-sm text-slate-500">Total Chat Sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{highAnxietyEvents}</p>
              <p className="text-sm text-slate-500">High Anxiety Events</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-8 h-8 text-green-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {avgAnxiety !== null ? `${avgAnxiety}/10` : '—'}
              </p>
              <p className="text-sm text-slate-500">Avg Anxiety Level</p>
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

function AnxietyBadge({ level }) {
  if (!level && level !== 0) return null;
  const color = level >= 7 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    : level >= 4 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  return <Badge className={color}>Anxiety: {level}/10</Badge>;
}

function ConversationCard({ session }) {
  const [expanded, setExpanded] = useState(false);
  const date = session.created_date || session.date;
  const topics = session.conversation_topics || session.topics || [];
  const summary = session.summary || session.details?.summary || '';
  const msgCount = session.message_count || session.details?.message_count || session.interaction_count;

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {date ? format(new Date(date), 'MMM d, yyyy — h:mm a') : 'Unknown date'}
                </span>
                {session.anxiety_level != null && <AnxietyBadge level={session.anxiety_level} />}
              </div>
              {msgCount && (
                <p className="text-xs text-slate-500 mb-1">{msgCount} message{msgCount !== 1 ? 's' : ''}</p>
              )}
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {topics.slice(0, 4).map((t, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                  {topics.length > 4 && <Badge variant="outline" className="text-xs">+{topics.length - 4} more</Badge>}
                </div>
              )}
              {summary && (
                <p className={`text-sm text-slate-600 dark:text-slate-400 ${!expanded ? 'line-clamp-2' : ''}`}>
                  {summary}
                </p>
              )}
            </div>
          </div>
          {summary && summary.length > 100 && (
            <Button variant="ghost" size="icon" onClick={() => setExpanded(v => !v)} className="min-h-[36px] min-w-[36px] flex-shrink-0">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ChatHistory({ onBack }) {
  const { data: activityLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['chat-activity-logs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 100),
    select: (data) => data.filter(l => l.activity_type === 'chat'),
  });

  const { data: anxietyTrends = [], isLoading: loadingTrends } = useQuery({
    queryKey: ['anxiety-trends-chat'],
    queryFn: () => base44.entities.AnxietyTrend.list('-date', 30),
  });

  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations-history'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 50),
  });

  const isLoading = loadingLogs || loadingTrends || loadingConversations;

  // Merge all chat-related records, preferring Conversation over ActivityLog entries
  const allSessions = [
    ...conversations.map(c => ({ ...c, _source: 'conversation' })),
    ...activityLogs.map(l => ({
      id: l.id,
      created_date: l.created_date,
      anxiety_level: l.anxiety_level,
      conversation_topics: l.details?.conversation_topics,
      message_count: l.details?.message_count,
      summary: l.details?.summary,
      _source: 'activity_log',
    })),
  ].sort((a, b) => new Date(b.created_date || b.date || 0) - new Date(a.created_date || a.date || 0));

  const avgAnxiety = anxietyTrends.length > 0
    ? (anxietyTrends.reduce((s, t) => s + (t.anxiety_level || 0), 0) / anxietyTrends.length).toFixed(1)
    : null;

  const totalInteractions = anxietyTrends.reduce((s, t) => s + (t.interaction_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{allSessions.length}</p>
              <p className="text-xs text-slate-500">Chat sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{totalInteractions}</p>
              <p className="text-xs text-slate-500">Total interactions (30 days)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{avgAnxiety ?? '—'}{avgAnxiety ? '/10' : ''}</p>
              <p className="text-xs text-slate-500">Avg anxiety level (30 days)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily logs */}
      {sortedDays.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No chat history recorded yet</p>
            <p className="text-sm text-slate-400 mt-2">
              Chat sessions will appear here once your loved one starts using Memory Mirror
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedDays.map((day) => {
            const logs = groupedByDay[day];
            const isExpanded = expandedGroup === day;
            const chatCount = logs.filter(l => l.activity_type === 'chat').length;
            const anxietyCount = logs.filter(l => l.activity_type === 'anxiety_detected').length;

            return (
              <Card key={day} className="overflow-hidden">
                <button
                  onClick={() => setExpandedGroup(isExpanded ? null : day)}
                  className="w-full text-left"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <CardTitle className="text-lg">{getDayLabel(day)}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{chatCount} chats</Badge>
                        {anxietyCount > 0 && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs border border-orange-200">
                            {anxietyCount} alerts
                          </Badge>
                        )}
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-slate-400" />
                          : <ChevronDown className="w-4 h-4 text-slate-400" />
                        }
                      </div>
                    </div>
                  </CardHeader>
                </button>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {logs.map((log, idx) => {
                        const details = formatActivityDetails(log);
                        return (
                          <div
                            key={log.id || idx}
                            className={`flex items-start gap-3 p-3 rounded-lg ${
                              log.activity_type === 'anxiety_detected'
                                ? 'bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800'
                                : 'bg-slate-50 dark:bg-slate-800/50'
                            }`}
                          >
                            <span className="text-xl shrink-0">{getActivityIcon(log.activity_type)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                                  {log.activity_type === 'anxiety_detected' ? 'Anxiety Detected' : 'Chat Session'}
                                </span>
                                {log.anxiety_level != null && getAnxietyBadge(log.anxiety_level)}
                              </div>
                              {details && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{details}</p>
                              )}
                              {log.created_date && (
                                <p className="text-xs text-slate-400 mt-1">
                                  {format(parseISO(log.created_date), 'h:mm a')}
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
        </div>
      )}
      {/* Session list */}
      <div>
        <CardTitle className="mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          Conversation History
        </CardTitle>

        {isLoading ? (
          <p className="text-center text-slate-500 py-8">Loading conversation history...</p>
        ) : allSessions.length === 0 ? (
          <Card className="bg-slate-50 dark:bg-slate-900/50">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No conversation history yet.</p>
              <p className="text-sm text-slate-400 mt-1">Conversations will appear here once your patient has chatted with Memory Mirror.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {allSessions.map(session => (
              <ConversationCard key={`${session._source}-${session.id}`} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
