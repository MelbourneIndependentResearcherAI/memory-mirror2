import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function MemoryTimelineBuilder() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [familyMemberName, setFamilyMemberName] = useState('');
  const [formData, setFormData] = useState({
    event_title: '',
    event_date: '',
    description: '',
    era: '1960s',
    category: 'other',
    people_involved: [],
    photo_url: ''
  });

  const { data: timeline = [], isLoading } = useQuery({
    queryKey: ['memory-timeline'],
    queryFn: () => base44.entities.MemoryTimeline.list('event_date')
  });

  const addEventMutation = useMutation({
    mutationFn: async (eventData) => {
      return await base44.entities.MemoryTimeline.create(eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-timeline'] });
      toast.success('Life event added to timeline!');
      setShowAdd(false);
      setFormData({
        event_title: '',
        event_date: '',
        description: '',
        era: '1960s',
        category: 'other',
        people_involved: [],
        photo_url: ''
      });
    }
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, photo_url: file_url });
      toast.success('Photo uploaded!');
    } catch {
      toast.error('Failed to upload photo');
    }
  };

  const handleSubmit = () => {
    if (!formData.event_title || !formData.event_date) {
      toast.error('Please fill in title and date');
      return;
    }

    const eventData = {
      ...formData,
      added_by_name: familyMemberName || 'Family Member'
    };

    addEventMutation.mutate(eventData);
  };

  const categoryIcons = {
    birth: '👶',
    wedding: '💒',
    graduation: '🎓',
    career: '💼',
    travel: '✈️',
    achievement: '🏆',
    family_gathering: '👨‍👩‍👧‍👦',
    other: '📅'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            🗓️ Memory Timeline
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Build a timeline of important life moments
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {showAdd && (
        <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <Input
                value={familyMemberName}
                onChange={(e) => setFamilyMemberName(e.target.value)}
                placeholder="e.g., John (Son)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Event Title</label>
              <Input
                value={formData.event_title}
                onChange={(e) => setFormData({ ...formData, event_title: e.target.value })}
                placeholder="e.g., Graduated from University"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded-lg dark:bg-slate-800"
                >
                  <option value="birth">Birth</option>
                  <option value="wedding">Wedding</option>
                  <option value="graduation">Graduation</option>
                  <option value="career">Career Milestone</option>
                  <option value="travel">Travel</option>
                  <option value="achievement">Achievement</option>
                  <option value="family_gathering">Family Gathering</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell the story of this moment..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Upload className="w-4 h-4 inline mr-1" />
                Add Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full"
              />
              {formData.photo_url && (
                <img
                  src={formData.photo_url}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover rounded-lg"
                />
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={addEventMutation.isPending}>
                Add to Timeline
              </Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          Loading timeline...
        </div>
      ) : timeline.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-xl">
          <Calendar className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            No events yet. Start building the timeline!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {timeline.map((event, _index) => (
            <div
              key={event.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border-l-4 border-purple-500"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-2xl">
                    {categoryIcons[event.category]}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{event.event_title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(event.event_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {event.photo_url && (
                      <img
                        src={event.photo_url}
                        alt={event.event_title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-3">
                    {event.description}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    Added by {event.added_by_name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}