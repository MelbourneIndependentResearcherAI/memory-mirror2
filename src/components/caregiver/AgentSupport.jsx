import React, { useState, useEffect } from 'react';
import { MessageCircle, Bot, Send, Loader2, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';

export default function AgentSupport() {
  const [showChat, setShowChat] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const agents = [
    {
      name: 'support_assistant',
      title: 'Support Assistant',
      icon: '💬',
      description: '24/7 help with features and troubleshooting',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'caregiver_assistant',
      title: 'Caregiver Assistant',
      icon: '🤝',
      description: 'Personal helper for data management',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  useEffect(() => {
    // Check if user is admin/caregiver
    const checkUser = async () => {
      try {
        const user = await base44.auth.me();
        // Only show AI assistants to admin/caregiver users
        const userIsAdmin = user && user.role === 'admin';
        setIsAdmin(userIsAdmin);
      } catch (error) {
        // Not authenticated = not an admin
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (conversation) {
      const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
        setMessages(data.messages);
      });
      return unsubscribe;
    }
  }, [conversation]);

  const startConversation = async (agentName) => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: agentName,
        metadata: {
          name: `${agentName} - ${new Date().toLocaleDateString()}`,
          started_at: new Date().toISOString()
        }
      });
      setConversation(conv);
      setActiveAgent(agentName);
      setShowChat(true);
      setMessages(conv.messages || []);
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversation || isSending) return;

    const userMessage = input.trim();
    setInput('');
    setIsSending(true);

    try {
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Don't render anything while checking auth or if not admin
  if (isLoading || !isAdmin) return null;

  if (showChat && conversation) {
    const agent = agents.find(a => a.name === activeAgent);
    return (
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:inset-auto md:bottom-0 md:right-0 md:w-96 md:h-[600px] md:rounded-t-2xl md:bg-transparent md:backdrop-blur-none">
        <div className="flex flex-col h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-t-2xl md:rounded-2xl shadow-2xl border-2 border-slate-200/50 dark:border-slate-700/50 md:border-slate-200/50">
        <div className={`flex items-center justify-between p-4 bg-gradient-to-r ${agent.color} text-white rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{agent.icon}</span>
            <div>
              <h3 className="font-bold">{agent.title}</h3>
              <p className="text-xs opacity-90">Always here to help</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowChat(false);
              setConversation(null);
              setMessages([]);
            }}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 min-h-[44px]"
              disabled={isSending}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isSending}
              className="min-h-[44px] min-w-[44px] bg-blue-500 hover:bg-blue-600"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
      <Button
        onClick={() => {
          setShowChat(true);
          if (!conversation && agents.length > 0) {
            startConversation(agents[0].name);
          }
        }}
        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 shadow-lg rounded-full w-14 h-14 flex items-center justify-center min-h-[56px] min-w-[56px] p-0"
        title="Chat with AI assistants"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    </div>
  );
}