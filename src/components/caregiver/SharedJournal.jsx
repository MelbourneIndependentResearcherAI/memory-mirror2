import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, User, Calendar, Tag, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import AIJournalAssistant from './AIJournalAssistant';

export default function SharedJournal({ patientProfileId }) {
  const queryClient = useQueryClient();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    entry_text: '',
    tags: '',
    observations: ''
  });

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch care team to show who has access
  const { data: careTeam = [] } = useQuery({
    queryKey: ['careTeam', patientProfileId],
    queryFn: async () => {
      if (!patientProfileId) return [];
      return await base44.entities.CaregiverTeam.filter({ patient_profile_id: patientProfileId });
    },
    enabled: !!patientProfileId
  });

  // Fetch journal entries
  const { data: journalEntries = [], isLoading } = useQuery({
    queryKey: ['careJournal', patientProfileId],
    queryFn: async () => {
      const entries = await base44.entities.CareJournal.list('-created_date', 100);
      return entries;
    },
    refetchInterval: 30000
  });

  // Create entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (data) => {
      const entry = await base44.entities.CareJournal.create({
        ...data,
        caregiver_name: currentUser?.full_name || currentUser?.email,
        caregiver_email: currentUser?.email,
        patient_profile_id: patientProfileId
      });

      // Notify other caregivers with journal notification preference
      const notifyTeam = careTeam.filter(
        m => m.caregiver_email !== currentUser?.email && 
        m.notification_preferences?.journal_entries
      );

      for (const member of notifyTeam) {
        await base44.entities.CaregiverNotification.create({
          patient_profile_id: patientProfileId,
          notification_type: 'new_journal_entry',
          severity: 'low',
          title: 'New Journal Entry',
          message: `${currentUser?.full_name || 'A caregiver'} added a new journal entry`,
          data: {
            caregiver: currentUser?.full_name,
            preview: data.entry_text.substring(0, 100)
          },
          triggered_by: 'manual_journal_entry'
        });
      }

      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['careJournal']);
      setShowNewEntry(false);
      setNewEntry({ entry_text: '', tags: '', observations: '' });
      toast.success('Journal entry added');
    },
    onError: (error) => {
      toast.error('Failed to add entry: ' + error.message);
    }
  });

  const handleAddEntry = () => {
    if (!newEntry.entry_text.trim()) {
      toast.error('Please write an entry');
      return;
    }
    createEntryMutation.mutate(newEntry);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Shared Care Journal</h2>
            <p className="text-sm text-slate-600">
              Visible to all {careTeam.length} team members
            </p>
          </div>
        </div>
        <Button onClick={() => setShowNewEntry(!showNewEntry)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Entry
        </Button>
      </div>

      {/* New Entry Form */}
      <AnimatePresence>
        {showNewEntry && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>New Journal Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Entry</Label>
                  <Textarea
                    placeholder="Describe observations, interactions, changes in behavior, medication updates, etc."
                    value={newEntry.entry_text}
                    onChange={(e) => setNewEntry({ ...newEntry, entry_text: e.target.value })}
                    rows={5}
                  />
                </div>

                <div>
                  <Label>Observations / Notes</Label>
                  <Textarea
                    placeholder="Additional observations (mood, appetite, sleep, etc.)"
                    value={newEntry.observations}
                    onChange={(e) => setNewEntry({ ...newEntry, observations: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    placeholder="e.g., medication, anxiety, positive-day, confusion"
                    value={newEntry.tags}
                    onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewEntry(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddEntry}
                    disabled={createEntryMutation.isPending}
                  >
                    {createEntryMutation.isPending ? 'Saving...' : 'Save Entry'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journal Entries */}
      <div className="space-y-4">
        {journalEntries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {entry.caregiver_name || 'Unknown Caregiver'}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {entry.caregiver_email}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(entry.created_date).toLocaleDateString()} at{' '}
                      {new Date(entry.created_date).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none mb-3">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {entry.entry_text}
                    </p>
                  </div>

                  {entry.observations && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-blue-900">Observations</div>
                          <div className="text-blue-700">{entry.observations}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {entry.tags && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.split(',').map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {journalEntries.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold mb-2">No Journal Entries Yet</h3>
              <p className="text-sm text-slate-600 mb-4">
                Start documenting daily observations and care notes
              </p>
              <Button onClick={() => setShowNewEntry(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Entry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}