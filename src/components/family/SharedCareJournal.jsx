import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, AlertCircle, CheckCircle, Mic, Play, Pause, Upload, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function SharedCareJournal({ patientProfileId }) {
  const queryClient = useQueryClient();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [filterImportant, setFilterImportant] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    mood_observed: 'calm',
    activities: '',
    is_important: false,
    requires_action: false,
    action_items: ''
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: journals = [], isLoading } = useQuery({
    queryKey: ['careJournals', patientProfileId],
    queryFn: () => {
      if (patientProfileId) {
        return base44.entities.CareJournal.filter({ patient_profile_id: patientProfileId }, '-created_date');
      }
      return base44.entities.CareJournal.list('-created_date');
    },
  });

  const createJournalMutation = useMutation({
    mutationFn: async (journalData) => base44.entities.CareJournal.create(journalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careJournals'] });
      toast.success('Journal entry saved and shared with family!');
      setShowNewEntry(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      notes: '',
      mood_observed: 'calm',
      activities: '',
      is_important: false,
      requires_action: false,
      action_items: ''
    });
    setCurrentAudio(null);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.notes) {
      toast.error('Please fill in title and notes');
      return;
    }

    try {
      let audioUrl = null;
      
      if (currentAudio) {
        const audioFile = new File([currentAudio.blob], `journal-${Date.now()}.webm`, {
          type: 'audio/webm',
        });
        const uploadResult = await base44.integrations.Core.UploadFile({ file: audioFile });
        audioUrl = uploadResult.file_url;
      }

      const journalData = {
        ...formData,
        audio_url: audioUrl,
        entry_date: new Date().toISOString(),
        patient_profile_id: patientProfileId || null,
        caregiver_name: user?.full_name || 'Caregiver',
        caregiver_email: user?.email || '',
        activities: formData.activities.split(',').map(a => a.trim()).filter(Boolean),
        action_items: formData.action_items.split(',').map(a => a.trim()).filter(Boolean),
        shared_with_family: true
      };

      await createJournalMutation.mutateAsync(journalData);
    } catch (error) {
      toast.error('Failed to save journal entry');
      console.error(error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setCurrentAudio({ blob: audioBlob, url: audioUrl });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 60000); // Auto-stop after 1 minute
    } catch (error) {
      toast.error('Could not access microphone');
      console.error(error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const filteredJournals = filterImportant 
    ? journals.filter(j => j.is_important || j.requires_action)
    : journals;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-blue-600" />
            Care Journal
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Shared with authorized family members • {journals.length} entries
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterImportant ? 'default' : 'outline'}
            onClick={() => setFilterImportant(!filterImportant)}
            size="sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            {filterImportant ? 'All' : 'Important Only'}
          </Button>
          <Button
            onClick={() => setShowNewEntry(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* New Entry Form */}
      {showNewEntry && (
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>New Care Journal Entry</span>
              <Button variant="ghost" size="icon" onClick={() => setShowNewEntry(false)}>
                <X className="w-5 h-5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Entry Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Morning routine - February 26th"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Observations & Notes *</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Document behavior, mood, activities, concerns, progress..."
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mood Observed</label>
                <select
                  value={formData.mood_observed}
                  onChange={(e) => setFormData({ ...formData, mood_observed: e.target.value })}
                  className="w-full p-2 border rounded-lg dark:bg-slate-800"
                >
                  <option value="calm">😌 Calm</option>
                  <option value="happy">😊 Happy</option>
                  <option value="anxious">😰 Anxious</option>
                  <option value="confused">😕 Confused</option>
                  <option value="agitated">😣 Agitated</option>
                  <option value="peaceful">😇 Peaceful</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Activities</label>
                <Input
                  value={formData.activities}
                  onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                  placeholder="walked, ate lunch, chatted"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_important}
                  onChange={(e) => setFormData({ ...formData, is_important: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">⭐ Mark as Important</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requires_action}
                  onChange={(e) => setFormData({ ...formData, requires_action: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">🔔 Requires Follow-up</span>
              </label>
            </div>

            {formData.requires_action && (
              <div>
                <label className="block text-sm font-medium mb-2">Action Items</label>
                <Textarea
                  value={formData.action_items}
                  onChange={(e) => setFormData({ ...formData, action_items: e.target.value })}
                  placeholder="List specific actions needed (comma separated)"
                  rows={2}
                />
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Audio Recording (Optional)
              </h4>
              {!currentAudio && !isRecording && (
                <Button onClick={startRecording} variant="outline" size="sm">
                  <Mic className="w-4 h-4 mr-2" />
                  Record Voice Note
                </Button>
              )}
              {isRecording && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm">Recording...</span>
                  <Button onClick={stopRecording} variant="outline" size="sm">Stop</Button>
                </div>
              )}
              {currentAudio && (
                <audio controls src={currentAudio.url} className="w-full mt-2" />
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowNewEntry(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.title || !formData.notes}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save & Share with Family
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journal Entries */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-600">Loading journal...</div>
      ) : filteredJournals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              {filterImportant ? 'No important entries yet' : 'No journal entries yet. Start documenting care observations.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJournals.map((journal) => (
            <Card key={journal.id} className={journal.is_important ? 'border-2 border-amber-400' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {journal.title}
                      {journal.is_important && <span className="text-amber-500">⭐</span>}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {new Date(journal.entry_date || journal.created_date).toLocaleDateString()}
                      </Badge>
                      <Badge className={
                        journal.mood_observed === 'happy' ? 'bg-green-100 text-green-800' :
                        journal.mood_observed === 'anxious' ? 'bg-orange-100 text-orange-800' :
                        journal.mood_observed === 'agitated' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {journal.mood_observed}
                      </Badge>
                      {journal.requires_action && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Action Required
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {journal.notes}
                </p>

                {journal.activities?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Activities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {journal.activities.map((activity, idx) => (
                        <Badge key={idx} variant="outline">{activity}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {journal.action_items?.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Action Items:
                    </h4>
                    <ul className="space-y-1">
                      {journal.action_items.map((item, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {journal.audio_url && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">🎙️ Audio Note:</h4>
                    <audio controls src={journal.audio_url} className="w-full" />
                  </div>
                )}

                <div className="text-xs text-slate-500 border-t pt-3">
                  Logged by {journal.caregiver_name || 'Caregiver'} • 
                  {journal.shared_with_family ? ' 👥 Shared with family' : ' 🔒 Private'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}