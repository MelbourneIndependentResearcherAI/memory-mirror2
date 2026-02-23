import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, MessageCircle, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'What is Memory Mirror?',
        a: 'Memory Mirror is an AI companion specifically designed for individuals living with dementia and their caregivers. It uses advanced artificial intelligence to provide compassionate conversation, emotional support, and practical assistance through voice interaction.'
      },
      {
        q: 'How do I start using Memory Mirror?',
        a: 'Simply say "Hey Mirror" to activate voice mode, or tap the microphone button. The AI will greet you warmly and adapt to your mental state and time period awareness. No complex setup required.'
      },
      {
        q: 'Is Memory Mirror free?',
        a: 'Yes! Memory Mirror is currently 100% free while we finalize development. When we introduce the $9.99/month subscription later, we\'ll give advance notice and ensure the experience is flawless first.'
      }
    ]
  },
  {
    category: 'Core Features',
    questions: [
      {
        q: 'What is Era Detection?',
        a: 'Memory Mirror automatically detects which time period a person is mentally experiencing (1940s, 1960s, 1980s, or present day) and adapts its language, cultural references, and conversation style accordingly for genuine connection.'
      },
      {
        q: 'How does Anxiety Detection work?',
        a: 'The AI monitors conversation patterns for signs of distress, confusion, or agitation. When detected, it automatically responds with calming techniques, familiar patterns, and emotional safety without ever telling the person they\'re wrong.'
      },
      {
        q: 'What is Phone Mode?',
        a: 'A realistic dial pad that connects to the AI companion instead of emergency services. This prevents costly 911 calls at night while giving your loved one the comfort of "calling someone" when they need reassurance.'
      },
      {
        q: 'What is Security Scanner?',
        a: 'A realistic AI-controlled security check that never makes real alerts or calls. It provides purely reassuring visuals to reduce anxiety about locks and safety, helping users feel calm and secure without actual security functions.'
      }
    ]
  },
  {
    category: 'For Caregivers',
    questions: [
      {
        q: 'What is the Caregiver Portal?',
        a: 'A comprehensive dashboard where caregivers can monitor wellbeing, view anxiety trends, access chat history, manage photos and music, configure settings, and receive proactive alerts about concerning patterns.'
      },
      {
        q: 'Can I upload personal photos and memories?',
        a: 'Yes! The Media Library lets you upload photos, videos, and personal stories. The AI can proactively recall these during conversations to spark joy and connection.'
      },
      {
        q: 'What is Night Watch Mode?',
        a: 'A gentle nighttime companion that prevents wandering, provides comfort during confusion, and keeps caregivers informed via the Night Watch Log. It uses calming visuals and voice to redirect safely.'
      },
      {
        q: 'Can I customize the AI voice?',
        a: 'Yes! Voice Cloning allows you to upload audio samples of family members. The AI can then speak in familiar voices (like a daughter or spouse) for deeper emotional comfort.'
      }
    ]
  },
  {
    category: 'Privacy & Safety',
    questions: [
      {
        q: 'Is my data secure?',
        a: 'Absolutely. All data is encrypted in transit and at rest. We\'re fully compliant with HIPAA, GDPR, and PIPEDA healthcare privacy regulations. Video calls use end-to-end encryption with no server recording.'
      },
      {
        q: 'Does Memory Mirror make real emergency calls?',
        a: 'No. Phone Mode and Security Scanner are purely for emotional reassurance - they never dial real numbers or create actual alerts. This prevents false alarms while providing comfort.'
      },
      {
        q: 'Can I use Memory Mirror offline?',
        a: 'Yes! Memory Mirror includes 250+ pre-loaded AI responses, 20 stories, 15 songs, and 10 memory exercises. Essential features work without internet, with automatic data caching for reliability.'
      },
      {
        q: 'What happens to conversation data?',
        a: 'Conversations are analyzed in real-time for anxiety and context, then encrypted and stored securely. Only you (the caregiver) can access historical data. We never sell or share personal information.'
      }
    ]
  },
  {
    category: 'Smart Features',
    questions: [
      {
        q: 'What is Smart Home Integration?',
        a: 'Connect Philips Hue, Nest, and other smart devices. Memory Mirror can automatically adjust lighting, temperature, and music based on detected mood and anxiety levels to create calming environments.'
      },
      {
        q: 'What are Mood Automations?',
        a: 'Pre-configured smart home responses triggered by anxiety or agitation. For example: dim lights + play calm music + lower temperature when anxiety reaches level 7.'
      },
      {
        q: 'What is Bad Day Mode?',
        a: 'A one-tap feature that activates enhanced calming support: softer voice, simpler prompts, favorite memories, and notification to caregivers. Can be triggered remotely by family members.'
      },
      {
        q: 'Can family members share content remotely?',
        a: 'Yes! The Family Portal allows family to send photos, messages, music playlists, and memory prompts that appear instantly on the loved one\'s device.'
      }
    ]
  },
  {
    category: 'Technical Support',
    questions: [
      {
        q: 'What devices work with Memory Mirror?',
        a: 'Memory Mirror works on smartphones, tablets, and TVs via web browser. We recommend tablets (10-12 inches) for optimal visibility and voice interaction.'
      },
      {
        q: 'Does it work on TV?',
        a: 'Yes! Use TV Pairing mode to connect your smart TV. The interface automatically switches to extra-large text, voice controls, and simplified navigation perfect for viewing from a distance.'
      },
      {
        q: 'What if internet connection is lost?',
        a: 'Memory Mirror continues functioning with cached data and offline mode. When reconnected, it syncs updates automatically. The Offline Status Bar shows connection state.'
      },
      {
        q: 'How do I get support?',
        a: 'Email support@memorymirror.app or use the Feedback page. Our creator personally responds to all messages, typically within 24 hours.'
      }
    ]
  },
  {
    category: 'Billing & Account',
    questions: [
      {
        q: 'When will the subscription start?',
        a: 'Not yet determined. We\'ll announce the subscription launch well in advance (at least 30 days notice) and only after Memory Mirror is running perfectly. No surprise charges - ever.'
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes. When subscriptions begin, you can cancel anytime with no penalties. Your access continues until the end of the paid period.'
      },
      {
        q: 'Are there family discounts?',
        a: 'When subscriptions launch, we plan to offer family plans at reduced rates. Pricing details will be announced closer to the subscription start date.'
      },
      {
        q: 'Can I donate now to support development?',
        a: 'Yes! Donations help keep servers running and development moving forward. Click the "Donate" button on the landing page. 100% goes to operational costs, never personal use.'
      }
    ]
  }
];

export default function FAQ() {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleItem = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <MessageCircle className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about Memory Mirror and compassionate dementia care
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8 mb-12">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Heart className="w-6 h-6 text-blue-600" />
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.questions.map((item, questionIndex) => {
                  const key = `${categoryIndex}-${questionIndex}`;
                  const isExpanded = expandedItems[key];

                  return (
                    <Card
                      key={questionIndex}
                      className="overflow-hidden border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                    >
                      <button
                        onClick={() => toggleItem(categoryIndex, questionIndex)}
                        className="w-full text-left p-6 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-h-[72px]"
                      >
                        <span className="font-semibold text-slate-900 dark:text-white text-lg">
                          {item.q}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-slate-400 flex-shrink-0" />
                        )}
                      </button>
                      {isExpanded && (
                        <CardContent className="pt-0 pb-6 px-6">
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {item.a}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Still have questions?</h3>
            <p className="mb-6 text-white/90">
              We're here to help. Reach out anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.href = 'mailto:support@memorymirror.app'}
                variant="secondary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Email Support
              </Button>
              <Link to={createPageUrl('Feedback')}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white/10"
                >
                  Send Feedback
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}