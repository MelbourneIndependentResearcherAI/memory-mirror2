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
        a: 'Simply click "Start Companion" on the landing page or say "Hey Mirror" to activate voice mode. The app works immediately in your browser - no downloads, logins, or complex setup required.'
      },
      {
        q: 'Do I need to install anything?',
        a: 'No installation required! Memory Mirror works directly in your web browser on any device. However, you can install it as a Progressive Web App (PWA) on your phone or tablet for offline access and a native app-like experience.'
      },
      {
        q: 'Is there a caregiver portal?',
        a: 'Yes! Click "Caregiver Login" from the landing page to access the full Caregiver Portal where you can monitor wellbeing, upload family content, manage care plans, configure alerts, and track your loved one\'s daily interactions.'
      },
      {
        q: 'What modes are available?',
        a: 'Memory Mirror offers Chat Mode (text conversations), Phone Mode (safe calling), Voice Mode (hands-free), Big Button Mode (simplified interface), Night Watch (nighttime support), Security Mode (reassurance), and My Bank (safe financial simulation).'
      }
    ]
  },
  {
    category: 'Core Features',
    questions: [
      {
        q: 'What is the AI Companion?',
        a: 'The AI Companion is a patient, understanding conversational partner specifically trained for dementia care. It adapts to different eras (1940s-present), detects anxiety, recalls personalized memories, and provides gentle redirection when needed.'
      },
      {
        q: 'How does Phone Mode work?',
        a: 'Phone Mode provides a realistic touch-tone dial pad that looks and feels like a real phone. All calls connect to the AI companion instead of real numbers, preventing accidental emergency calls while maintaining the familiar comfort of phone use.'
      },
      {
        q: 'What is Night Watch?',
        a: 'Night Watch is a dedicated nighttime companion that provides comfort during late hours, helps prevent wandering with gentle conversation, logs any night incidents for caregiver review, and maintains a calming presence when anxiety peaks at night.'
      },
      {
        q: 'How does the Security Reassurance feature work?',
        a: 'Security Mode displays a visual dashboard showing that all doors are locked, windows are secure, cameras are monitoring, and the alarm is active. It provides an AI "security guard" who gives reassuring voice messages to reduce safety-related anxiety.'
      },
      {
        q: 'What is the Fake Banking feature?',
        a: 'My Bank provides a safe, simulated banking interface that shows account balances and transactions without any real financial connections. This reduces financial anxiety and provides familiar interactions for those who enjoyed managing their accounts.'
      },
      {
        q: 'Can Memory Mirror work completely offline?',
        a: 'Yes! Download audio content, music, stories, and conversations to your device through the Offline Audio page. The app includes intelligent offline responses and can function without internet for extended periods.'
      }
    ]
  },
  {
    category: 'Geofence & Location Safety',
    questions: [
      {
        q: 'What is Geofence Tracking?',
        a: 'Geofence Tracking lets caregivers set up virtual "safe zones" around the home or familiar areas. If your loved one leaves the safe zone, the system sends immediate alerts with GPS location, distance from zone, and a Google Maps link.'
      },
      {
        q: 'How accurate is the location tracking?',
        a: 'Location tracking uses GPS and provides accuracy within 10-50 meters depending on device and conditions. The live map updates in real-time and shows movement trails so you can see where your loved one has been.'
      },
      {
        q: 'Who gets notified when a geofence is breached?',
        a: 'You specify alert contacts when creating each safe zone. Alerts are sent via in-app notifications and email to all designated caregivers immediately when a breach is detected.'
      },
      {
        q: 'Does location tracking drain the battery?',
        a: 'The app is optimized for battery efficiency. Battery level is monitored and displayed on the tracker. We recommend keeping the device charged and using battery saver mode if needed.'
      }
    ]
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        q: 'Is my loved one\'s data private and secure?',
        a: 'Absolutely. All conversations, location data, and personal information are encrypted end-to-end. We comply with healthcare privacy standards (HIPAA, GDPR). Your data is never shared with third parties or used for advertising.'
      },
      {
        q: 'Who can access my loved one\'s information?',
        a: 'Only caregivers you explicitly invite to the Care Team can access patient data. You control access levels (full access, view-only, or limited) and can revoke access at any time.'
      },
      {
        q: 'How is location data protected?',
        a: 'Location data is encrypted in transit and at rest. Only authorized caregivers on your team can view location information. You can disable location tracking at any time from the Geofence Settings.'
      },
      {
        q: 'Can I export or delete all data?',
        a: 'Yes! From the Caregiver Portal, you can export all data (conversations, activities, care journals) as a PDF or CSV file. You can also request complete data deletion at any time - we honor all data removal requests within 48 hours.'
      }
    ]
  },
  {
    category: 'Caregiver Tools & Monitoring',
    questions: [
      {
        q: 'How do I monitor my loved one\'s wellbeing?',
        a: 'The Caregiver Portal provides an Insights Dashboard showing anxiety trends over time, daily activity patterns, conversation themes, cognitive assessments, and behavioral changes. You can generate detailed reports and track progress.'
      },
      {
        q: 'Can I upload family photos and memories?',
        a: 'Yes! Upload unlimited family photos, videos, voice messages, and personalized stories through the Media Library. The AI uses these to trigger memory recall and create more meaningful, personalized conversations.'
      },
      {
        q: 'What are Care Plans?',
        a: 'Care Plans let you document daily routines, dietary needs, medical history, medications, emergency contacts, and specific care instructions. This ensures consistent care and helps all team members stay informed.'
      },
      {
        q: 'How do emergency alerts work?',
        a: 'Configure custom alert conditions like prolonged distress, high anxiety levels, no interaction for X hours, night incidents, or geofence breaches. Choose notification methods (email, SMS, in-app) and which team members receive each alert type.'
      },
      {
        q: 'What is the Care Journal?',
        a: 'The Care Journal is a shared log where all caregivers can record observations, mood changes, medication given, activities completed, and concerns. It ensures seamless communication between family members and professional caregivers.'
      },
      {
        q: 'Can I invite multiple caregivers?',
        a: 'Yes! Build a complete Care Team by inviting family members, professional caregivers, nurses, or friends. Assign roles (primary, secondary, respite) and set individual access levels and notification preferences for each team member.'
      }
    ]
  },
  {
    category: 'Technical & Troubleshooting',
    questions: [
      {
        q: 'What devices does Memory Mirror work on?',
        a: 'Memory Mirror works on all modern smartphones, tablets, and computers with a web browser (Chrome, Safari, Firefox, Edge). For best experience, we recommend tablets or phones for their portability and touch interfaces.'
      },
      {
        q: 'What happens if internet connection is lost?',
        a: 'The app continues to function with pre-loaded offline content. Conversations, music, stories, and core features remain available. Data syncs automatically when connection is restored through the Sync & Backup system.'
      },
      {
        q: 'How do I sync data across devices?',
        a: 'Data automatically syncs across all devices logged into the same account. You can manually trigger sync from the Sync & Backup page, view sync status, and configure auto-sync preferences.'
      },
      {
        q: 'Can I use this on my TV?',
        a: 'Yes! Memory Mirror can be displayed on smart TVs through screen mirroring/casting from your phone or tablet, or by opening the web app directly on TV browsers. The large screen format is great for viewing photos and videos together.'
      },
      {
        q: 'What if voice recognition isn\'t working?',
        a: 'Ensure microphone permissions are enabled in your browser settings. Speak clearly and at a moderate pace. The "Hey Mirror" wake word requires a quiet environment. You can also use touch/click instead of voice for all features.'
      }
    ]
  },
  {
    category: 'Pricing & Support',
    questions: [
      {
        q: 'How much does Memory Mirror cost?',
        a: 'Memory Mirror costs AUD $9.99/month with manual bank transfer payment. We intentionally keep pricing low because quality dementia care support should be accessible to every family, not just the wealthy.'
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We currently accept manual bank transfer to our Australian account. Simply transfer to BSB 633123, Account 166572719, or use PayID mickiimac@up.me. Premium features activate once payment is confirmed.'
      },
      {
        q: 'Is there a free trial?',
        a: 'Yes! You can use all core features for free immediately. The premium subscription adds advanced features like unlimited storage, priority AI responses, voice cloning, and advanced analytics.'
      },
      {
        q: 'What if I can\'t afford the subscription?',
        a: 'We never turn families away due to financial hardship. Contact support@memorymirror.com.au to discuss assistance options, payment plans, or hardship arrangements. Every family deserves quality dementia care support.'
      },
      {
        q: 'How do I get technical support?',
        a: 'Email support@memorymirror.com.au for technical help, feature questions, or troubleshooting. You can also use the AI Support Assistant in the Caregiver Portal for instant 24/7 automated help.'
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes, you can cancel your subscription at any time with no penalties or fees. Your access continues until the end of your paid period, and you can export all your data before canceling.'
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
              onClick={() => window.location.href = 'mailto:support@memorymirror.com.au'}
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