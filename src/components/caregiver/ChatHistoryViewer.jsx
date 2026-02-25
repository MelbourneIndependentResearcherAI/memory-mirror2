import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, Brain, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

function EraLabel({ era }) {
  const labels = {
    '1940s': '1940s Era',
    '1960s': '1960s Era',
    '1980s': '1980s Era',
    present: 'Present Day',
    auto: 'Auto-detected',
  };
  return <span>{labels[era] || era || 'Unknown'}</span>;
}

function ConversationEntry({ convo }) {
  const [expanded, setExpanded] = useState(false);
  const messages =
    typeof convo.messages === 'string'
      ? JSON.parse(convo.messages || '[]')
      : convo.messages || [];
  const dateStr = convo.started_at || convo.created_date;
  const msgCount = convo.message_count || messages.length || 0;

  return (
    <Card>
      <button
        className="w-full flex items-start justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
            <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dateStr ? format(new Date(dateStr), 'MMM d, yyyy h:mm a') : 'Unknown date'}
              </span>
              {convo.era && (
                <Badge variant="outline" className="text-xs">
                  <EraLabel era={convo.era} />
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {msgCount} messages
              </span>
              {convo.duration_minutes > 0 && (
                <span>{Math.round(convo.duration_minutes)}m</span>
              )}
              {convo.peak_anxiety_level > 0 && (
                <span className="flex items-center gap-1 text-red-500">
                  <Brain className="w-3 h-3" />
                  Peak anxiety: {convo.peak_anxiety_level}/10
                </span>
              )}
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
          )
        )}
      </button>

      {expanded && messages.length > 0 && (
        <CardContent className="pt-0">
          <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-2 max-h-80 overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function ChatHistoryViewer({ onBack }) {
  const [showAll, setShowAll] = useState(false);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversationsViewer'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 100),
  });

  const displayed = showAll ? conversations : conversations.slice(0, 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            Chat History
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="min-h-[44px]">
            Back
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No conversations recorded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {displayed.map((convo) => (
              <ConversationEntry key={convo.id} convo={convo} />
            ))}
          </div>
          {!showAll && conversations.length > 20 && (
            <Button
              variant="outline"
              className="w-full min-h-[44px]"
              onClick={() => setShowAll(true)}
            >
              Show all {conversations.length} conversations
            </Button>
          )}
        </>
      )}
    </div>
  );
}
