import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Mail, Shield, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUserTracking() {
  const [user, setUser] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser || currentUser.role !== 'admin') {
          toast.error('Access denied. Admin only.');
          navigate(createPageUrl('Landing'));
        } else {
          setUser(currentUser);
        }
      } catch (error) {
        toast.error('Authentication required');
        navigate(createPageUrl('Landing'));
      }
    };
    checkAdmin();
  }, [navigate]);

  // Fetch all users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      return allUsers;
    },
    enabled: user?.role === 'admin'
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patientProfiles'],
    queryFn: () => base44.entities.PatientProfile.list(),
    enabled: user?.role === 'admin'
  });

  // Send bulk email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async ({ subject, body }) => {
      const response = await base44.functions.invoke('sendBulkEmail', {
        subject,
        body,
        recipientEmails: userStats.allEmails
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Emails sent successfully to all users!');
      setEmailSubject('');
      setEmailBody('');
    },
    onError: (error) => {
      toast.error('Failed to send emails: ' + error.message);
    }
  });

  const handleSendEmails = (e) => {
    e.preventDefault();
    if (!emailSubject || !emailBody) {
      toast.error('Please provide both subject and message');
      return;
    }
    if (users.length === 0) {
      toast.error('No users to email');
      return;
    }
    sendEmailMutation.mutate({ subject: emailSubject, body: emailBody });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Access Denied
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                This page is restricted to administrators only.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    caregivers: users.filter(u => u.role === 'user').length,
    patients: patients.length,
    allEmails: [
      ...users.map(u => u.email),
      ...patients.filter(p => p.patient_email).map(p => p.patient_email)
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Admin User Tracking
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Manage users and send system-wide notifications
          </p>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {userStats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Administrators</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {userStats.admins}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Caregivers</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {userStats.caregivers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded-lg">
                  <Users className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Patients</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {userStats.patients}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Email Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle>Send Bulk Email</CardTitle>
                <CardDescription>
                  Notify all users about outages, updates, or important announcements
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendEmails} className="space-y-6">
              <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-slate-700 dark:text-slate-300">
                  This will send an email to all {userStats.allEmails.length} users ({userStats.total} caregivers + {userStats.patients} patients). Use responsibly.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g., Scheduled Maintenance - Memory Mirror"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="body">Email Message</Label>
                <Textarea
                  id="body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Dear Memory Mirror user,&#10;&#10;We wanted to inform you about...&#10;&#10;Thank you for your understanding."
                  className="mt-1 min-h-[200px]"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={sendEmailMutation.isLoading || !emailSubject || !emailBody}
              >
                {sendEmailMutation.isLoading ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Email to {userStats.allEmails.length} Users
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Complete list of registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-slate-500 py-8">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="py-3 px-4 text-sm text-slate-900 dark:text-white">
                          {u.full_name || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {u.email}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {new Date(u.created_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}