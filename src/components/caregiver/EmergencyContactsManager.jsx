import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

export default function EmergencyContactsManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    is_primary: false,
    icon: '👨‍👩‍👧‍👦'
  });

  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery({
    queryKey: ['emergencyContacts'],
    queryFn: () => base44.entities.EmergencyContact.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EmergencyContact.create(data),
    onMutate: async (newContact) => {
      await queryClient.cancelQueries({ queryKey: ['emergencyContacts'] });
      const previousContacts = queryClient.getQueryData(['emergencyContacts']);
      
      queryClient.setQueryData(['emergencyContacts'], (old) => [
        { ...newContact, id: `temp-${Date.now()}`, created_date: new Date().toISOString() },
        ...(old || [])
      ]);
      
      return { previousContacts };
    },
    onError: (err, newContact, context) => {
      queryClient.setQueryData(['emergencyContacts'], context.previousContacts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmergencyContact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmergencyContact.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });
    },
  });

  const resetForm = () => {
    setFormData({ name: '', relationship: '', phone: '', is_primary: false, icon: '👨‍👩‍👧‍👦' });
    setEditingContact(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (contact) => {
    setFormData({
      name: contact.name,
      relationship: contact.relationship || '',
      phone: contact.phone,
      is_primary: contact.is_primary || false,
      icon: contact.icon || '👨‍👩‍👧‍👦'
    });
    setEditingContact(contact);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Emergency Contacts</CardTitle>
            <Button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700 min-h-[44px]">
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-lg mb-6 space-y-4">
              <Input
                placeholder="Contact Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                placeholder="Relationship (e.g., 'Daughter', 'Son', 'Caregiver')"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              />
              <Input
                placeholder="Email or Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <p className="text-xs text-slate-500 mt-1">Use email for alert notifications</p>
              <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="👨‍👩‍👧‍👦">👨‍👩‍👧‍👦 Family</SelectItem>
                  <SelectItem value="👨">👨 Male</SelectItem>
                  <SelectItem value="👩">👩 Female</SelectItem>
                  <SelectItem value="👶">👶 Child</SelectItem>
                  <SelectItem value="🏥">🏥 Medical</SelectItem>
                  <SelectItem value="🚨">🚨 Emergency</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="primary"
                  checked={formData.is_primary}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
                />
                <label htmlFor="primary" className="text-sm">Primary Contact</label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 min-h-[44px]">
                  {editingContact ? 'Update' : 'Add'} Contact
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="min-h-[44px]">
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="grid gap-3">
            {contacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{contact.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{contact.name}</h3>
                          {contact.is_primary && (
                            <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{contact.relationship}</p>
                        <p className="text-sm text-slate-500">{contact.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(contact)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(contact.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {contacts.length === 0 && !showForm && (
            <div className="text-center py-12 text-slate-500">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No emergency contacts added yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}