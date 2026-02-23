import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';

export default function RecentJournalEntries({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Recent Journal Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 text-sm">No journal entries yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Recent Journal Entries
          <Badge variant="secondary">{entries.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border rounded-lg p-4 hover:bg-slate-50 transition"
            >
              {/* Entry Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{entry.sender_name}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(entry.created_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                {entry.tags && (
                  <div className="flex gap-1 flex-wrap justify-end">
                    {entry.tags.split(',').map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Entry Content */}
              <div className="ml-10">
                {entry.entry_text && (
                  <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
                    {entry.entry_text}
                  </p>
                )}

                {entry.observations && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                    <p className="text-xs text-amber-800 font-medium flex items-center gap-1 mb-1">
                      <MessageSquare className="w-3 h-3" />
                      Observations
                    </p>
                    <p className="text-xs text-amber-700 line-clamp-2">
                      {entry.observations}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}