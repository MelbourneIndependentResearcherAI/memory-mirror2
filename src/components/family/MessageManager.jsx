import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, CheckCircle, Clock, Heart, Lightbulb, Calendar, Sun } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const messageTypeIcons = {
  encouragement: Heart,
  memory_prompt: Lightbulb,
  routine_reminder: Calendar,
  loving_note: Sun,
};

const contextLabels = {
  any_time: 'Any time',
  low_mood: 'When feeling down',
  evening: 'Evening time',
  morning: 'Morning time',
};

export default function MessageManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sender_name: '',
    message_type: 'loving_note',
    content: '',
    delivery_context: 'any_time',
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['familyMessages'],
    queryFn: () => base44.entities.FamilyMessage.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyMessages'] });
      setShowForm(false);
      setFormData({ sender_name: '', message_type: 'loving_note', content: '', delivery_context: 'any_time' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FamilyMessage.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['familyMessages'] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.sender_name && formData.content) {
      createMutation.mutate(formData);
    }
  };

  const pendingMessages = messages.filter(m => !m.is_delivered);
  const deliveredMessages = messages.filter(m => m.is_delivered);

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Heart className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Family Messages:</strong> Leave loving messages that the AI will naturally weave into conversations at appropriate moments.
        </AlertDescription>
      </Alert>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Leave a New Message
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>New Family Message</CardTitle>
            <CardDescription>This will be delivered naturally by the AI companion</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Name</label>
                <Input
                  value={formData.sender_name}
                  onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                  placeholder="e.g., Sarah, Your daughter"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Message Type</label>
                <Select value={formData.message_type} onValueChange={(v) => setFormData({ ...formData, message_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loving_note">💝 Loving Note</SelectItem>
                    <SelectItem value="encouragement">🌟 Encouragement</SelectItem>
                    <SelectItem value="memory_prompt">💭 Memory Prompt</SelectItem>
                    <SelectItem value="routine_reminder">🔔 Routine Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Your Message</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Share a loving message, memory, or reminder..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Deliver When</label>
                <Select value={formData.delivery_context} onValueChange={(v) => setFormData({ ...formData, delivery_context: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any_time">⏰ Any appropriate time</SelectItem>
                    <SelectItem value="low_mood">💙 When feeling down</SelectItem>
                    <SelectItem value="morning">🌅 Morning time</SelectItem>
                    <SelectItem value="evening">🌆 Evening time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isLoading}>
                  <Plus className="w-4 h-4 mr-2" />
                  {createMutation.isLoading ? 'Saving...' : 'Save Message'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          Pending Messages ({pendingMessages.length})
        </h3>
        {pendingMessages.length === 0 ? (
          <p className="text-slate-500 text-sm">No pending messages</p>
        ) : (
          pendingMessages.map((msg) => {
            const Icon = messageTypeIcons[msg.message_type];
            return (
              <Card key={msg.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">{msg.sender_name}</span>
                        <span className="text-xs text-slate-500">• {contextLabels[msg.delivery_context]}</span>
                      </div>
                      <p className="text-slate-700">{msg.content}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(msg.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {deliveredMessages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Delivered Messages ({deliveredMessages.length})
          </h3>
          {deliveredMessages.slice(0, 5).map((msg) => {
            const Icon = messageTypeIcons[msg.message_type];
            return (
              <Card key={msg.id} className="opacity-60">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium">{msg.sender_name}</span>
                        <span className="text-xs text-slate-500">
                          • Delivered {new Date(msg.delivered_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm">{msg.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}