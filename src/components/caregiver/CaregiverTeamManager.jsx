import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Trash2, Mail, Phone, Shield, Bell, CheckCircle2, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function CaregiverTeamManager({ patientProfileId }) {
  const queryClient = useQueryClient();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    caregiver_email: '',
    caregiver_name: '',
    role: 'secondary',
    relationship: '',
    phone: '',
    access_level: 'full'
  });

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity
  });

  // Fetch care team
  const { data: careTeam = [], isLoading } = useQuery({
    queryKey: ['careTeam', patientProfileId],
    queryFn: async () => {
      if (!patientProfileId) return [];
      return await base44.entities.CaregiverTeam.filter({ patient_profile_id: patientProfileId });
    },
    enabled: !!patientProfileId
  });

  // Add caregiver mutation
  const addCaregiverMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.CaregiverTeam.create({
        ...data,
        patient_profile_id: patientProfileId,
        invited_by: currentUser?.email,
        joined_date: new Date().toISOString(),
        status: 'active',
        notification_preferences: {
          high_anxiety: true,
          safety_concerns: true,
          daily_summary: false,
          journal_entries: true
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['careTeam']);
      setShowInviteForm(false);
      setInviteData({
        caregiver_email: '',
        caregiver_name: '',
        role: 'secondary',
        relationship: '',
        phone: '',
        access_level: 'full'
      });
      toast.success('Caregiver added to team');
    },
    onError: (error) => {
      toast.error('Failed to add caregiver: ' + error.message);
    }
  });

  // Remove caregiver mutation
  const removeCaregiverMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.CaregiverTeam.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['careTeam']);
      toast.success('Caregiver removed from team');
    }
  });

  // Update notification preferences
  const _updatePreferencesMutation = useMutation({
    mutationFn: async ({ id, preferences }) => {
      return await base44.entities.CaregiverTeam.update(id, {
        notification_preferences: preferences
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['careTeam']);
      toast.success('Notification preferences updated');
    }
  });

  const handleInvite = () => {
    if (!inviteData.caregiver_email || !inviteData.caregiver_name) {
      toast.error('Please fill in required fields');
      return;
    }
    addCaregiverMutation.mutate(inviteData);
  };

  const roleIcons = {
    primary: '👤',
    secondary: '🤝',
    respite: '⏰',
    professional: '🏥',
    family: '👨‍👩‍👧‍👦'
  };

  const accessBadges = {
    full: { label: 'Full Access', color: 'bg-green-100 text-green-800' },
    view_only: { label: 'View Only', color: 'bg-blue-100 text-blue-800' },
    limited: { label: 'Limited', color: 'bg-amber-100 text-amber-800' }
  };

  if (!patientProfileId) {
    return (
      <Alert>
        <AlertDescription>
          Please select or create a patient profile first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Care Team</h2>
            <p className="text-sm text-slate-600">
              {careTeam.length} {careTeam.length === 1 ? 'caregiver' : 'caregivers'} on this team
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Caregiver
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Invite Caregiver to Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="caregiver@example.com"
                  value={inviteData.caregiver_email}
                  onChange={(e) => setInviteData({ ...inviteData, caregiver_email: e.target.value })}
                />
              </div>
              <div>
                <Label>Name *</Label>
                <Input
                  placeholder="Full name"
                  value={inviteData.caregiver_name}
                  onChange={(e) => setInviteData({ ...inviteData, caregiver_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role</Label>
                <Select
                  value={inviteData.role}
                  onValueChange={(value) => setInviteData({ ...inviteData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary Caregiver</SelectItem>
                    <SelectItem value="secondary">Secondary Caregiver</SelectItem>
                    <SelectItem value="respite">Respite Care</SelectItem>
                    <SelectItem value="professional">Professional (Nurse/Therapist)</SelectItem>
                    <SelectItem value="family">Family Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Access Level</Label>
                <Select
                  value={inviteData.access_level}
                  onValueChange={(value) => setInviteData({ ...inviteData, access_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Access (Edit & View)</SelectItem>
                    <SelectItem value="view_only">View Only</SelectItem>
                    <SelectItem value="limited">Limited (Basic Info)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Relationship</Label>
                <Input
                  placeholder="e.g., Daughter, Son, Nurse"
                  value={inviteData.relationship}
                  onChange={(e) => setInviteData({ ...inviteData, relationship: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  placeholder="+61 xxx xxx xxx"
                  value={inviteData.phone}
                  onChange={(e) => setInviteData({ ...inviteData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={addCaregiverMutation.isPending}>
                {addCaregiverMutation.isPending ? 'Adding...' : 'Add to Team'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Care Team List */}
      <div className="grid gap-4">
        {careTeam.map((member) => {
          const isCurrentUser = member.caregiver_email === currentUser?.email;
          const accessBadge = accessBadges[member.access_level];

          return (
            <Card key={member.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">{roleIcons[member.role]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{member.caregiver_name}</h3>
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            You
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {member.caregiver_email}
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {member.phone}
                          </div>
                        )}
                        {member.relationship && (
                          <div className="text-slate-500">
                            {member.relationship}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${accessBadge.color}`}>
                          <Shield className="w-3 h-3 inline mr-1" />
                          {accessBadge.label}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">
                          {member.role.replace('_', ' ')}
                        </span>
                        {member.status === 'pending' && (
                          <span className="px-2 py-1 rounded text-xs bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Pending
                          </span>
                        )}
                        {member.status === 'active' && (
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 inline mr-1" />
                            Active
                          </span>
                        )}
                      </div>

                      {/* Notification Preferences */}
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Bell className="w-3 h-3" />
                          <span className="font-medium">Notifications:</span>
                          {member.notification_preferences?.high_anxiety && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded">High Anxiety</span>
                          )}
                          {member.notification_preferences?.safety_concerns && (
                            <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded">Safety</span>
                          )}
                          {member.notification_preferences?.journal_entries && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">Journal</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {!isCurrentUser && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Remove ${member.caregiver_name} from care team?`)) {
                          removeCaregiverMutation.mutate(member.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {careTeam.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold mb-2">No Care Team Yet</h3>
              <p className="text-sm text-slate-600 mb-4">
                Add caregivers to collaborate on patient care
              </p>
              <Button onClick={() => setShowInviteForm(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add First Caregiver
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}