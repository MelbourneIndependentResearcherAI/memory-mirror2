import React, { useState } from 'react';
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

export default function ChatHistoryViewer({ onBack }) {
  const [expandedDay, setExpandedDay] = useState(null);

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
