import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, FileText, TrendingUp, AlertTriangle, Moon, MessageCircle, Loader2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

export default function CaregiverReports() {
  const [reportType, setReportType] = useState('weekly');
  const [selectedPatient, setSelectedPatient] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      return await base44.entities.PatientProfile.list();
    }
  });

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['caregiverReport', reportType, selectedPatient],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateCaregiverReport', {
        report_type: reportType,
        patient_id: selectedPatient === 'all' ? null : selectedPatient
      });
      return response.data;
    },
    enabled: false
  });

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await refetch();
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('Report generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const csvRows = [];
    
    // Header
    csvRows.push('Memory Mirror Caregiver Report');
    csvRows.push(`Report Type: ${reportType}`);
    csvRows.push(`Generated: ${format(new Date(), 'PPP')}`);
    csvRows.push('');

    // Activity Summary
    csvRows.push('Activity Summary');
    csvRows.push('Category,Count');
    Object.entries(reportData.activity_summary || {}).forEach(([key, value]) => {
      csvRows.push(`${key},${value}`);
    });
    csvRows.push('');

    // Mood Trends
    csvRows.push('Mood Analysis');
    csvRows.push('Metric,Value');
    csvRows.push(`Average Anxiety Level,${reportData.mood_analysis?.average_anxiety || 0}`);
    csvRows.push(`Peak Anxiety Level,${reportData.mood_analysis?.peak_anxiety || 0}`);
    csvRows.push(`Calm Periods,${reportData.mood_analysis?.calm_periods || 0}`);
    csvRows.push('');

    // Significant Events
    csvRows.push('Significant Events');
    csvRows.push('Date,Type,Severity,Details');
    (reportData.significant_events || []).forEach(event => {
      csvRows.push(`${format(new Date(event.timestamp), 'PP p')},${event.type},${event.severity},"${event.details}"`);
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memory-mirror-report-${reportType}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    
    toast.success('CSV exported successfully');
  };

  const exportToPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('Memory Mirror Caregiver Report', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report Type: ${reportType.toUpperCase()}`, 20, yPos);
    yPos += 5;
    doc.text(`Generated: ${format(new Date(), 'PPP')}`, 20, yPos);
    yPos += 15;

    // Activity Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Activity Summary', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    Object.entries(reportData.activity_summary || {}).forEach(([key, value]) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${key}: ${value}`, 25, yPos);
      yPos += 6;
    });
    yPos += 5;

    // Mood Analysis
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(14);
    doc.text('Mood & Anxiety Analysis', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.text(`Average Anxiety: ${reportData.mood_analysis?.average_anxiety || 0}/10`, 25, yPos);
    yPos += 6;
    doc.text(`Peak Anxiety: ${reportData.mood_analysis?.peak_anxiety || 0}/10`, 25, yPos);
    yPos += 6;
    doc.text(`Calm Periods: ${reportData.mood_analysis?.calm_periods || 0}`, 25, yPos);
    yPos += 10;

    // Significant Events
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(14);
    doc.text('Significant Events', 20, yPos);
    yPos += 8;

    doc.setFontSize(9);
    (reportData.significant_events || []).slice(0, 15).forEach(event => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setTextColor(220, 38, 38);
      doc.text(`[${event.severity.toUpperCase()}]`, 25, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(`${format(new Date(event.timestamp), 'PP p')} - ${event.type}`, 45, yPos);
      yPos += 5;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const details = doc.splitTextToSize(event.details, 160);
      doc.text(details, 25, yPos);
      yPos += (details.length * 4) + 3;
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
    });

    // Communication Summary
    if (reportData.communication_summary && yPos < 250) {
      yPos += 5;
      doc.setFontSize(14);
      doc.text('Communication Summary', 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.text(`Total Conversations: ${reportData.communication_summary.total_conversations}`, 25, yPos);
      yPos += 6;
      doc.text(`Average Length: ${reportData.communication_summary.avg_conversation_length} messages`, 25, yPos);
      yPos += 6;
      doc.text(`Most Active Time: ${reportData.communication_summary.most_active_time}`, 25, yPos);
    }

    doc.save(`memory-mirror-report-${reportType}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('PDF exported successfully');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Caregiver Reports</h1>
        <p className="text-slate-600 dark:text-slate-400">Generate comprehensive summaries of patient activity, mood trends, and significant events</p>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Patient</label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  {patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.patient_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleGenerateReport} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Display */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {reportData && !isLoading && (
        <>
          {/* Export Actions */}
          <div className="flex gap-3">
            <Button onClick={exportToCSV} variant="outline" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={exportToPDF} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(reportData.activity_summary || {}).map(([key, value]) => (
                  <div key={key} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{key}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mood Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Mood & Anxiety Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Average Anxiety</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">
                    {reportData.mood_analysis?.average_anxiety || 0}<span className="text-lg">/10</span>
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-1">Peak Anxiety</p>
                  <p className="text-3xl font-bold text-red-900 dark:text-red-300">
                    {reportData.mood_analysis?.peak_anxiety || 0}<span className="text-lg">/10</span>
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">Calm Periods</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-300">
                    {reportData.mood_analysis?.calm_periods || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Significant Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Significant Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(reportData.significant_events || []).length === 0 ? (
                  <p className="text-slate-600 dark:text-slate-400 text-center py-4">No significant events recorded</p>
                ) : (
                  reportData.significant_events.slice(0, 10).map((event, idx) => (
                    <div key={idx} className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950 p-4 rounded-r-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {event.type === 'anxiety_spike' && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                          {event.type === 'night_incident' && <Moon className="w-4 h-4 text-indigo-600" />}
                          {event.type === 'extended_conversation' && <MessageCircle className="w-4 h-4 text-blue-600" />}
                          <span className="font-semibold text-slate-900 dark:text-white">{event.type.replace(/_/g, ' ')}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          event.severity === 'high' ? 'bg-red-200 text-red-800' :
                          event.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {event.severity}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{event.details}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                        {format(new Date(event.timestamp), 'PPP p')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Communication Summary */}
          {reportData.communication_summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  Communication Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Total Conversations</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-300">
                      {reportData.communication_summary.total_conversations}
                    </p>
                  </div>
                  <div className="bg-cyan-50 dark:bg-cyan-950 p-4 rounded-lg">
                    <p className="text-sm text-cyan-600 dark:text-cyan-400 mb-1">Avg. Length</p>
                    <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-300">
                      {reportData.communication_summary.avg_conversation_length}
                    </p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg">
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Most Active Time</p>
                    <p className="text-xl font-bold text-indigo-900 dark:text-indigo-300">
                      {reportData.communication_summary.most_active_time}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}