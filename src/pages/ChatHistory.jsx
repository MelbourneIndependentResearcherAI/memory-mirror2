import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { offlineEntities } from '@/components/utils/offlineAPI';
import { format } from 'date-fns';

export default function ChatHistoryPage() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => offlineEntities.list('Conversation', '-created_date', 50)
  });

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
            <MessageCircle className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Chat History
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Review past conversations and key moments
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                No conversations yet
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                Conversations will appear here after the first AI chat session.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((convo) => {
                const isExpanded = expandedId === convo.id;
                const messageCount = convo.messages?.length || convo.message_count || 0;
                const date = convo.created_date
                  ? format(new Date(convo.created_date), 'MMM d, yyyy h:mm a')
                  : 'Unknown date';

                return (
                  <div
                    key={convo.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : convo.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg">
                          <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {convo.detected_era && convo.detected_era !== 'auto'
                              ? `${convo.detected_era} Era Chat`
                              : 'Chat Session'}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {date}
                            </span>
                            <span>{messageCount} messages</span>
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                    </button>

                    {isExpanded && convo.messages && convo.messages.length > 0 && (
                      <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-3 max-h-80 overflow-y-auto">
                        {convo.messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                                msg.role === 'user'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        ))}
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
