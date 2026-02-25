import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, AlertTriangle, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { format } from 'date-fns';

function AnxietyBadge({ level }) {
  if (!level) return null;
  if (level >= 7) return <Badge className="bg-red-100 text-red-700 text-xs">High anxiety</Badge>;
  if (level >= 4) return <Badge className="bg-amber-100 text-amber-700 text-xs">Moderate</Badge>;
  return <Badge className="bg-green-100 text-green-700 text-xs">Calm</Badge>;
}

function groupByDay(logs) {
  const groups = {};
  logs.forEach((log) => {
    const date = log.created_date
      ? format(new Date(log.created_date), 'yyyy-MM-dd')
      : 'unknown';
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, logs]) => ({ date, logs }));
}

export default function ChatHistory({ onBack }) {
  const [showAll, setShowAll] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);

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
      {/* Summary */}
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

      {/* Timeline */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : displayedGroups.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No conversation history yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayedGroups.map(({ date, logs: dayLogs }) => (
            <Card key={date} className="overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                onClick={() => setExpandedDay(expandedDay === date ? null : date)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {date === 'unknown' ? 'Unknown date' : format(new Date(date), 'EEEE, MMMM d')}
                  </span>
                  <Badge variant="outline" className="text-xs">{dayLogs.length} events</Badge>
                </div>
                {expandedDay === date ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {expandedDay === date && (
                <div className="border-t border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                  {dayLogs.map((log, i) => (
                    <div key={i} className="px-4 py-3 flex items-start gap-3">
                      <span className="text-lg mt-0.5">
                        {log.activity_type === 'anxiety_detected' ? '⚠️' : '💬'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                            {log.activity_type?.replace('_', ' ') || 'Activity'}
                          </span>
                          {log.created_date && (
                            <span className="text-xs text-slate-400">
                              {format(new Date(log.created_date), 'h:mm a')}
                            </span>
                          )}
                          <AnxietyBadge level={log.anxiety_level} />
                        </div>
                        {log.details?.era && log.details.era !== 'auto' && (
                          <p className="text-xs text-slate-500 mt-0.5">Era: {log.details.era}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}

          {!showAll && grouped.length > 7 && (
            <Button
              variant="outline"
              className="w-full min-h-[44px]"
              onClick={() => setShowAll(true)}
            >
              Show all {grouped.length} days
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
