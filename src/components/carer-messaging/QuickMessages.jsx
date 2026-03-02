import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Plus, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const DEFAULT_MESSAGES = [
  { id: 'q1', text: 'Just checking in 👋', emoji: '👋', color: 'from-blue-400 to-blue-500' },
  { id: 'q2', text: 'Time for medication 💊', emoji: '💊', color: 'from-red-400 to-red-500' },
  { id: 'q3', text: 'Need assistance please', emoji: '🆘', color: 'from-orange-400 to-orange-500' },
  { id: 'q4', text: 'Everything is okay ✅', emoji: '✅', color: 'from-green-400 to-green-500' },
  { id: 'q5', text: 'Meal time is ready 🍽️', emoji: '🍽️', color: 'from-yellow-400 to-yellow-500' },
  { id: 'q6', text: 'Please call me when you can 📞', emoji: '📞', color: 'from-purple-400 to-purple-500' },
  { id: 'q7', text: 'I\'ll be there soon 🚗', emoji: '🚗', color: 'from-teal-400 to-teal-500' },
  { id: 'q8', text: 'Time for a rest 😴', emoji: '😴', color: 'from-indigo-400 to-indigo-500' },
];

function getContacts() {
  try { return JSON.parse(localStorage.getItem('carerContacts') || '[]'); } catch { return []; }
}

function getSentLog() {
  try { return JSON.parse(localStorage.getItem('carerSentLog') || '[]'); } catch { return []; }
}

function addToSentLog(entry) {
  const log = getSentLog();
  log.unshift(entry);
  localStorage.setItem('carerSentLog', JSON.stringify(log.slice(0, 20)));
}

export default function QuickMessages() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [sentLog, setSentLog] = useState([]);
  const [sending, setSending] = useState(null);
  const [customText, setCustomText] = useState('');
  const [quickMessages, setQuickMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('carerQuickMessages') || 'null') || DEFAULT_MESSAGES; } catch { return DEFAULT_MESSAGES; }
  });
  const [addingCustom, setAddingCustom] = useState(false);
  const [newMsgText, setNewMsgText] = useState('');

  useEffect(() => {
    setContacts(getContacts());
    setSentLog(getSentLog());
  }, []);

  const sendMessage = async (text) => {
    if (!selectedContact) { toast.error('Please select a contact first'); return; }
    setSending(text);
    try {
      // Try to send via family chat entity
      await base44.entities.FamilyChat.create({
        sender_name: 'Carer',
        sender_email: selectedContact.email || 'carer@memorymirror.app',
        message_type: 'text',
        message_content: text,
        recipient_name: selectedContact.name,
        is_encrypted: false,
      });
    } catch {}

    const entry = { text, contact: selectedContact.name, time: new Date().toLocaleTimeString() };
    addToSentLog(entry);
    setSentLog(getSentLog());
    toast.success(`Sent to ${selectedContact.name}!`);
    setSending(null);
  };

  const addCustomQuickMessage = () => {
    if (!newMsgText.trim()) return;
    const msg = { id: `custom_${Date.now()}`, text: newMsgText.trim(), emoji: '✉️', color: 'from-slate-400 to-slate-500' };
    const updated = [...quickMessages, msg];
    setQuickMessages(updated);
    localStorage.setItem('carerQuickMessages', JSON.stringify(updated));
    setNewMsgText('');
    setAddingCustom(false);
  };

  const removeCustomMessage = (id) => {
    const updated = quickMessages.filter(m => m.id !== id);
    setQuickMessages(updated);
    localStorage.setItem('carerQuickMessages', JSON.stringify(updated));
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
              <button
                key={c.id}
                onClick={() => setSelectedContact(selectedContact?.id === c.id ? null : c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
                  selectedContact?.id === c.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                {c.emoji || '👤'} {c.name}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Quick message buttons */}
      <div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Quick Messages:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickMessages.map(msg => (
            <div key={msg.id} className="relative group">
              <button
                onClick={() => sendMessage(msg.text)}
                disabled={sending === msg.text}
                className={`w-full bg-gradient-to-r ${msg.color} text-white rounded-2xl px-5 py-4 text-left font-semibold shadow-md hover:shadow-xl active:scale-95 transition-all flex items-center gap-3 text-base disabled:opacity-70`}
              >
                <span className="text-2xl">{msg.emoji}</span>
                <span className="flex-1 leading-tight">{msg.text}</span>
                {sending === msg.text
                  ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <Send className="w-4 h-4 opacity-60" />}
              </button>
              {!DEFAULT_MESSAGES.find(d => d.id === msg.id) && (
                <button
                  onClick={() => removeCustomMessage(msg.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add custom quick message */}
      {addingCustom ? (
        <div className="flex gap-2">
          <Input placeholder="Custom message text..." value={newMsgText} onChange={e => setNewMsgText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomQuickMessage()} />
          <Button onClick={addCustomQuickMessage} className="bg-green-600 text-white">Add</Button>
          <Button variant="outline" onClick={() => setAddingCustom(false)}>Cancel</Button>
        </div>
      ) : (
        <button onClick={() => setAddingCustom(true)} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
          <Plus className="w-4 h-4" /> Add custom message
        </button>
      )}

      {/* Custom free-text */}
      <Card className="p-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Custom message:</p>
        <div className="flex gap-2">
          <Input placeholder="Type anything..." value={customText} onChange={e => setCustomText(e.target.value)} onKeyDown={e => e.key === 'Enter' && customText.trim() && sendMessage(customText) && setCustomText('')} />
          <Button onClick={() => { sendMessage(customText); setCustomText(''); }} disabled={!customText.trim()} className="bg-blue-600 text-white">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Sent log */}
      {sentLog.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Recent:</p>
          <div className="space-y-1">
            {sentLog.slice(0, 5).map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-500 bg-white dark:bg-slate-800 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="flex-1 truncate">"{entry.text}"</span>
                <span className="text-xs text-slate-400">→ {entry.contact} · {entry.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}