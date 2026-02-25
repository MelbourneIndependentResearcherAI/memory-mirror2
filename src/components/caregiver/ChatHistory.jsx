import React, { useState } from 'react';
import { MessageCircle, AlertTriangle, Calendar, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

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
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}
