import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
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
    </div>
  );
}
