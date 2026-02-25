import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MessageCircle, Clock, Search, Loader2, CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format, isToday, isYesterday } from 'date-fns';

function formatRelativeDate(dateStr) {
  const date = new Date(dateStr);
  if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
  if (isYesterday(date)) return `Yesterday at ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d, yyyy h:mm a');
}

export default function ChatHistoryViewer() {
  const [search, setSearch] = useState('');

  const { data: activityLogs = [], isLoading: loadingActivity } = useQuery({
    queryKey: ['chatActivityLogs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 100).catch(() => [])
  });

  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['chatConversations'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 100).catch(() => [])
  });

  const isLoading = loadingActivity || loadingConversations;

  // Filter activity logs to only chat-related ones
  const chatLogs = activityLogs.filter(log =>
    log.activity_type === 'chat' ||
    log.activity_type === 'anxiety_detected' ||
    log.activity_type === 'bad_day_mode'
  );

  // Merge and de-duplicate by date proximity, grouping into sessions
  const allEvents = [
    ...chatLogs.map(log => ({
      id: `log-${log.id}`,
      source: 'activity',
      date: log.created_date,
      type: log.activity_type,
      details: log.details || {},
      anxiety_level: log.anxiety_level
    })),
    ...conversations.map(conv => ({
      id: `conv-${conv.id}`,
      source: 'conversation',
      date: conv.created_date,
      type: 'conversation',
      details: conv,
      summary: conv.summary || null,
      era: conv.era || null,
      message_count: conv.message_count || null,
      sentiment_score: conv.sentiment_score || null
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const lowerSearch = search.toLowerCase();
  const filtered = allEvents.filter(event => {
    if (!search) return true;
    const detailsText = JSON.stringify(event.details || '').toLowerCase();
    const summary = (event.summary || '').toLowerCase();
    const era = (event.era || '').toLowerCase();
    const type = (event.type || '').replace(/_/g, ' ').toLowerCase();
    return detailsText.includes(lowerSearch) || summary.includes(lowerSearch) || era.includes(lowerSearch) || type.includes(lowerSearch);
  });

  const getTypeLabel = (type) => {
    switch (type) {
      case 'chat': return 'Chat Message';
      case 'anxiety_detected': return 'Anxiety Detected';
      case 'bad_day_mode': return 'Bad Day Mode';
      case 'conversation': return 'Conversation Session';
      default: return type.replace(/_/g, ' ');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'anxiety_detected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'bad_day_mode': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'conversation': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MessageCircle className="w-7 h-7 text-blue-500" />
          Chat History
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Review conversations and key moments with your loved one
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search chat history..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            {search ? 'No results found for your search.' : 'No chat history yet.'}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
            {!search && 'Chat history will appear here after conversations with the AI companion.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => (
            <Card key={event.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getTypeColor(event.type)}`}>
                      {getTypeLabel(event.type)}
                    </span>
                    {event.era && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
                        {event.era}
                      </span>
                    )}
                    {event.anxiety_level !== undefined && event.anxiety_level !== null && (
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        event.anxiety_level >= 7 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        event.anxiety_level >= 4 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        Anxiety: {event.anxiety_level}/10
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    {formatRelativeDate(event.date)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {event.summary && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{event.summary}</p>
                )}
                {event.type === 'chat' && event.details?.message_length && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Message length: <span className="font-medium">{event.details.message_length} chars</span>
                    {event.details.era && (
                      <span className="ml-2 text-slate-500">· Era: {event.details.era}</span>
                    )}
                    {event.details.language && event.details.language !== 'en' && (
                      <span className="ml-2 text-slate-500">· Language: {event.details.language}</span>
                    )}
                  </p>
                )}
                {event.type === 'anxiety_detected' && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Anxiety was detected during this conversation.
                    {event.details?.trigger && (
                      <span className="ml-1 text-slate-600 dark:text-slate-400">
                        Trigger: {event.details.trigger}
                      </span>
                    )}
                  </p>
                )}
                {event.type === 'conversation' && event.message_count !== null && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {event.message_count} {event.message_count === 1 ? 'message' : 'messages'} exchanged
                    {event.sentiment_score !== null && (
                      <span className="ml-2 text-slate-500">· Sentiment: {event.sentiment_score}/10</span>
                    )}
                  </p>
                )}
                {event.type === 'bad_day_mode' && (
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Bad Day Mode was activated to provide comfort and support.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 pt-2">
            <CalendarDays className="w-3.5 h-3.5" />
            Showing {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Clock, Brain, AlertTriangle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

function getEraLabel(era) {
  const labels = {
    '1940s': '1940s Era',
    '1960s': '1960s Era',
    '1980s': '1980s Era',
    'present': 'Present Day',
    'auto': 'Auto-detected',
  };
  return labels[era] || era || 'Unknown';
}

function getAnxietyColor(level) {
  if (!level && level !== 0) return 'text-slate-500';
  if (level > 7) return 'text-red-600 dark:text-red-400';
  if (level > 5) return 'text-orange-500 dark:text-orange-400';
  if (level > 3) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

function getAnxietyLabel(level) {
  if (!level && level !== 0) return 'Unknown';
  if (level > 7) return 'High';
  if (level > 5) return 'Elevated';
  if (level > 3) return 'Mild';
  return 'Calm';
}

function SessionCard({ session }) {
  const [expanded, setExpanded] = useState(false);
  const createdAt = session.created_date ? new Date(session.created_date) : null;

  const era = session.details?.era;
  const messageLength = session.details?.message_length;
  const language = session.details?.language;
  const anxietyLevel = session.anxiety_level ?? session.details?.anxiety_level;
  const isProactive = session.details?.proactive;

  return (
    <Card className="border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
      <CardContent className="p-0">
        <button
          className="w-full text-left p-4 flex items-start justify-between gap-3"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {isProactive ? 'Proactive check-in' : 'Chat session'}
                </span>
                {era && (
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                    <Brain className="w-3 h-3 inline mr-1" />
                    {getEraLabel(era)}
                  </span>
                )}
                {anxietyLevel !== undefined && anxietyLevel !== null && (
                  <span className={`text-xs font-medium ${getAnxietyColor(anxietyLevel)}`}>
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    {getAnxietyLabel(anxietyLevel)} ({anxietyLevel}/10)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                {createdAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDistanceToNow(createdAt, { addSuffix: true })}
                  </span>
                )}
                {language && language !== 'en' && (
                  <span className="text-xs uppercase font-medium text-slate-400">{language}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 mt-1">
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </button>

        {expanded && (
          <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800 pt-3 ml-12">
            <dl className="space-y-1 text-sm">
              {createdAt && (
                <div className="flex gap-2">
                  <dt className="text-slate-500 dark:text-slate-400 w-32 flex-shrink-0">Date &amp; Time</dt>
                  <dd className="text-slate-800 dark:text-slate-200">{format(createdAt, 'PPp')}</dd>
                </div>
              )}
              {era && (
                <div className="flex gap-2">
                  <dt className="text-slate-500 dark:text-slate-400 w-32 flex-shrink-0">Era detected</dt>
                  <dd className="text-slate-800 dark:text-slate-200">{getEraLabel(era)}</dd>
                </div>
              )}
              {messageLength !== undefined && (
                <div className="flex gap-2">
                  <dt className="text-slate-500 dark:text-slate-400 w-32 flex-shrink-0">Message length</dt>
                  <dd className="text-slate-800 dark:text-slate-200">{messageLength} characters</dd>
                </div>
              )}
              {anxietyLevel !== undefined && anxietyLevel !== null && (
                <div className="flex gap-2">
                  <dt className="text-slate-500 dark:text-slate-400 w-32 flex-shrink-0">Anxiety level</dt>
                  <dd className={`font-medium ${getAnxietyColor(anxietyLevel)}`}>
                    {getAnxietyLabel(anxietyLevel)} ({anxietyLevel}/10)
                  </dd>
                </div>
              )}
              {language && (
                <div className="flex gap-2">
                  <dt className="text-slate-500 dark:text-slate-400 w-32 flex-shrink-0">Language</dt>
                  <dd className="text-slate-800 dark:text-slate-200 uppercase">{language}</dd>
                </div>
              )}
              {isProactive && (
                <div className="flex gap-2">
                  <dt className="text-slate-500 dark:text-slate-400 w-32 flex-shrink-0">Type</dt>
                  <dd className="text-slate-800 dark:text-slate-200">AI-initiated check-in</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ChatHistoryViewer({ onBack }) {
  const { data: chatLogs = [], isLoading, error } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: async () => {
      const logs = await base44.entities.ActivityLog.list('-created_date', 100);
      return logs.filter(log =>
        log.activity_type === 'chat' || log.activity_type === 'anxiety_detected'
      );
    },
    retry: 2,
    staleTime: 1000 * 60 * 2,
  });

  const chatSessions = chatLogs.filter(l => l.activity_type === 'chat');
  const anxietyEvents = chatLogs.filter(l => l.activity_type === 'anxiety_detected');

  const summaryStats = {
    total: chatSessions.length,
    today: chatSessions.filter(l => {
      if (!l.created_date) return false;
      const d = new Date(l.created_date);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length,
    anxietyEvents: anxietyEvents.length,
    avgAnxiety: chatLogs.length > 0
      ? (chatLogs.reduce((sum, l) => sum + (l.anxiety_level ?? l.details?.anxiety_level ?? 0), 0) / chatLogs.length).toFixed(1)
      : null,
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 min-h-[44px]"
          >
            ← Back
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-blue-600" />
            Chat History
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Recent AI companion sessions and interactions
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Sessions</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{summaryStats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Today</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summaryStats.today}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Anxiety Events</p>
            <p className={`text-2xl font-bold ${summaryStats.anxietyEvents > 0 ? 'text-orange-500' : 'text-green-600 dark:text-green-400'}`}>
              {summaryStats.anxietyEvents}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Avg Anxiety</p>
            <p className={`text-2xl font-bold ${getAnxietyColor(parseFloat(summaryStats.avgAnxiety))}`}>
              {summaryStats.avgAnxiety !== null ? `${summaryStats.avgAnxiety}/10` : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Session List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">Unable to load chat history.</p>
            </div>
          ) : chatLogs.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No chat sessions yet</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                Chat sessions will appear here once your loved one starts using the AI companion.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {chatLogs.map((session, index) => (
                <SessionCard key={session.id ?? index} session={session} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
import { MessageCircle, Calendar, Clock, TrendingUp, ChevronDown, ChevronUp, AlertCircle, Smile, Meh } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

const eraColors = {
  '1940s': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  '1960s': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  '1980s': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'present': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'auto': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
};

const anxietyColor = (level) => {
  if (level >= 7) return 'text-red-600 dark:text-red-400';
  if (level >= 4) return 'text-amber-600 dark:text-amber-400';
  return 'text-green-600 dark:text-green-400';
};

const AnxietyIcon = ({ level }) => {
  if (level >= 7) return <AlertCircle className="w-4 h-4 text-red-500" />;
  if (level >= 4) return <Meh className="w-4 h-4 text-amber-500" />;
  return <Smile className="w-4 h-4 text-green-500" />;
};

function formatSessionDate(dateStr) {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEE, MMM d');
}

function groupLogsByDay(logs) {
  const groups = {};
  for (const log of logs) {
    const date = new Date(log.created_date);
    const key = format(date, 'yyyy-MM-dd');
    if (!groups[key]) groups[key] = { date, logs: [] };
    groups[key].logs.push(log);
  }
  return Object.values(groups).sort((a, b) => b.date - a.date);
}
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

  const chatLogs = activityLogs.filter(log => log.activity_type === 'chat');
  const anxietyLogs = activityLogs.filter(log => log.activity_type === 'anxiety_detected');

  const dayGroups = groupLogsByDay(chatLogs);

  // Summary stats
  const totalSessions = dayGroups.length;
  const totalMessages = chatLogs.length;
  const avgPerDay = dayGroups.length > 0 ? Math.round(totalMessages / dayGroups.length) : 0;
  const recentAnxiety = anxietyLogs.slice(0, 5);
  const avgAnxiety = recentAnxiety.length > 0
    ? (recentAnxiety.reduce((sum, l) => sum + (l.anxiety_level || 0), 0) / recentAnxiety.length).toFixed(1)
    : 0;

  return (
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
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-1">
          <MessageCircle className="w-8 h-8 text-blue-500" />
          Chat History
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Review conversations and key moments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Active Days</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalSessions}</p>
              </div>
              <Calendar className="w-7 h-7 text-blue-400 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Messages</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalMessages}</p>
              </div>
              <MessageCircle className="w-7 h-7 text-purple-400 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Avg / Day</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{avgPerDay}</p>
              </div>
              <TrendingUp className="w-7 h-7 text-green-400 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Avg Anxiety</p>
                <p className={`text-2xl font-bold ${anxietyColor(Number(avgAnxiety))}`}>
                  {avgAnxiety > 0 ? `${avgAnxiety}/10` : 'N/A'}
                </p>
              </div>
              <AnxietyIcon level={Number(avgAnxiety)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Sessions by Day */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Loading chat history...</p>
        </div>
      ) : dayGroups.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
              No chat history yet
            </p>
            <p className="text-slate-500 dark:text-slate-500">
              Conversations will appear here once your loved one starts using Memory Mirror.
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
        <div className="space-y-4">
          {dayGroups.map((group) => {
            const dayKey = format(group.date, 'yyyy-MM-dd');
            const isExpanded = expandedDay === dayKey;
            const eraLogs = group.logs.filter(l => l.details?.era);
            const eras = [...new Set(eraLogs.map(l => l.details.era))];
            const langs = [...new Set(group.logs.filter(l => l.details?.language).map(l => l.details.language))];

            return (
              <Card key={dayKey} className="overflow-hidden">
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedDay(isExpanded ? null : dayKey)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-lg text-slate-800 dark:text-slate-100">
                            {formatSessionDate(group.date.toISOString())}
                          </CardTitle>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {format(group.date, 'MMMM d, yyyy')} · {group.logs.length} message{group.logs.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {eras.slice(0, 2).map(era => (
                          <Badge key={era} className={`text-xs ${eraColors[era] || eraColors['auto']}`} variant="secondary">
                            {era}
                          </Badge>
                        ))}
                        {isExpanded
                          ? <ChevronUp className="w-5 h-5 text-slate-400" />
                          : <ChevronDown className="w-5 h-5 text-slate-400" />
                        }
                      </div>
                    </div>
                  </CardHeader>
                </button>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                      {/* Language info */}
                      {langs.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <span>Language{langs.length > 1 ? 's' : ''}:</span>
                          {langs.map(l => (
                            <Badge key={l} variant="outline" className="text-xs">{l.toUpperCase()}</Badge>
                          ))}
                        </div>
                      )}

                      {/* Session timeline */}
                      <div className="space-y-2">
                        {group.logs.map((log, idx) => (
                          <div key={log.id || idx} className="flex items-start gap-3 py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                            <div className="flex-shrink-0 mt-0.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-slate-400 font-mono">
                                  {format(new Date(log.created_date), 'HH:mm')}
                                </span>
                                {log.details?.era && log.details.era !== 'auto' && (
                                  <Badge className={`text-xs ${eraColors[log.details.era] || eraColors['auto']}`} variant="secondary">
                                    {log.details.era}
                                  </Badge>
                                )}
                                {log.details?.proactive && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    proactive
                                  </Badge>
                                )}
                              </div>
                              {log.details?.message_length && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  {log.details.message_length} character{log.details.message_length !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Anxiety events on this day */}
                      {(() => {
                        const dayAnxiety = anxietyLogs.filter(l => {
                          const d = format(new Date(l.created_date), 'yyyy-MM-dd');
                          return d === dayKey;
                        });
                        return dayAnxiety.length > 0 ? (
                          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4" />
                              Anxiety Detected ({dayAnxiety.length} event{dayAnxiety.length !== 1 ? 's' : ''})
                            </p>
                            {dayAnxiety.map((evt, i) => (
                              <div key={i} className="text-xs text-amber-700 dark:text-amber-400 mb-1">
                                <span className="font-mono">{format(new Date(evt.created_date), 'HH:mm')}</span>
                                {' — '}
                                <span className={`font-semibold ${anxietyColor(evt.anxiety_level)}`}>
                                  Level {evt.anxiety_level}/10
                                </span>
                                {evt.details?.trigger && (
                                  <span className="ml-1 opacity-75">· "{evt.details.trigger}"</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null;
                      })()}
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

      {/* Recent Anxiety Events */}
      {recentAnxiety.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-amber-500" />
            Recent Anxiety Events
          </h2>
          <div className="space-y-3">
            {recentAnxiety.map((evt, i) => (
              <Card key={i} className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        Anxiety level{' '}
                        <span className={`font-bold ${anxietyColor(evt.anxiety_level)}`}>
                          {evt.anxiety_level}/10
                        </span>
                      </p>
                      {evt.details?.trigger && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Trigger: "{evt.details.trigger}"
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <p>{formatDistanceToNow(new Date(evt.created_date), { addSuffix: true })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
