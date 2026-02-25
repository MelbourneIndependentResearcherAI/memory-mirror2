import React, { useState } from 'react';
import { MessageCircle, Heart, AlertTriangle, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
        )}
      </div>
    </div>
  );
}
