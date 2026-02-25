import React, { useState } from 'react';
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
