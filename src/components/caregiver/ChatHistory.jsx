import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, AlertTriangle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';

function AnxietyBadge({ level }) {
  if (level == null) return null;
  const color = level >= 7
    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    : level >= 4
    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  return <Badge className={color}>Anxiety: {level}/10</Badge>;
}

function ConversationCard({ session }) {
  const [expanded, setExpanded] = useState(false);
  const date = session.created_date || session.date;
  const topics = session.conversation_topics || session.topics || [];
  const summary = session.summary || session.details?.summary || '';
  const msgCount = session.message_count || session.details?.message_count;

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {date ? format(new Date(date), 'MMM d, yyyy — h:mm a') : 'Unknown date'}
                </span>
                {session.anxiety_level != null && <AnxietyBadge level={session.anxiety_level} />}
              </div>
              {msgCount != null && (
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
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['chatHistoryConversations'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 100).catch(() => []),
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['chatActivityLogs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 200).catch(() => []),
  });

  const totalChats = activityLogs.filter(l => l.activity_type === 'chat').length;
  const highAnxiety = activityLogs.filter(l => l.anxiety_level >= 7).length;

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 min-h-[44px]">
          <ArrowLeft className="w-5 h-5" /> Back
        </Button>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalChats}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Chat Sessions</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{highAnxiety}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">High Anxiety Events</p>
          </CardContent>
        </Card>
      </div>

      <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
        <MessageCircle className="w-5 h-5 text-blue-500" />
        Conversation History
      </CardTitle>

      {isLoading ? (
        <p className="text-center text-slate-500 py-8">Loading conversation history...</p>
      ) : conversations.length === 0 ? (
        <Card className="bg-slate-50 dark:bg-slate-900/50">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No conversation history yet.</p>
            <p className="text-sm text-slate-400 mt-1">Conversations will appear here once your patient has chatted with Memory Mirror.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {conversations.map(session => (
            <ConversationCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
