import React from 'react';
import { TrendingDown, Activity, Brain, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CognitiveProgression() {
  const { data: assessments = [] } = useQuery({
    queryKey: ['cognitiveAssessments'],
    queryFn: () => base44.entities.CognitiveAssessment.list('-assessment_date', 30),
  });

  const latestAssessment = assessments[0];

  const levelColors = {
    mild: 'from-green-500 to-emerald-600',
    moderate: 'from-yellow-500 to-amber-600',
    advanced: 'from-orange-500 to-red-600',
    severe: 'from-red-600 to-red-800'
  };

  const levelDescriptions = {
    mild: 'Early stage - mostly independent with some memory challenges',
    moderate: 'Moderate stage - noticeable decline, needs support',
    advanced: 'Advanced stage - significant impairment, extensive support needed',
    severe: 'Severe stage - profound cognitive loss, high dependency'
  };

  if (!latestAssessment) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600 dark:text-slate-400">
            No cognitive assessments yet. The AI will automatically assess cognitive level during conversations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className={`bg-gradient-to-br ${levelColors[latestAssessment.cognitive_level]} text-white`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="w-6 h-6" />
            Current Cognitive Level: {latestAssessment.cognitive_level.charAt(0).toUpperCase() + latestAssessment.cognitive_level.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/90 mb-4">{levelDescriptions[latestAssessment.cognitive_level]}</p>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Calendar className="w-4 h-4" />
            Last assessed: {new Date(latestAssessment.assessment_date).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      {latestAssessment.indicators && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Cognitive Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(latestAssessment.indicators).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-semibold">{value}/10</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        value >= 7 ? 'bg-red-500' : 
                        value >= 4 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${value * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {latestAssessment.recommended_adaptations?.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <AlertCircle className="w-5 h-5" />
              AI Adaptations Applied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              Memory Mirror automatically adapts these aspects based on cognitive level:
            </p>
            <ul className="space-y-2">
              {latestAssessment.recommended_adaptations.map((adaptation, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-blue-900 dark:text-blue-100">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                  <span>{adaptation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {assessments.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Assessment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assessments.slice(0, 10).map((assessment) => (
                <div 
                  key={assessment.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(assessment.assessment_date).toLocaleDateString()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    assessment.cognitive_level === 'mild' ? 'bg-green-100 text-green-800' :
                    assessment.cognitive_level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    assessment.cognitive_level === 'advanced' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {assessment.cognitive_level}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}