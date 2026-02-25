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
    </div>
  );
}
