import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

export default function FAQ() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'Quick Access & Be My Eyes Feature',
      questions: [
        {
          q: 'What is the Quick Access button?',
          a: 'The Quick Access button is a single BIG RED BUTTON inspired by the "Be My Eyes" app. It\'s designed for people with dementia who struggle to find apps or answer their phone. One simple press launches Memory Mirror instantly - no complex navigation needed.'
        },
        {
          q: 'How do I set up Quick Access for my loved one?',
          a: 'Go to Caregiver Portal → Settings and enable "Quick Access Mode". Then, add the Quick Access page to your loved one\'s phone home screen for instant one-tap launch. This makes it as easy as possible for them to use the app.'
        },
        {
          q: 'Can I customize what the big button does?',
          a: 'Currently, the big red button launches the main AI companion interface. This keeps it simple and predictable. If you need different default behavior, you can set up custom shortcuts in the Caregiver Portal.'
        },
        {
          q: 'Why was this feature added?',
          a: 'Based on feedback from Becky, a caregiver who mentioned the "Be My Eyes" app\'s single big button design. She noted that finding apps is difficult for dementia patients, and her husband struggles with even answering his phone. We designed Quick Access to solve exactly this problem.'
        }
      ]
    },
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I get started with Memory Mirror?',
          a: 'Simply tap "Quick Access" or "Start Companion" on the landing page. No account creation is required to start using the AI companion. Caregivers can set up the full portal later to access advanced features.'
        },
        {
          q: 'Do I need to create an account?',
          a: 'For basic AI companion features, no account is needed. However, creating an account (or signing in) unlocks caregiver tools, history tracking, and personalization features.'
        },
        {
          q: 'Is Memory Mirror free?',
          a: 'Memory Mirror is currently free to use during beta. We may introduce optional premium features in the future, but the core AI companion will always remain accessible.'
        }
      ]
    },
    {
      category: 'For Caregivers',
      questions: [
        {
          q: 'How do I monitor my loved one\'s interactions?',
          a: 'Sign in to the Caregiver Portal to view conversation history, anxiety trends, and activity logs. You can also set up alerts for specific triggers or concerning patterns.'
        },
        {
          q: 'Can I customize the AI\'s behavior?',
          a: 'Yes! In the Caregiver Portal, you can set up user profiles with era preferences, important memories, safe topics, and communication style. This helps the AI provide more personalized and appropriate responses.'
        },
        {
          q: 'What is Night Watch mode?',
          a: 'Night Watch is an AI-powered overnight monitoring feature that detects distress, confusion, or emergency situations during nighttime hours. It can alert caregivers when immediate attention may be needed.'
        }
      ]
    },
    {
      category: 'Safety & Privacy',
      questions: [
        {
          q: 'Is my data private and secure?',
          a: 'Yes. All conversations and personal data are encrypted and stored securely. We never sell data to third parties, and you can delete your account and all data at any time.'
        },
        {
          q: 'Can the AI detect scams or dangerous situations?',
          a: 'Memory Mirror includes a Security Scanner feature that can help identify potential scams, suspicious messages, and online safety risks. However, it should not replace human oversight.'
        },
        {
          q: 'What happens if there\'s an emergency?',
          a: 'The app includes emergency contact buttons and can alert designated caregivers through the Emergency Alert System. Night Watch mode also monitors for distress signals during nighttime hours.'
        }
      ]
    },
    {
      category: 'Features',
      questions: [
        {
          q: 'Does Memory Mirror work offline?',
          a: 'Yes! Many features work offline, including offline audio playback, memory viewing, and basic interactions. Some AI features require internet, but core functionality is available without WiFi.'
        },
        {
          q: 'What is the Fake Banking feature?',
          a: 'The Fake Banking feature displays a reassuring fake bank balance to reduce financial anxiety. This can help when a person with dementia repeatedly checks their finances and becomes worried. Caregivers can configure what balance is displayed.'
        },
        {
          q: 'Can family members contribute content?',
          a: 'Yes! Through the Family Portal, family members can upload photos, music, stories, and messages. This helps create a rich library of familiar content for your loved one.'
        }
      ]
    },
    {
      category: 'Technical',
      questions: [
        {
          q: 'What devices does Memory Mirror work on?',
          a: 'Memory Mirror works on any modern smartphone, tablet, or computer with a web browser. For the best experience, we recommend using Chrome, Safari, or Edge.'
        },
        {
          q: 'Can I install Memory Mirror as an app?',
          a: 'Yes! Memory Mirror is a Progressive Web App (PWA). You can install it on your home screen for a native app-like experience. Look for the "Install App" button on the landing page.'
        },
        {
          q: 'How do I add Quick Access to my home screen?',
          a: 'Visit the Quick Access page, then use your browser\'s "Add to Home Screen" option. On iPhone: tap Share → Add to Home Screen. On Android: tap the menu (three dots) → Add to Home Screen.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq =>
        faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 p-4 md:p-8 pb-20">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          ← Back
        </Button>

        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Everything you need to know about Memory Mirror
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 text-base"
          />
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {filteredFaqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-200/60 dark:border-slate-700/50">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                {category.category === 'Quick Access & Be My Eyes Feature' && (
                  <Target className="w-6 h-6 text-red-500" />
                )}
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.questions.map((faq, index) => {
                  const globalIndex = categoryIndex * 1000 + index;
                  const isOpen = openIndex === globalIndex;
                  
                  return (
                    <div
                      key={index}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="font-semibold text-slate-900 dark:text-white pr-4">
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-slate-500 transition-transform flex-shrink-0 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              No questions found matching "{searchTerm}"
            </p>
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
          <p className="mb-6 text-white/90">
            We're here to help. Reach out to our support team anytime.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => navigate('/Feedback')}
              className="bg-white text-blue-600 hover:bg-white/90"
            >
              Send Feedback
            </Button>
            <a
              href="mailto:support@memorymirror.app"
              className="inline-flex items-center px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}