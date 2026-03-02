import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Phone, Mail, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const EMOJIS = ['👤', '👨', '👩', '👴', '👵', '🧑‍⚕️', '👨‍👩‍👧', '🏠', '💼', '❤️'];

function getContacts() {
  try { return JSON.parse(localStorage.getItem('carerContacts') || '[]'); } catch { return []; }
}
function saveContacts(contacts) {
  localStorage.setItem('carerContacts', JSON.stringify(contacts));
}

const EMPTY_FORM = { name: '', phone: '', email: '', emoji: '👤', group: 'family' };

export default function ContactGroups() {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('all');

  useEffect(() => {
    setContacts(getContacts());
  }, []);

  const groups = ['all', 'family', 'medical', 'friend', 'carer'];

  const filteredContacts = selectedGroup === 'all'
    ? contacts
    : contacts.filter(c => c.group === selectedGroup);

  const saveAndClose = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }

    let updated;
    if (editingId) {
      updated = contacts.map(c => c.id === editingId ? { ...form, id: editingId } : c);
      toast.success('Contact updated');
    } else {
      updated = [...contacts, { ...form, id: Date.now().toString() }];
      toast.success('Contact added');
    }

    saveContacts(updated);
    setContacts(updated);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (contact) => {
    setForm({ name: contact.name, phone: contact.phone || '', email: contact.email || '', emoji: contact.emoji || '👤', group: contact.group || 'family' });
    setEditingId(contact.id);
    setShowForm(true);
  };

  const deleteContact = (id) => {
    const updated = contacts.filter(c => c.id !== id);
    saveContacts(updated);
    setContacts(updated);
    toast.success('Contact removed');
  };

  const groupColors = { family: 'bg-blue-100 text-blue-700', medical: 'bg-red-100 text-red-700', friend: 'bg-green-100 text-green-700', carer: 'bg-purple-100 text-purple-700' };

  return (
    <div className="space-y-5">
      {/* Group filter */}
      <div className="flex gap-2 flex-wrap">
        {groups.map(g => (
          <button key={g} onClick={() => setSelectedGroup(g)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
              selectedGroup === g ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}>
            {g === 'all' ? `All (${contacts.length})` : `${g} (${contacts.filter(c => c.group === g).length})`}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="p-4 border-2 border-blue-300 dark:border-blue-700">
          <p className="font-semibold text-slate-800 dark:text-white mb-4">{editingId ? 'Edit Contact' : 'Add New Contact'}</p>

          {/* Emoji picker */}
          <div className="flex gap-2 flex-wrap mb-4">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                className={`w-10 h-10 rounded-xl text-xl transition-all ${form.emoji === e ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500 scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                {e}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <Input placeholder="Full name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Phone number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} type="tel" />
            <Input placeholder="Email address" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" />

            {/* Group selector */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Group:</p>
              <div className="flex gap-2 flex-wrap">
                {['family', 'medical', 'friend', 'carer'].map(g => (
                  <button key={g} onClick={() => setForm(f => ({ ...f, group: g }))}
                    className={`px-3 py-1 rounded-full text-sm capitalize transition-all ${
                      form.group === g ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={saveAndClose} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <Check className="w-4 h-4 mr-1" /> Save
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }} className="flex-1">
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Contact list */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No contacts yet</p>
          <p className="text-sm text-slate-400 mt-1">Add family members, carers, or medical contacts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContacts.map(contact => (
            <Card key={contact.id} className="p-4 flex items-center gap-4">
              <div className="text-4xl">{contact.emoji || '👤'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-900 dark:text-white">{contact.name}</p>
                  {contact.group && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${groupColors[contact.group] || 'bg-slate-100 text-slate-600'}`}>
                      {contact.group}
                    </span>
                  )}
                </div>
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 mt-0.5 hover:underline">
                    <Phone className="w-3 h-3" /> {contact.phone}
                  </a>
                )}
                {contact.email && (
                  <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <Mail className="w-3 h-3" /> {contact.email}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(contact)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteContact(contact.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add button */}
      {!showForm && (
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-2xl">
          <Plus className="w-5 h-5 mr-2" /> Add Contact
        </Button>
      )}
    </div>
  );
}