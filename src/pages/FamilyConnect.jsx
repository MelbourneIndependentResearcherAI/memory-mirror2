import React, { useState } from 'react';
import { Users, Heart, Share2, MessageCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

export default function FamilyConnect() {
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [email, setEmail] = useState('');
  const queryClient = useQueryClient();

  const { data: familyMessages = [] } = useQuery({
    queryKey: ['familyMessages'],
    queryFn: () => base44.entities.FamilyMessage.list()
  });

  const { data: sharedMemories = [] } = useQuery({
    queryKey: ['sharedMemories'],
    queryFn: () => base44.entities.SharedMemory.list()
  });

  const addFamilyMutation = useMutation({
    mutationFn: async () => {
      // Mock function - would normally invite via email
      return { email, invited: true };
    },
    onSuccess: () => {
      setEmail('');
      setShowAddFamily(false);
      queryClient.invalidateQueries({ queryKey: ['familyMessages'] });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 dark:from-slate-950 dark:via-pink-950 dark:to-red-950 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-12 h-12 text-rose-600" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Family Connect</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300">Stay connected with loved ones</p>
        </div>

        {/* Add Family Member */}
        {!showAddFamily ? (
          <motion.div
            whileHover={{ y: -2 }}
            onClick={() => setShowAddFamily(true)}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6 cursor-pointer border-2 border-dashed border-pink-300 dark:border-pink-700 text-center"
          >
            <Plus className="w-8 h-8 text-pink-600 mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-900 dark:text-white">Invite Family Member</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Add more people to stay connected</p>
          </motion.div>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-6">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border-2 border-pink-300 rounded-lg mb-3"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => addFamilyMutation.mutate()}
                  className="flex-1 bg-pink-600 hover:bg-pink-700"
                >
                  Invite
                </Button>
                <Button
                  onClick={() => setShowAddFamily(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shared Memories */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-rose-600" />
            Shared Memories
          </h2>
          <div className="grid gap-4">
            {sharedMemories.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400 text-center py-8">No shared memories yet</p>
            ) : (
              sharedMemories.map((memory) => (
                <motion.div
                  key={memory.id}
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border-l-4 border-rose-500"
                >
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{memory.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{memory.content}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Shared by {memory.shared_by_name}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Messages */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-rose-600" />
            Recent Messages
          </h2>
          <div className="grid gap-4">
            {familyMessages.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400 text-center py-8">No messages yet</p>
            ) : (
              familyMessages.slice(0, 5).map((msg) => (
                <motion.div
                  key={msg.id}
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border-l-4 border-blue-500"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">{msg.from_name}</p>
                  <p className="text-slate-700 dark:text-slate-300 mt-2">{msg.content}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                    {new Date(msg.created_date).toLocaleDateString()}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}