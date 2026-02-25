import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
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
    </div>
  );
}
