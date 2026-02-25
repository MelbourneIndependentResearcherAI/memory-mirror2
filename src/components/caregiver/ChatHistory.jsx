import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
y { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, ChevronDown, ChevronUp, Clock, User, Bot } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, AlertTriangle, Clock, Globe, Brain, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

const ERA_LABELS = {
  '1940s': '1940s Era',
  '1960s': '1960s Era',
  '1980s': '1980s Era',
  'present': 'Present Day',
};

const ERA_COLORS = {
  '1940s': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  '1960s': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  '1980s': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'present': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

const ANXIETY_COLORS = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function getAnxietyLabel(level) {
  if (!level || level <= 3) return { label: 'Calm', color: ANXIETY_COLORS.low };
  if (level <= 6) return { label: 'Mild Anxiety', color: ANXIETY_COLORS.medium };
  return { label: 'High Anxiety', color: ANXIETY_COLORS.high };
}

function ConversationCard({ conversation }) {
  const [expanded, setExpanded] = useState(false);
  const messages = conversation.messages || [];
  const era = conversation.detected_era || 'present';
  const anxietyInfo = getAnxietyLabel(conversation.anxiety_level);
  const messageCount = messages.length;

  const formattedDate = conversation.created_date
    ? format(new Date(conversation.created_date), 'MMM d, yyyy h:mm a')
    : 'Unknown date';

  return (
    <Card className="border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ERA_COLORS[era] || ERA_COLORS.present}`}>
                  {ERA_LABELS[era] || era}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${anxietyInfo.color}`}>
                  {anxietyInfo.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
                <span>·</span>
                <span>{messageCount} message{messageCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 min-h-[36px] text-slate-600 dark:text-slate-400"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span className="ml-1 text-xs">{expanded ? 'Collapse' : 'View'}</span>
          </Button>
        </div>
      </CardHeader>

      {expanded && messages.length > 0 && (
        <CardContent className="pt-0">
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 max-h-80 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-500'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-4 h-4 text-white" />
                    : <Bot className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  }
                </div>
                <div className={`rounded-2xl px-3 py-2 text-sm max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {expanded && messages.length === 0 && (
        <CardContent className="pt-0">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4 border-t border-slate-100 dark:border-slate-800">
            No messages recorded for this conversation.
          </p>
        </CardContent>
      )}
    </Card>
  );
}

export default function ChatHistory() {
  const [filter, setFilter] = useState('all');

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 50),
  });

  const filteredConversations = conversations.filter((conv) => {
    if (filter === 'all') return true;
    if (filter === 'anxious') return (conv.anxiety_level || 0) > 5;
    if (filter === '1940s') return conv.detected_era === '1940s';
    if (filter === '1960s') return conv.detected_era === '1960s';
    if (filter === '1980s') return conv.detected_era === '1980s';
    if (filter === 'present') return conv.detected_era === 'present' || !conv.detected_era;
    return true;
  });

  const filters = [
    { id: 'all', label: 'All Conversations' },
    { id: 'anxious', label: 'High Anxiety' },
    { id: 'present', label: 'Present Day' },
    { id: '1940s', label: '1940s Era' },
    { id: '1960s', label: '1960s Era' },
    { id: '1980s', label: '1980s Era' },
  ];

  const totalMessages = conversations.reduce((sum, c) => sum + (c.messages?.length || 0), 0);
  const highAnxietyCount = conversations.filter(c => (c.anxiety_level || 0) > 5).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Chat History</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Review past conversations with your loved one</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{conversations.length}</div>
          <div className="text-xs text-blue-600 dark:text-blue-500 mt-1">Conversations</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">{totalMessages}</div>
          <div className="text-xs text-green-600 dark:text-green-500 mt-1">Total Messages</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">{highAnxietyCount}</div>
          <div className="text-xs text-red-600 dark:text-red-500 mt-1">High Anxiety</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px] ${
              filter === f.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Conversation List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {conversations.length === 0 ? 'No conversations recorded yet' : 'No conversations match this filter'}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            {conversations.length === 0
              ? 'Conversations will appear here as your loved one chats with Memory Mirror'
              : 'Try a different filter to see more conversations'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((conv, idx) => (
            <ConversationCard key={conv.id || idx} conversation={conv} />
          ))}
        </div>
      )}
function groupByDay(logs) {
  const groups = {};
  for (const log of logs) {
    const date = new Date(log.created_date);
    const key = format(date, 'yyyy-MM-dd');
    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
  }
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

function dayLabel(dateStr) {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE');
  return format(date, 'MMMM d, yyyy');
}

function ChatActivityCard({ log }) {
  const [expanded, setExpanded] = useState(false);
  const era = log.details?.era || 'present';
  const language = log.details?.language;
  const isAnxiety = log.activity_type === 'anxiety_detected';
  const anxietyLevel = log.anxiety_level;
  const isProactive = log.details?.proactive;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isAnxiety
          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex-shrink-0 rounded-full p-2 ${isAnxiety ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
            {isAnxiety ? (
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            ) : (
              <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
              {isAnxiety
                ? `Anxiety Alert${anxietyLevel ? ` — Level ${anxietyLevel}/10` : ''}`
                : isProactive
                ? 'Proactive Check-In'
                : 'Chat Session'}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                {format(new Date(log.created_date), 'h:mm a')}
              </span>
              {era && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ERA_COLORS[era] || ERA_COLORS.present}`}>
                  {ERA_LABELS[era] || era}
                </span>
              )}
              {language && language !== 'en' && (
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Globe className="w-3 h-3" />
                  {language.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
        {isAnxiety && log.details?.trigger && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 min-h-[32px] min-w-[32px] flex items-center justify-center"
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>
      {expanded && isAnxiety && log.details?.trigger && (
        <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold">Trigger:</span> {log.details.trigger}
          </p>
        </div>
      )}
    </div>
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
  const [showAll, setShowAll] = useState(false);

  const { data: activityLogs = [], isLoading } = useQuery({
    queryKey: ['chatActivityLogs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 200),
  });

  const chatLogs = activityLogs.filter(
    (log) => log.activity_type === 'chat' || log.activity_type === 'anxiety_detected'
  );

  const grouped = groupByDay(chatLogs);
  const displayedGroups = showAll ? grouped : grouped.slice(0, 7);

  const totalChats = activityLogs.filter((l) => l.activity_type === 'chat').length;
  const totalAnxiety = activityLogs.filter((l) => l.activity_type === 'anxiety_detected').length;
  const uniqueDays = grouped.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalChats}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Chat Sessions</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalAnxiety}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Anxiety Alerts</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <Brain className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{uniqueDays}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Active Days</p>
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

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            Chat Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : chatLogs.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No chat activity recorded yet.</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Chat sessions will appear here once conversations begin.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayedGroups.map(([dateKey, logs]) => (
                <div key={dateKey}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {dayLabel(dateKey)} — {format(new Date(dateKey), 'MMM d')}
                    </span>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <ChatActivityCard key={log.id} log={log} />
                    ))}
                  </div>
                </div>
              ))}

              {grouped.length > 7 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-2 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors min-h-[44px]"
                >
                  {showAll ? 'Show Less' : `Show All ${grouped.length} Days`}
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
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
