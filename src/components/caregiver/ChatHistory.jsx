import React, { useState } from 'react';
import { MessageCircle, Heart, AlertTriangle, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, AlertTriangle, Calendar, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

function formatDateLabel(dateStr) {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMM d');
  } catch {
    return dateStr;
  }
}

function AnxietyBadge({ level }) {
  if (!level || level < 4) return null;
  const color = level >= 7 ? 'destructive' : level >= 5 ? 'warning' : 'secondary';
  return (
    <Badge variant={color} className={level >= 7 ? 'bg-red-100 text-red-700 border-red-200' : level >= 5 ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}>
      Anxiety {level}/10
    </Badge>
  );
}

export default function ChatHistory({ onBack }) {
  const [expandedDays, setExpandedDays] = useState({});

  const { data: activityLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['chatActivityLogs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 200).catch(() => []),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['caregiverAlerts'],
    queryFn: () => base44.entities.CaregiverAlert.list('-created_date', 50).catch(() => []),
  });

  const { data: anxietyTrends = [] } = useQuery({
    queryKey: ['anxietyTrends'],
    queryFn: () => base44.entities.AnxietyTrend.list('-date', 30).catch(() => []),
  });

  const chatLogs = activityLogs.filter(log => log.activity_type === 'chat');

  // Group logs by date
  const groupedByDate = chatLogs.reduce((acc, log) => {
    const dateKey = log.created_date
      ? log.created_date.split('T')[0]
      : new Date().toISOString().split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(log);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  // Map anxiety trend by date for quick lookup
  const anxietyByDate = anxietyTrends.reduce((acc, trend) => {
    acc[trend.date] = trend;
    return acc;
  }, {});

  // High-anxiety alerts (key moments)
  const keyAlerts = alerts.filter(a => a.severity === 'urgent' || a.alert_type === 'high_anxiety');

  const toggleDay = (dateKey) => {
    setExpandedDays(prev => ({ ...prev, [dateKey]: !prev[dateKey] }));
  };

  const totalConversations = chatLogs.length;
  const avgAnxiety = anxietyTrends.length > 0
    ? (anxietyTrends.reduce((sum, t) => sum + (t.anxiety_level || 0), 0) / anxietyTrends.length).toFixed(1)
    : null;

  if (logsLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
function getDayLabel(dateStr) {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEEE, MMMM d');
}

export default function ChatHistory({ onBack }) {
  const [expandedEntry, setExpandedEntry] = useState(null);

  const { data: activityLogs = [], isLoading } = useQuery({
    queryKey: ['chatHistoryLogs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 200),
  });

  const chatLogs = activityLogs.filter(
    (log) => log.activity_type === 'chat' || log.anxiety_detected
  );

  const totalSessions = chatLogs.filter((l) => l.activity_type === 'chat').length;
  const totalAnxietyAlerts = chatLogs.filter((l) => l.anxiety_detected || l.activity_type === 'anxiety_detected').length;
  const activeDays = new Set(chatLogs.map((l) => (l.created_date || '').slice(0, 10))).size;

  // Group by day
  const grouped = chatLogs.reduce((acc, log) => {
    const day = (log.created_date || new Date().toISOString()).slice(0, 10);
    if (!acc[day]) acc[day] = [];
    acc[day].push(log);
    return acc;
  }, {});

  const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="min-h-[44px]">
            ← Back
          </Button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-blue-500" />
            Chat History
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Review conversations and key moments
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalConversations}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Chat Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-400" />
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {avgAnxiety !== null ? `${avgAnxiety}/10` : 'N/A'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Avg Anxiety Level</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{keyAlerts.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">High Anxiety Events</p>
              </div>
    <div>
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]"
        >
          ← Back to Portal
        </button>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-green-500" />
          Chat History
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Review conversations and key moments with your loved one
        </p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{totalSessions}</p>
            <p className="text-sm text-slate-500 mt-1">Chat Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-500">{totalAnxietyAlerts}</p>
            <p className="text-sm text-slate-500 mt-1">Anxiety Alerts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{activeDays}</p>
            <p className="text-sm text-slate-500 mt-1">Active Days</p>
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
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

      {/* Key Moments / Alerts */}
      {keyAlerts.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-900 dark:text-amber-200 flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5" />
              Key Moments — High Anxiety Detected
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-400">
              These events required extra attention or calming responses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {keyAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {alert.message || 'High anxiety detected during conversation'}
                    </p>
                    {alert.created_date && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {format(parseISO(alert.created_date), 'MMM d, yyyy h:mm a')}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-red-100 text-red-700 border-red-200 flex-shrink-0 text-xs">
                    Urgent
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation Timeline */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Conversation Timeline</h3>

        {sortedDates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No conversations recorded yet</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Chat sessions will appear here once your loved one starts using Memory Mirror.
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedDates.map((dateKey) => {
            const dayLogs = groupedByDate[dateKey];
            const trend = anxietyByDate[dateKey];
            const isExpanded = expandedDays[dateKey];
            const maxAnxiety = dayLogs.reduce((max, log) => {
              const level = log.anxiety_level || log.details?.anxiety_level || 0;
              return Math.max(max, level);
            }, trend?.anxiety_level || 0);

            return (
              <Card key={dateKey} className="overflow-hidden">
                <button
                  className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => toggleDay(dateKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatDateLabel(dateKey)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {dayLogs.length} {dayLogs.length === 1 ? 'session' : 'sessions'}
                          {trend && ` · Avg anxiety: ${trend.anxiety_level}/10`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AnxietyBadge level={maxAnxiety} />
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <CardContent className="pt-0 pb-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="space-y-2 mt-3">
                      {dayLogs.map((log, idx) => (
                        <div
                          key={log.id || idx}
                          className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                        >
                          <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Chat Session
                              </p>
                              {log.details?.era && log.details.era !== 'auto' && (
                                <Badge variant="outline" className="text-xs">
                                  {log.details.era}
                                </Badge>
                              )}
                              {log.details?.language && log.details.language !== 'en' && (
                                <Badge variant="outline" className="text-xs">
                                  {log.details.language.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                            {log.created_date && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                {format(parseISO(log.created_date), 'h:mm a')}
                              </p>
                            )}
                            {log.details?.proactive && (
                              <p className="text-xs text-blue-500 mt-0.5">
                                Proactive check-in initiated by Memory Mirror
                              </p>
                            )}
                          </div>
                          <AnxietyBadge level={log.anxiety_level || log.details?.anxiety_level} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
      {/* Daily Feed */}
      {sortedDays.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-slate-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No chat history yet</p>
            <p className="text-sm mt-1">Conversations will appear here once sessions begin.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedDays.map((day) => (
            <Card key={day}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4" />
                  {getDayLabel(day + 'T00:00:00')}
                  <Badge variant="secondary" className="ml-auto">
                    {grouped[day].length} {grouped[day].length === 1 ? 'entry' : 'entries'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped[day].map((log) => {
                  const isAnxiety = log.anxiety_detected || log.activity_type === 'anxiety_detected';
                  const key = log.id || log.created_date;
                  const isExpanded = expandedEntry === key;
                  return (
                    <div
                      key={key}
                      className={`rounded-lg p-3 border ${
                        isAnxiety
                          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
                          : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isAnxiety ? (
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        ) : (
                          <MessageCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {log.created_date
                            ? format(parseISO(log.created_date), 'h:mm a')
                            : '—'}
                        </span>
                        {log.era && (
                          <Badge variant="outline" className="text-xs ml-1">
                            {log.era}
                          </Badge>
                        )}
                        {log.language && (
                          <Badge variant="outline" className="text-xs">
                            {log.language}
                          </Badge>
                        )}
                        {isAnxiety && (
                          <button
                            onClick={() => setExpandedEntry(isExpanded ? null : key)}
                            className="ml-auto text-red-600 hover:text-red-700 flex items-center gap-1 text-xs"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ChevronRight className="w-3 h-3" />
                            )}
                            View trigger
                          </button>
                        )}
                      </div>
                      {isAnxiety && isExpanded && (
                        <div className="mt-2 pl-6 text-sm text-red-700 dark:text-red-300">
                          {log.details?.trigger
                            ? <p>{log.details.trigger}</p>
                            : <p className="italic text-slate-400">No trigger text recorded.</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
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
