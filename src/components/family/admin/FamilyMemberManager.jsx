import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Trash2, Crown, Users, Eye, Edit } from 'lucide-react';
import { toast } from 'sonner';

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  member: 'bg-blue-100 text-blue-800',
  viewer: 'bg-slate-100 text-slate-700'
};

export default function FamilyMemberManager({ currentUserEmail }) {
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ user_email: '', display_name: '', relationship: '', family_role: 'member' });
  const [editingId, setEditingId] = useState(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyMember.create({ ...data, invited_by: currentUserEmail, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyMembers'] });
      toast.success('Family member added!');
      setShowInvite(false);
      setInviteForm({ user_email: '', display_name: '', relationship: '', family_role: 'member' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FamilyMember.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyMembers'] });
      toast.success('Permissions updated!');
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FamilyMember.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyMembers'] });
      toast.success('Member removed');
    }
  });

  const togglePermission = (member, permKey) => {
    const updated = { ...member.permissions, [permKey]: !member.permissions?.[permKey] };
    updateMutation.mutate({ id: member.id, data: { permissions: updated } });
  };

  if (isLoading) return <div className="text-center py-12 text-slate-500">Loading members...</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Family Members</CardTitle>
          <Button onClick={() => setShowInvite(!showInvite)} className="bg-purple-600 hover:bg-purple-700 gap-2">
            <UserPlus className="w-4 h-4" /> Add Member
          </Button>
        </CardHeader>
        <CardContent>
          {showInvite && (
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 mb-6 space-y-3">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Add Family Member</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Full name" value={inviteForm.display_name} onChange={e => setInviteForm(f => ({ ...f, display_name: e.target.value }))} />
                <Input placeholder="Email address" type="email" value={inviteForm.user_email} onChange={e => setInviteForm(f => ({ ...f, user_email: e.target.value }))} />
                <Input placeholder="Relationship (e.g. daughter)" value={inviteForm.relationship} onChange={e => setInviteForm(f => ({ ...f, relationship: e.target.value }))} />
                <Select value={inviteForm.family_role} onValueChange={v => setInviteForm(f => ({ ...f, family_role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => createMutation.mutate(inviteForm)} disabled={!inviteForm.user_email || !inviteForm.display_name} className="bg-purple-600 hover:bg-purple-700">Add Member</Button>
                <Button variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {members.length === 0 && <p className="text-slate-500 text-center py-8">No family members added yet.</p>}
            {members.map(member => (
              <div key={member.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{member.display_name}</span>
                      <Badge className={roleColors[member.family_role] || roleColors.member}>
                        {member.family_role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                        {member.family_role}
                      </Badge>
                      {!member.is_active && <Badge variant="outline" className="text-red-500 border-red-300">Inactive</Badge>}
                    </div>
                    <p className="text-sm text-slate-500">{member.user_email} {member.relationship && `• ${member.relationship}`}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingId(editingId === member.id ? null : member.id)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(member.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {editingId === member.id && (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</span>
                      <Select value={member.family_role} onValueChange={v => updateMutation.mutate({ id: member.id, data: { family_role: v } })}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Permissions</p>
                    {[
                      { key: 'can_view_reports', label: 'View Reports' },
                      { key: 'can_manage_reminders', label: 'Manage Reminders' },
                      { key: 'can_upload_documents', label: 'Upload Documents' },
                      { key: 'can_manage_members', label: 'Manage Members' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
                        <Switch
                          checked={!!member.permissions?.[key]}
                          onCheckedChange={() => togglePermission(member, key)}
                        />
                      </div>
                    ))}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Active</span>
                      <Switch
                        checked={!!member.is_active}
                        onCheckedChange={v => updateMutation.mutate({ id: member.id, data: { is_active: v } })}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}