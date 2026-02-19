import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Music, Image as ImageIcon, BookOpen, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function RemoteTriggerPanel() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState('memory_prompt');
  const [familyMemberName, setFamilyMemberName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedContent, setSelectedContent] = useState(null);

  const { data: memories = [] } = useQuery({
    queryKey: ['memories'],
    queryFn: () => base44.entities.Memory.list('-created_date', 20)
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => base44.entities.Playlist.list('-created_date', 20)
  });

  const { data: stories = [] } = useQuery({
    queryKey: ['stories'],
    queryFn: () => base44.entities.Story.list('-created_date', 20)
  });

  const { data: photos = [] } = useQuery({
    queryKey: ['family-photos-trigger'],
    queryFn: () => base44.entities.FamilyMedia.filter({ media_type: 'photo' }, '-created_date', 20)
  });

  const triggerMutation = useMutation({
    mutationFn: async (triggerData) => {
      return await base44.entities.RemoteTrigger.create(triggerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remote-triggers'] });
      toast.success('Sent to your loved one! 💙');
      setMessage('');
      setSelectedContent(null);
    }
  });

  const handleSendTrigger = () => {
    if (!selectedContent) {
      toast.error('Please select content to send');
      return;
    }

    const triggerData = {
      trigger_type: selectedType,
      content_id: selectedContent.id,
      content_title: selectedContent.title || selectedContent.name,
      message_to_loved_one: message,
      triggered_by_name: familyMemberName || 'Family Member',
      trigger_status: 'pending'
    };

    triggerMutation.mutate(triggerData);
  };

  const getContentList = () => {
    switch (selectedType) {
      case 'memory_prompt':
        return memories;
      case 'music_playback':
        return playlists;
      case 'story':
        return stories;
      case 'photo_show':
        return photos;
      default:
        return [];
    }
  };

  const contentList = getContentList();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          📡 Send to Memory Mirror
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Remotely trigger memories, music, or stories on your loved one's device
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <Input
              value={familyMemberName}
              onChange={(e) => setFamilyMemberName(e.target.value)}
              placeholder="e.g., Sarah"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">What to Send</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => setSelectedType('memory_prompt')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedType === 'memory_prompt'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
              >
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium">Memory</p>
              </button>

              <button
                onClick={() => setSelectedType('music_playback')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedType === 'music_playback'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
                }`}
              >
                <Music className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                <p className="text-sm font-medium">Music</p>
              </button>

              <button
                onClick={() => setSelectedType('story')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedType === 'story'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-green-300'
                }`}
              >
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium">Story</p>
              </button>

              <button
                onClick={() => setSelectedType('photo_show')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedType === 'photo_show'
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-pink-300'
                }`}
              >
                <ImageIcon className="w-6 h-6 mx-auto mb-2 text-pink-600 dark:text-pink-400" />
                <p className="text-sm font-medium">Photo</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select {selectedType === 'memory_prompt' ? 'Memory' : selectedType === 'music_playback' ? 'Playlist' : selectedType === 'story' ? 'Story' : 'Photo'}
            </label>
            <select
              value={selectedContent?.id || ''}
              onChange={(e) => {
                const content = contentList.find(c => c.id === e.target.value);
                setSelectedContent(content);
              }}
              className="w-full p-3 border rounded-lg dark:bg-slate-800"
            >
              <option value="">Choose one...</option>
              {contentList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title || item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Personal Message (Optional)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a loving message to go with this..."
              rows={3}
            />
          </div>

          <Button
            onClick={handleSendTrigger}
            disabled={!selectedContent || triggerMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Send to Memory Mirror Now
          </Button>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          💡 <strong>How it works:</strong> Your loved one will receive a gentle notification to view what you've sent. Perfect for brightening their day!
        </p>
      </div>
    </div>
  );
}