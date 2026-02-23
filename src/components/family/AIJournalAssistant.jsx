import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AIJournalAssistant({ onPromptSelected }) {
  const [generating, setGenerating] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [copied, setCopied] = useState(null);

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles?.[0] || null;
    }
  });

  const { data: memories = [] } = useQuery({
    queryKey: ['memories'],
    queryFn: () => base44.entities.Memory.list('-created_date', 10)
  });

  const handleGeneratePrompts = async () => {
    if (!userProfile) {
      toast.error('User profile not found');
      return;
    }
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateAIContent', {
        type: 'journal_prompt',
        userProfile,
        existingMemories: memories
      });
      if (response.data?.prompts) {
        setPrompts(response.data.prompts);
        toast.success('Journal prompts generated!');
      }
    } catch (error) {
      toast.error('Failed to generate prompts: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (prompt, index) => {
    navigator.clipboard.writeText(prompt);
    setCopied(index);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSelectPrompt = (prompt) => {
    onPromptSelected?.(prompt);
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI Journal Prompts
            </CardTitle>
            <CardDescription>
              Get personalized journal prompts based on patient profile and history
            </CardDescription>
          </div>
          <Button
            onClick={handleGeneratePrompts}
            disabled={generating || !userProfile}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Prompts
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {prompts.length > 0 && (
        <CardContent>
          <div className="space-y-3">
            {prompts.map((prompt, index) => (
              <div
                key={index}
                className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-blue-900 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                    {prompt}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(prompt, index)}
                      className="h-8 w-8 p-0"
                    >
                      {copied === index ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectPrompt(prompt)}
                      className="text-xs"
                    >
                      Use
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {!prompts.length && (
        <CardContent>
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              Click "Generate Prompts" to create personalized journal prompts tailored to the patient's profile, interests, and memories.
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  );
}