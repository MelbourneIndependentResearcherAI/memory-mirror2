import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Shield } from 'lucide-react';

export default function AuditLogViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: logs = [], isLoading: _isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 200)
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = actionFilter === 'all' || log.action_type === actionFilter;
    return matchesSearch && matchesFilter;
  });

  const getActionColor = (action) => {
    if (action.includes('sent') || action.includes('uploaded')) return 'bg-green-600';
    if (action.includes('read') || action.includes('accessed')) return 'bg-blue-600';
    if (action.includes('deleted')) return 'bg-red-600';
    return 'bg-slate-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Compliance Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by user name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="message_sent">Messages Sent</SelectItem>
                <SelectItem value="message_read">Messages Read</SelectItem>
                <SelectItem value="photo_uploaded">Photos</SelectItem>
                <SelectItem value="voice_sent">Voice Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="border">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getActionColor(log.action_type)}>
                          {log.action_type.replace(/_/g, ' ')}
                        </Badge>
                        {log.compliance_flags?.map(flag => (
                          <Badge key={flag} variant="outline" className="text-xs">
                            {flag}
                          </Badge>
                        ))}
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {log.user_name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {log.user_email}
                      </p>
                      {log.resource_type && (
                        <p className="text-xs text-slate-500 mt-1">
                          Resource: {log.resource_type} ({log.resource_id?.substring(0, 8)}...)
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <p>{new Date(log.created_date).toLocaleDateString()}</p>
                      <p>{new Date(log.created_date).toLocaleTimeString()}</p>
                      <p className="text-xs mt-1">{log.ip_address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}