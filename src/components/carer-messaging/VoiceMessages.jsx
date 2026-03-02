import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, Play, Pause, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

function getContacts() {
  try { return JSON.parse(localStorage.getItem('carerContacts') || '[]'); } catch { return []; }
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VoiceMessages() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('carerVoiceRecordings') || '[]'); } catch { return []; }
  });
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingId, setPlayingId] = useState(null);
  const [sending, setSending] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRefs = useRef({});

  useEffect(() => {
    setContacts(getContacts());
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const saveRecordings = (recs) => {
    setRecordings(recs);
    // Store metadata only (not blobs — they don't survive localStorage)
    const meta = recs.map(r => ({ ...r, blobUrl: null }));
    localStorage.setItem('carerVoiceRecordings', JSON.stringify(meta));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = e => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const blobUrl = URL.createObjectURL(blob);
        const rec = {
          id: Date.now().toString(),
          blobUrl,
          blob,
          duration: recordingTime,
          time: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString(),
        };
        const updated = [rec, ...recordings];
        setRecordings(updated);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
      toast.info('Recording started...');
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      toast.success('Recording saved');
    }
  };

  const togglePlay = (rec) => {
    if (playingId === rec.id) {
      audioRefs.current[rec.id]?.pause();
      setPlayingId(null);
    } else {
      // Pause any other playing
      Object.values(audioRefs.current).forEach(a => a?.pause());
      setPlayingId(null);
      const audio = audioRefs.current[rec.id];
      if (audio) {
        audio.play();
        setPlayingId(rec.id);
        audio.onended = () => setPlayingId(null);
      }
    }
  };

  const deleteRecording = (id) => {
    const updated = recordings.filter(r => r.id !== id);
    saveRecordings(updated);
  };

  const sendVoiceMessage = async (rec) => {
    if (!selectedContact) { toast.error('Select a contact first'); return; }
    if (!rec.blob) { toast.error('Recording not available — please record again'); return; }
    setSending(rec.id);
    try {
      const file = new File([rec.blob], 'voice-note.webm', { type: 'audio/webm' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      await base44.entities.FamilyChat.create({
        sender_name: 'Carer',
        sender_email: 'carer@memorymirror.app',
        message_type: 'voice',
        message_content: `Voice note from Carer (${formatDuration(rec.duration)})`,
        media_url: file_url,
        recipient_name: selectedContact.name,
      });

      toast.success(`Voice note sent to ${selectedContact.name}!`);
    } catch {
      toast.error('Failed to send voice note');
    }
    setSending(null);
  };

  return (
    <div className="space-y-5">
      {/* Contact selector */}
      <Card className="p-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Send to:</p>
        {contacts.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No contacts yet — add them in the Contacts tab</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {contacts.map(c => (
              <button key={c.id} onClick={() => setSelectedContact(selectedContact?.id === c.id ? null : c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
                  selectedContact?.id === c.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                }`}>
                {c.emoji || '👤'} {c.name}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Record button */}
      <Card className="p-6 flex flex-col items-center gap-4">
        <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all ${
          isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
        }`}>
          <Mic className="w-14 h-14 text-white" />
        </div>
        {isRecording && (
          <div className="text-2xl font-bold text-red-600 font-mono">{formatDuration(recordingTime)}</div>
        )}
        <div className="flex gap-3">
          {!isRecording ? (
            <Button onClick={startRecording} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-2xl">
              <Mic className="w-5 h-5 mr-2" /> Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} className="bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-lg rounded-2xl">
              <Square className="w-5 h-5 mr-2" /> Stop
            </Button>
          )}
        </div>
        <p className="text-xs text-slate-400">Tap to record · Tap again to stop</p>
      </Card>

      {/* Recordings list */}
      {recordings.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Saved Recordings
          </p>
          {recordings.map(rec => (
            <Card key={rec.id} className="p-4 flex items-center gap-3">
              {rec.blobUrl && (
                <audio ref={el => audioRefs.current[rec.id] = el} src={rec.blobUrl} className="hidden" />
              )}
              <button
                onClick={() => togglePlay(rec)}
                disabled={!rec.blobUrl}
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  rec.blobUrl ? 'bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 text-blue-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {playingId === rec.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 dark:text-white text-sm">{rec.date} · {rec.time}</p>
                <p className="text-xs text-slate-400">{rec.duration ? formatDuration(rec.duration) : 'Unknown duration'}</p>
                {!rec.blobUrl && <p className="text-xs text-orange-500">Tap record to re-record (session ended)</p>}
              </div>
              <Button
                size="sm"
                onClick={() => sendVoiceMessage(rec)}
                disabled={sending === rec.id || !rec.blob}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {sending === rec.id ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
              <button onClick={() => deleteRecording(rec.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}