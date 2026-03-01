import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, BarChart2, Target, FileText, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FamilyMemberManager from '@/components/family/admin/FamilyMemberManager';
import FamilyActivityReport from '@/components/family/admin/FamilyActivityReport';
import CareGoalsManager from '@/components/family/admin/CareGoalsManager';
import FamilyDocumentVault from '@/components/family/admin/FamilyDocumentVault';

export default function FamilyAdminPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('members');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myMembership } = useQuery({
    queryKey: ['myFamilyMembership', currentUser?.email],
    queryFn: () => base44.entities.FamilyMember.filter({ user_email: currentUser.email }),
    enabled: !!currentUser?.email,
    select: (data) => data?.[0]
  });

  const isAdmin = currentUser?.role === 'admin' || myMembership?.family_role === 'admin';

  const tabs = [
    { id: 'members', label: 'Members', icon: Users, adminOnly: true },
    { id: 'reports', label: 'Reports', icon: BarChart2, adminOnly: false },
    { id: 'goals', label: 'Care Goals', icon: Target, adminOnly: false },
    { id: 'documents', label: 'Documents', icon: FileText, adminOnly: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Family Portal
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {isAdmin ? '👑 You have Family Admin access' : '👥 Family Member'}
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6 bg-white dark:bg-slate-900 shadow rounded-xl p-1">
            {tabs.map((tab) => {
              if (tab.adminOnly && !isAdmin) return null;
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1.5 text-xs md:text-sm py-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {isAdmin && (
            <TabsContent value="members">
              <FamilyMemberManager currentUserEmail={currentUser?.email} />
            </TabsContent>
          )}

          <TabsContent value="reports">
            <FamilyActivityReport isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="goals">
            <CareGoalsManager isAdmin={isAdmin} currentUserEmail={currentUser?.email} />
          </TabsContent>

          <TabsContent value="documents">
            <FamilyDocumentVault isAdmin={isAdmin} currentUser={currentUser} myMembership={myMembership} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}