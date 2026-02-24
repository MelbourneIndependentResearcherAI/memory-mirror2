import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I start using Memory Mirror?',
        a: 'Simply click "Start Companion" on the landing page or say "Hey Mirror" to activate voice mode. No login or setup required for instant access.'
      },
      {
        q: 'Do I need to install anything?',
        a: 'No installation required! Memory Mirror works directly in your web browser. However, you can install it as a Progressive Web App (PWA) for offline access and a native app-like experience.'
      },
      {
        q: 'Is there a caregiver portal?',
        a: 'Yes! Click "Caregiver Portal" from the landing page to access monitoring, insights, content management, and configuration tools.'
      }
    ]
  },
  {
    category: 'Features & Functionality',
    questions: [
      {
        q: 'What is Phone Mode?',
        a: 'Phone Mode provides a realistic dial pad that connects to the AI companion instead of emergency services, preventing accidental 911 calls while maintaining familiarity for users.'
      },
      {
        q: 'How does Night Watch work?',
        a: 'Night Watch is a gentle nighttime companion that provides comfort during late hours, helps prevent wandering, and logs incidents for caregiver review.'
      },
      {
        q: 'What is the Security Scanner?',
        a: 'A reassuring visual interface that simulates security checks to reduce anxiety about locks and safety - purely comforting, never makes real alerts.'
      },
      {
        q: 'Can Memory Mirror work offline?',
        a: 'Yes! Memory Mirror includes 250+ pre-loaded AI responses, 20 stories, 15 songs, and 10 memory exercises that work completely offline.'
      },
      {
        q: 'What is Fake Banking?',
        a: 'A safe simulated banking interface that provides familiar financial interactions without any real transactions - perfect for reducing financial anxiety.'
      }
    ]
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        q: 'Is my data private?',
        a: 'Yes. All conversations and data are encrypted and stored securely. We comply with HIPAA and GDPR standards. Your data is never shared with third parties.'
      },
      {
        q: 'Can family members access the data?',
        a: 'Only authorized caregivers you invite to your Care Team can access patient data. Access levels can be configured (full, view-only, or limited).'
      },
      {
        q: 'How long is data retained?',
        a: 'By default, data is retained for 2 years per healthcare compliance standards. You can export or delete data at any time from the Caregiver Portal.'
      }
    ]
  },
  {
    category: 'Caregiver Tools',
    questions: [
      {
        q: 'How do I track my loved one\'s wellbeing?',
        a: 'The Insights Dashboard shows anxiety trends, activity patterns, conversation themes, and cognitive assessments. You can also view detailed reports and export data.'
      },
      {
        q: 'Can I upload custom content?',
        a: 'Yes! Upload family photos, music, personalized stories, and create custom memory exercises through the Content Library in the Caregiver Portal.'
      },
      {
        q: 'How do emergency alerts work?',
        a: 'Configure alert conditions (high anxiety, no interaction, night incidents) and choose notification methods (email, SMS, app) for your emergency contacts.'
      },
      {
        q: 'Can I clone a family member\'s voice?',
        a: 'Yes! Upload 1-5 minutes of clear audio from a family member, and the AI will learn to speak in their voice for more personalized comfort.'
      }
    ]
  },
  {
    category: 'Pricing & Support',
    questions: [
      {
        q: 'How much does Memory Mirror cost?',
        a: 'Memory Mirror is transitioning to $9.99/month premium subscription in 2 weeks. We intentionally keep pricing low because quality dementia care support should be accessible to every family.'
      },
      {
        q: 'What if I can\'t afford the subscription?',
        a: 'Families facing financial hardship can contact support@memorymirror.app to discuss assistance options. No family gets turned away.'
      },
      {
        q: 'How do I get technical support?',
        a: 'Email support@memorymirror.app or use the AI Support Assistant in the Caregiver Portal for 24/7 help with features and troubleshooting.'
      }
    ]
  }
];

export default function FAQ() {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState([]);

  const toggleItem = (categoryIdx, questionIdx) => {
    const key = `${categoryIdx}-${questionIdx}`;
    setExpandedItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              <HelpCircle className="w-10 h-10 text-blue-600" />
              Frequently Asked Questions
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Everything you need to know about Memory Mirror
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {faqs.map((category, catIdx) => (
            <div key={catIdx}>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.questions.map((item, qIdx) => {
                  const isExpanded = expandedItems.includes(`${catIdx}-${qIdx}`);
                  return (
                    <Card key={qIdx}>
                      <CardContent
                        className="p-0 cursor-pointer"
                        onClick={() => toggleItem(catIdx, qIdx)}
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white flex-1">
                              {item.q}
                            </h3>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            )}
                          </div>
                          {isExpanded && (
                            <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                              {item.a}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Card className="mt-12 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We're here to help! Reach out anytime.
            </p>
            <Button
              onClick={() => window.location.href = 'mailto:support@memorymirror.app'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}