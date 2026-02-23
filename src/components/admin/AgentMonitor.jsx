import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bot, Activity, Zap, Database, Bell, RefreshCw, CheckCircle2, Clock } from 'lucide-react';

const agents = [
  { 
    id: 'system_health_monitor', 
    name: 'System Health Monitor', 
    icon: Activity, 
    status: 'active',
    description: 'Monitors system health and performance',
    schedule: 'Every hour'
  },
  { 
    id: 'auto_fixer', 
    name: 'Auto-Fixer', 
    icon: Zap, 
    status: 'active',
    description: 'Detects and fixes errors automatically',
    schedule: 'Every 30 minutes'
  },
  { 
    id: 'data_optimizer', 
    name: 'Data Optimizer', 
    icon: Database, 
    status: 'active',
    description: 'Cleans and optimizes data storage',
    schedule: 'Daily at 3 AM'
  },
  { 
    id: 'performance_tuner', 
    name: 'Performance Tuner', 
    icon: Zap, 
    status: 'active',
    description: 'Optimizes application performance',
    schedule: 'Continuous'
  },
  { 
    id: 'sync_guardian', 
    name: 'Sync Guardian', 
    icon: RefreshCw, 
    status: 'active',
    description: 'Ensures offline sync operations work',
    schedule: 'Every 15 minutes'
  },
  { 
    id: 'notification_manager', 
    name: 'Notification Manager', 
    icon: Bell, 
    status: 'active',
    description: 'Manages notification delivery',
    schedule: 'Every 10 minutes'
  }
];

export default function AgentMonitor() {
  // Fetch recent maintenance activity
  const { data: recentActivity = [] } = useQuery({
    queryKey: ['maintenanceActivity'],
    queryFn: async () => {
      const logs = await base44.entities.ActivityLog.filter(
        { activity_type: 'auto_maintenance' },
        '-created_date',
        10
      );
      return logs;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  const lastRun = recentActivity[0];
  const totalFixes = recentActivity.reduce((sum, log) => 
    sum + (log.details?.fixes_applied?.length || 0), 0
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">🤖 Autonomous Agent Team</h2>
        <p className="text-slate-600">
          Self-maintaining AI agents that monitor, fix, and optimize everything automatically
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Agents</p>
                <p className="text-3xl font-bold text-green-600">{agents.length}</p>
              </div>
              <Bot className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Auto-Fixes Applied</p>
                <p className="text-3xl font-bold text-blue-600">{totalFixes}</p>
              </div>
              <Zap className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Last Maintenance</p>
                <p className="text-lg font-bold text-slate-900">
                  {lastRun ? new Date(lastRun.created_date).toLocaleTimeString() : 'Never'}
                </p>
              </div>
              <Clock className="w-12 h-12 text-slate-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-2 gap-4">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <Card key={agent.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{agent.name}</CardTitle>
                      <p className="text-xs text-slate-500">{agent.schedule}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{agent.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Maintenance Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((log, idx) => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">Maintenance Run #{recentActivity.length - idx}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(log.created_date).toLocaleString()}
                    </span>
                  </div>
                  {log.details?.fixes_applied?.length > 0 && (
                    <div className="text-xs text-slate-600">
                      {log.details.fixes_applied.map((fix, i) => (
                        <div key={i} className="flex items-center gap-1 mb-1">
                          <span className="text-green-600">✓</span>
                          <span>{fix}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {recentActivity.length === 0 && (
              <p className="text-center text-slate-500 py-8">
                No maintenance activity yet. Agents will start running automatically.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}