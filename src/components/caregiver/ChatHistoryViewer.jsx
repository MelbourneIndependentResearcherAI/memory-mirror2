import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Clock, ChevronDown, ChevronUp, Search, ArrowLeft, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MessageCircle, Clock, Search, Loader2, CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format, isToday, isYesterday } from 'date-fns';

function formatRelativeDate(dateStr) {
  const date = new Date(dateStr);
  if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
  if (isYesterday(date)) return `Yesterday at ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d, yyyy h:mm a');
}

export default function ChatHistoryViewer() {
  const [search, setSearch] = useState('');

  const { data: activityLogs = [], isLoading: loadingActivity } = useQuery({
    queryKey: ['chatActivityLogs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 100).catch(() => [])
  });

  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['chatConversations'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 100).catch(() => [])
  });

  const isLoading = loadingActivity || loadingConversations;

  // Filter activity logs to only chat-related ones
  const chatLogs = activityLogs.filter(log =>
    log.activity_type === 'chat' ||
    log.activity_type === 'anxiety_detected' ||
    log.activity_type === 'bad_day_mode'
  );

  // Merge and de-duplicate by date proximity, grouping into sessions
  const allEvents = [
    ...chatLogs.map(log => ({
      id: `log-${log.id}`,
      source: 'activity',
      date: log.created_date,
      type: log.activity_type,
      details: log.details || {},
      anxiety_level: log.anxiety_level
    })),
    ...conversations.map(conv => ({
      id: `conv-${conv.id}`,
      source: 'conversation',
      date: conv.created_date,
      type: 'conversation',
      details: conv,
      summary: conv.summary || null,
      era: conv.era || null,
      message_count: conv.message_count || null,
      sentiment_score: conv.sentiment_score || null
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const lowerSearch = search.toLowerCase();
  const filtered = allEvents.filter(event => {
    if (!search) return true;
    const detailsText = JSON.stringify(event.details || '').toLowerCase();
    const summary = (event.summary || '').toLowerCase();
    const era = (event.era || '').toLowerCase();
    const type = (event.type || '').replace(/_/g, ' ').toLowerCase();
    return detailsText.includes(lowerSearch) || summary.includes(lowerSearch) || era.includes(lowerSearch) || type.includes(lowerSearch);
  });

  const getTypeLabel = (type) => {
    switch (type) {
      case 'chat': return 'Chat Message';
      case 'anxiety_detected': return 'Anxiety Detected';
      case 'bad_day_mode': return 'Bad Day Mode';
      case 'conversation': return 'Conversation Session';
      default: return type.replace(/_/g, ' ');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'anxiety_detected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'bad_day_mode': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'conversation': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MessageCircle className="w-7 h-7 text-blue-500" />
          Chat History
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Review conversations and key moments with your loved one
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search chat history..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            {search ? 'No results found for your search.' : 'No chat history yet.'}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
            {!search && 'Chat history will appear here after conversations with the AI companion.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => (
            <Card key={event.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getTypeColor(event.type)}`}>
                      {getTypeLabel(event.type)}
                    </span>
                    {event.era && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
                        {event.era}
                      </span>
                    )}
                    {event.anxiety_level !== undefined && event.anxiety_level !== null && (
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        event.anxiety_level >= 7 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        event.anxiety_level >= 4 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        Anxiety: {event.anxiety_level}/10
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    {formatRelativeDate(event.date)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {event.summary && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{event.summary}</p>
                )}
                {event.type === 'chat' && event.details?.message_length && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Message length: <span className="font-medium">{event.details.message_length} chars</span>
                    {event.details.era && (
                      <span className="ml-2 text-slate-500">· Era: {event.details.era}</span>
                    )}
                    {event.details.language && event.details.language !== 'en' && (
                      <span className="ml-2 text-slate-500">· Language: {event.details.language}</span>
                    )}
                  </p>
                )}
                {event.type === 'anxiety_detected' && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Anxiety was detected during this conversation.
                    {event.details?.trigger && (
                      <span className="ml-1 text-slate-600 dark:text-slate-400">
                        Trigger: {event.details.trigger}
                      </span>
                    )}
                  </p>
                )}
                {event.type === 'conversation' && event.message_count !== null && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {event.message_count} {event.message_count === 1 ? 'message' : 'messages'} exchanged
                    {event.sentiment_score !== null && (
                      <span className="ml-2 text-slate-500">· Sentiment: {event.sentiment_score}/10</span>
                    )}
                  </p>
                )}
                {event.type === 'bad_day_mode' && (
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Bad Day Mode was activated to provide comfort and support.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 pt-2">
            <CalendarDays className="w-3.5 h-3.5" />
            Showing {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
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
    'present': 'Present Day',
  };
  return labels[era] || era || 'Unknown';
}

export default function ChatHistoryViewer({ onBack }) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['chatHistoryViewer'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 100).catch(() => []),
  });

  const filtered = conversations.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.summary || '').toLowerCase().includes(q) ||
      (c.detected_era || '').toLowerCase().includes(q) ||
      (c.session_theme || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 min-h-[44px]">
          <ArrowLeft className="w-5 h-5" /> Back
        </Button>
      )}

      <CardTitle className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-blue-500" />
        Conversation History
      </CardTitle>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No conversations found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(conv => {
            const isExpanded = expandedId === conv.id;
            const date = conv.created_date || conv.date;
            const messages = conv.messages ? (typeof conv.messages === 'string' ? JSON.parse(conv.messages) : conv.messages) : [];
            return (
              <Card key={conv.id} className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 items-center">
                        {date && (
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {format(new Date(date), 'MMM d, yyyy — h:mm a')}
                          </span>
                        )}
                        {conv.detected_era && (
                          <Badge variant="outline" className="text-xs">{getEraLabel(conv.detected_era)}</Badge>
                        )}
                        {conv.anxiety_level != null && (
                          <Badge className={conv.anxiety_level >= 7 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                            Anxiety: {conv.anxiety_level}/10
                          </Badge>
                        )}
                      </div>
                      {conv.message_count != null && (
                        <p className="text-xs text-slate-500 mt-1">{conv.message_count} messages</p>
                      )}
                      {conv.summary && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{conv.summary}</p>
                      )}
                    </div>
                    {messages.length > 0 && (
                      <Button variant="ghost" size="icon" onClick={() => setExpandedId(isExpanded ? null : conv.id)} className="min-h-[36px] min-w-[36px]">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                {isExpanded && messages.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="space-y-2 max-h-64 overflow-y-auto border-t border-slate-100 dark:border-slate-800 pt-3">
                      {messages.map((m, i) => (
                        <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            m.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}>
                            {m.content}
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
