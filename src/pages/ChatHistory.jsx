import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, ChevronDown, ChevronUp, Calendar, Clock, Brain, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';

const ERA_LABELS = {
  '1940s': '1940s',
  '1960s': '1960s',
  '1980s': '1980s',
  'present': 'Present Day',
  'auto': 'Auto',
};

const ERA_COLORS = {
  '1940s': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  '1960s': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  '1980s': 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
  'present': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'auto': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

function AnxietyBadge({ level }) {
  const l = Number(level) || 0;
  if (l >= 7) return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">High anxiety</Badge>;
  if (l >= 4) return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Moderate anxiety</Badge>;
  return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Calm</Badge>;
}

function ConversationCard({ convo }) {
  const [expanded, setExpanded] = useState(false);

  let messages = [];
  try {
    messages = typeof convo.messages === 'string' ? JSON.parse(convo.messages) : (convo.messages || []);
  } catch {
    messages = [];
  }

  const topics = Array.isArray(convo.topics) ? convo.topics : [];
  const era = convo.era || 'present';
  const startedAt = convo.started_at || convo.created_date;
  const messageCount = convo.message_count || messages.length || 0;
  const avgAnxiety = convo.avg_anxiety_level ?? convo.anxiety_level ?? 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold truncate">
                Chat Session
              </CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs mt-0.5">
                <Calendar className="w-3 h-3" />
                {startedAt ? format(new Date(startedAt), 'PPp') : 'Unknown date'}
                {startedAt && (
                  <span className="text-slate-400 dark:text-slate-500">
                    · {formatDistanceToNow(new Date(startedAt), { addSuffix: true })}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 min-h-[36px] gap-1"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? 'Hide' : 'View'}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ERA_COLORS[era] || ERA_COLORS.present}`}>
            {ERA_LABELS[era] || era}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Activity className="w-3 h-3" />
            {messageCount} message{messageCount !== 1 ? 's' : ''}
          </span>
          {convo.duration_minutes > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-3 h-3" />
              {Math.round(convo.duration_minutes)}m
            </span>
          )}
          {avgAnxiety > 0 && <AnxietyBadge level={avgAnxiety} />}
        </div>

        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {topics.slice(0, 5).map((topic, i) => (
              <span key={i} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                {topic}
              </span>
            ))}
          </div>
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-3 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
                No message details available for this session.
              </p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
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
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function ChatHistory() {
  const navigate = useNavigate();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 100),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 p-4 md:p-6 pb-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="min-h-[44px] min-w-[44px] hover:bg-white/60 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <MessageCircle className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              Chat History
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Review past conversations and key moments
            </p>
          </div>
        </div>

        {/* Stats bar */}
        {!isLoading && conversations.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sessions</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{conversations.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Messages</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {conversations.reduce((sum, c) => sum + (c.message_count || 0), 0)}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total time</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {Math.round(conversations.reduce((sum, c) => sum + (c.duration_minutes || 0), 0))}m
              </p>
            </div>
          </div>
        )}

        {/* Conversations list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 p-12 text-center">
            <MessageCircle className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No conversations yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
              Chat sessions will appear here once your loved one starts using the AI companion.
            </p>
            <Button
              className="mt-6"
              onClick={() => navigate('/ChatMode')}
            >
              Start a Conversation
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((convo) => (
              <ConversationCard key={convo.id} convo={convo} />
            ))}
          </div>
        )}
import { ArrowLeft, MessageCircle, Clock, Calendar, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function ChatHistory() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 50).catch(() => [])
  });

  const getEraLabel = (era) => {
    const labels = {
      '1940s': '1940s Era',
      '1960s': '1960s Era',
      '1980s': '1980s Era',
      'present': 'Present Day',
      'auto': 'Auto',
    };
    return labels[era] || era || 'Unknown';
  };

  const getEraColor = (era) => {
    switch (era) {
      case '1940s': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case '1960s': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case '1980s': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  const getAnxietyColor = (level) => {
    if (!level) return 'text-slate-400';
    if (level >= 7) return 'text-red-500';
    if (level >= 4) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6 pb-16">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Chat History</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Review past conversations and key moments</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No conversations yet</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                Conversations will appear here after your loved one chats with the AI companion.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} recorded
              </p>
              {conversations.map((convo) => {
                const isExpanded = expandedId === convo.id;
                const messageCount = convo.messages?.length || 0;
                const userMessages = (convo.messages || []).filter(m => m.role === 'user');
                const peakAnxiety = convo.peak_anxiety_level;
                const era = convo.detected_era || convo.era;
                const date = convo.created_date || convo.session_date;

                return (
                  <div
                    key={convo.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : convo.id)}
                      className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {date && (
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 text-sm">
                                <Calendar className="w-4 h-4 shrink-0" />
                                <span>{format(new Date(date), 'MMM d, yyyy')}</span>
                              </div>
                            )}
                            {date && (
                              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                                <Clock className="w-4 h-4 shrink-0" />
                                <span>{format(new Date(date), 'h:mm a')}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {era && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getEraColor(era)}`}>
                                {getEraLabel(era)}
                              </span>
                            )}
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {messageCount} message{messageCount !== 1 ? 's' : ''}
                              {userMessages.length > 0 && ` (${userMessages.length} from patient)`}
                            </span>
                            {peakAnxiety > 0 && (
                              <span className={`flex items-center gap-1 text-xs font-medium ${getAnxietyColor(peakAnxiety)}`}>
                                <Brain className="w-3 h-3" />
                                Peak anxiety: {peakAnxiety}/10
                              </span>
                            )}
                          </div>
                          {convo.summary && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                              {convo.summary}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-slate-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </button>

                    {isExpanded && convo.messages?.length > 0 && (
                      <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {convo.messages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                                  msg.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
