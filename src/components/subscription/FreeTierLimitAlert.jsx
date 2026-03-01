import React from 'react';
import { AlertCircle, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FreeTierLimitAlert({ featureType, used, limit, onDismiss }) {
  const navigate = useNavigate();
  const remaining = Math.max(0, limit - used);
  const percentage = Math.round((used / limit) * 100);

  const featureNames = {
    chat: 'conversations',
    memories: 'memory views',
    voice: 'voice minutes'
  };

  const featureName = featureNames[featureType] || 'feature';

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200">
              {remaining === 0 ? 'Daily limit reached' : `Only ${remaining} spot${remaining === 1 ? '' : 's'} left today`}
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
              {remaining === 0 ? 'Upgrade to keep the conversation going.' : `You've used ${used} of ${limit} free ${featureName} today.`}
            </p>
          </div>
        </div>

        <div className="w-full bg-blue-200 dark:bg-blue-900/40 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {remaining === 0 && (
          <Button
            onClick={() => navigate(createPageUrl('Pricing'))}
            size="sm"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 gap-2"
          >
            <Zap className="w-4 h-4" />
            Upgrade to Premium
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline w-full text-center"
          >
            Dismiss
          </button>
        )}
      </div>
    </Card>
  );
}