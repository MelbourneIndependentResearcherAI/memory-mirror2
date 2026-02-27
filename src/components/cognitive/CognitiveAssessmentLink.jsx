import React from 'react';
import { Brain, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CognitiveAssessmentLink() {
  const handleStartAssessment = () => {
    window.open('https://cogni-care-go.base44.app/', '_blank');
  };

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 md:p-12 border border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0 p-4 bg-blue-100 dark:bg-blue-900 rounded-xl">
          <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Free Cognitive Assessment
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Get a comprehensive cognitive health assessment anytime, completely free. Test your memory, attention, and thinking skills with our validated CogniCare assessment tool.
          </p>
          
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleStartAssessment}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-fit"
            >
              <Brain className="w-4 h-4" />
              Start Free Assessment
              <ExternalLink className="w-4 h-4" />
            </Button>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download your results as a letter when complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}