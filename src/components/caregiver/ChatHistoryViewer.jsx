import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, ChevronDown, ChevronUp, AlertTriangle, Calendar, TrendingDown } from 'lucide-react';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';

export default function ChatHistoryViewer({ onBack }) {
  const [expandedDay, setExpandedDay] = useState(null);

  const { data: activityLogs = [], isLoading } = useQuery({
    queryKey: ['chatActivityLogs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 200)
  });

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
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading chat history…</div>
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
            </p>
          </CardContent>
        </Card>
      ) : (
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
