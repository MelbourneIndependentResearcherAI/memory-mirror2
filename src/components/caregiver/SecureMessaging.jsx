import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Plus, Archive, X, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function SecureMessaging() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConvTitle, setNewConvTitle] = useState('');
  const [newConvParticipants, setNewConvParticipants] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const allConversations = await base44.entities.SecureConversation.list();
      return allConversations.filter(conv => 
        conv.participants.some(p => p.email === currentUser?.email) && !conv.is_archived
      );
    },
    enabled: !!currentUser,
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation) return [];
      return await base44.entities.SecureMessage.filter(
        { conversation_id: selectedConversation.id },
        '-created_date',
        100
      );
    },
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      return await base44.entities.SecureMessage.create({
        conversation_id: selectedConversation.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        sender_role: currentUser.role || 'caregiver',
        content,
        message_type: 'text',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageText('');
      toast.success('Message sent');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const participants = newConvParticipants
        .split(',')
        .map(email => ({
          email: email.trim(),
          name: email.trim().split('@')[0],
          role: 'family_member',
        }))
        .concat([{
          email: currentUser.email,
          name: currentUser.full_name,
          role: currentUser.role || 'caregiver',
        }]);

      return await base44.entities.SecureConversation.create({
        patient_profile_id: 'general',
        title: newConvTitle,
        participants,
        created_by_email: currentUser.email,
        encryption_enabled: true,
      });
    },
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setSelectedConversation(newConv);
      setShowNewConversation(false);
      setNewConvTitle('');
      setNewConvParticipants('');
      toast.success('Conversation created');
    },
    onError: () => {
      toast.error('Failed to create conversation');
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim() && selectedConversation) {
      sendMessageMutation.mutate(messageText.trim());
    }
  };

  const handleCreateConversation = (e) => {
    e.preventDefault();
    if (newConvTitle.trim() && newConvParticipants.trim()) {
      createConversationMutation.mutate();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-screen bg-white dark:bg-slate-900">
      {/* Conversations List */}
      <div className="lg:col-span-1 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
        <div className="p-4 sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Messages</h2>
          <Button
            onClick={() => setShowNewConversation(true)}
            className="w-full gap-2"
            size="sm"
          >
            <Plus className="w-4 h-4" /> New Chat
          </Button>
        </div>

        <div className="p-4 space-y-2">
          {conversationsLoading ? (
            <p className="text-slate-500">Loading conversations...</p>
          ) : conversations.length === 0 ? (
            <p className="text-slate-500 text-sm">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <motion.button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                whileHover={{ x: 4 }}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedConversation?.id === conv.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="font-medium text-slate-900 dark:text-white truncate">
                  {conv.title}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 truncate">
                  {conv.last_message_preview || 'No messages yet'}
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      {selectedConversation ? (
        <motion.div
          key={selectedConversation.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:col-span-2 flex flex-col bg-slate-50 dark:bg-slate-800"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              {selectedConversation.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {selectedConversation.participants.length} participant{selectedConversation.participants.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messagesLoading ? (
              <p className="text-center text-slate-500">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender_email === currentUser?.email ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender_email === currentUser?.email
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {msg.sender_email !== currentUser?.email && (
                      <p className="text-xs font-semibold opacity-75 mb-1">{msg.sender_name}</p>
                    )}
                    <p className="break-words">{msg.content}</p>
                    <div className={`text-xs mt-1 flex items-center gap-1 ${
                      msg.sender_email === currentUser?.email
                        ? 'text-blue-100'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {new Date(msg.created_date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {msg.sender_email === currentUser?.email && (
                        msg.read_by?.length > 0 ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a secure message..."
                className="min-h-12 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleSendMessage(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!messageText.trim() || sendMessageMutation.isPending}
                size="icon"
                className="self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="lg:col-span-2 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">Select a conversation to start messaging</p>
            <Button onClick={() => setShowNewConversation(true)}>Create New Conversation</Button>
          </div>
        </div>
      )}

      {/* New Conversation Modal */}
      <AnimatePresence>
        {showNewConversation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Conversation</h3>
                <button
                  onClick={() => setShowNewConversation(false)}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateConversation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Conversation Title
                  </label>
                  <Input
                    value={newConvTitle}
                    onChange={(e) => setNewConvTitle(e.target.value)}
                    placeholder="e.g., Care Plan Discussion"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Add Participants
                  </label>
                  <Textarea
                    value={newConvParticipants}
                    onChange={(e) => setNewConvParticipants(e.target.value)}
                    placeholder="Enter email addresses separated by commas"
                    className="min-h-20"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Separate multiple emails with commas
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewConversation(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createConversationMutation.isPending}
                  >
                    Create Conversation
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}