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
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading chat history...</div>
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
    </div>
  );
}
