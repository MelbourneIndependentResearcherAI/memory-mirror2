import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, ChevronDown, ChevronUp, User, Bot } from 'lucide-react';
import { format } from 'date-fns';

const ERA_LABELS = {
  '1940s': '1940s Era',
  '1960s': '1960s Era',
  '1980s': '1980s Era',
  'present': 'Present Day',
};

const ERA_COLORS = {
  '1940s': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  '1960s': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  '1980s': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'present': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

const ANXIETY_COLORS = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function getAnxietyLabel(level) {
  if (!level || level <= 3) return { label: 'Calm', color: ANXIETY_COLORS.low };
  if (level <= 6) return { label: 'Mild Anxiety', color: ANXIETY_COLORS.medium };
  return { label: 'High Anxiety', color: ANXIETY_COLORS.high };
}

function ConversationCard({ conversation }) {
  const [expanded, setExpanded] = useState(false);
  const messages = conversation.messages || [];
  const era = conversation.detected_era || 'present';
  const anxietyInfo = getAnxietyLabel(conversation.anxiety_level);
  const messageCount = messages.length;

  const formattedDate = conversation.created_date
    ? format(new Date(conversation.created_date), 'MMM d, yyyy h:mm a')
    : 'Unknown date';

  return (
    <Card className="border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ERA_COLORS[era] || ERA_COLORS.present}`}>
                  {ERA_LABELS[era] || era}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${anxietyInfo.color}`}>
                  {anxietyInfo.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
                <span>·</span>
                <span>{messageCount} message{messageCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 min-h-[36px] text-slate-600 dark:text-slate-400"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span className="ml-1 text-xs">{expanded ? 'Collapse' : 'View'}</span>
          </Button>
        </div>
      </CardHeader>

      {expanded && messages.length > 0 && (
        <CardContent className="pt-0">
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 max-h-80 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-500'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-4 h-4 text-white" />
                    : <Bot className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  }
                </div>
                <div className={`rounded-2xl px-3 py-2 text-sm max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {expanded && messages.length === 0 && (
        <CardContent className="pt-0">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4 border-t border-slate-100 dark:border-slate-800">
            No messages recorded for this conversation.
          </p>
        </CardContent>
      )}
    </Card>
  );
}

export default function ChatHistory({ onBack }) {
  const [filter, setFilter] = useState('all');

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 50),
  });

  const filteredConversations = conversations.filter((conv) => {
    if (filter === 'all') return true;
    if (filter === 'anxious') return (conv.anxiety_level || 0) > 5;
    if (filter === '1940s') return conv.detected_era === '1940s';
    if (filter === '1960s') return conv.detected_era === '1960s';
    if (filter === '1980s') return conv.detected_era === '1980s';
    if (filter === 'present') return conv.detected_era === 'present' || !conv.detected_era;
    return true;
  });

  const filters = [
    { id: 'all', label: 'All Conversations' },
    { id: 'anxious', label: 'High Anxiety' },
    { id: 'present', label: 'Present Day' },
    { id: '1940s', label: '1940s Era' },
    { id: '1960s', label: '1960s Era' },
    { id: '1980s', label: '1980s Era' },
  ];

  const totalMessages = conversations.reduce((sum, c) => sum + (c.messages?.length || 0), 0);
  const highAnxietyCount = conversations.filter(c => (c.anxiety_level || 0) > 5).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Chat History</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Review past conversations with your loved one</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{conversations.length}</div>
          <div className="text-xs text-blue-600 dark:text-blue-500 mt-1">Conversations</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">{totalMessages}</div>
          <div className="text-xs text-green-600 dark:text-green-500 mt-1">Total Messages</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">{highAnxietyCount}</div>
          <div className="text-xs text-red-600 dark:text-red-500 mt-1">High Anxiety</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px] ${
              filter === f.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Conversation List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {conversations.length === 0 ? 'No conversations recorded yet' : 'No conversations match this filter'}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            {conversations.length === 0
              ? 'Conversations will appear here as your loved one chats with Memory Mirror'
              : 'Try a different filter to see more conversations'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((conv, idx) => (
            <ConversationCard key={conv.id || idx} conversation={conv} />
          ))}
        </div>
      )}
    </div>
  );
}