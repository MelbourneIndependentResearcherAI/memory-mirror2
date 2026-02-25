import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Plus, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import PatientStatusCard from './PatientStatusCard';
import UpcomingTasksList from './UpcomingTasksList';
import TaskAssignmentForm from './TaskAssignmentForm';
import RecentJournalEntries from './RecentJournalEntries';

export default function CaregiverDashboard({ patientProfileId }) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch patient profile
  const { data: patient, isLoading: _patientLoading } = useQuery({
  const { data: patient } = useQuery({
    queryKey: ['patient', patientProfileId],
    queryFn: () => base44.entities.PatientProfile.filter({ id: patientProfileId }),
  });

  // Fetch care team
  const { data: careTeam = [] } = useQuery({
    queryKey: ['careTeam', patientProfileId],
    queryFn: () => base44.entities.CaregiverTeam.filter({ patient_profile_id: patientProfileId }),
  });

  // Fetch upcoming reminders
  const { data: reminders = [], isLoading: remindersLoading } = useQuery({
    queryKey: ['reminders', refreshKey],
    queryFn: () => base44.entities.Reminder.filter({ is_active: true }),
  });

  // Fetch recent journal entries
  const { data: journalEntries = [] } = useQuery({
    queryKey: ['journalEntries', patientProfileId],
    queryFn: () => base44.entities.CareJournal.filter({ patient_profile_id: patientProfileId }),
  });

  const upcomingReminders = reminders
    .sort((a, b) => new Date(a.time_of_day) - new Date(b.time_of_day))
    .slice(0, 5);

  const recentEntries = journalEntries
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 3);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Caregiver Dashboard</h1>
          <p className="text-slate-600 mt-1">
            {patient?.[0]?.patient_name}'s Care Overview
          </p>
        </div>
        <Button
          onClick={() => setRefreshKey(k => k + 1)}
          variant="outline"
          size="icon"
          className="h-10 w-10"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient Status & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PatientStatusCard patient={patient?.[0]} careTeamSize={careTeam.length} />
          </motion.div>

          {/* Upcoming Tasks & Reminders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <UpcomingTasksList reminders={upcomingReminders} isLoading={remindersLoading} />
          </motion.div>
        </div>

        {/* Right Column - Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Task Assignment */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Assign Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showTaskForm ? (
                <TaskAssignmentForm
                  careTeam={careTeam}
                  onSuccess={() => {
                    setShowTaskForm(false);
                    setRefreshKey(k => k + 1);
                  }}
                  onCancel={() => setShowTaskForm(false)}
                />
              ) : (
                <Button
                  onClick={() => setShowTaskForm(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Care Team */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Care Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {careTeam.length > 0 ? (
                  careTeam.map((member) => (
                    <div key={member.id} className="p-2 bg-slate-50 rounded-lg border">
                      <p className="font-medium text-sm">{member.caregiver_name}</p>
                      <p className="text-xs text-slate-600">{member.role}</p>
                      <p className="text-xs text-blue-600">{member.caregiver_email}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No care team members added yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Journal Entries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <RecentJournalEntries entries={recentEntries} />
      </motion.div>
    </div>
  );
}