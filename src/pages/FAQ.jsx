import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const faqCategories = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'What is Memory Mirror?',
        a: 'Memory Mirror is an AI-powered companion app specifically designed for people living with dementia. It provides gentle, compassionate interaction through voice and chat, adapts to different mental time periods (eras), and helps manage anxiety while keeping loved ones safe and engaged.'
      },
      {
        q: 'How do I set up Memory Mirror?',
        a: 'Simply visit the app, and you can start using it immediately. Caregivers should visit the Caregiver Portal to set up a user profile, upload photos and memories, configure reminders, and customize settings. The AI will adapt to your loved one automatically over time.'
      },
      {
        q: 'What devices does Memory Mirror work on?',
        a: 'Memory Mirror works on any modern web browser on smartphones, tablets, and computers. It works best on touch-screen devices. For voice features, ensure your device has a microphone and speakers.'
      },
      {
        q: 'Does Memory Mirror work offline?',
        a: 'Yes! Memory Mirror has extensive offline capabilities. Once loaded, many features work without internet, including voice interaction, memories, music playback, and games. The app automatically syncs when reconnected.'
      }
    ]
  },
  {
    category: 'Features & Modes',
    questions: [
      {
        q: 'What is Chat Mode?',
        a: 'Chat Mode provides conversational AI interaction through voice or text. The AI companion adapts to different eras (1940s, 1960s, 1980s, present) to meet your loved one where they are mentally, never correcting or reality-orienting.'
      },
      {
        q: 'What is Phone Mode?',
        a: 'Phone Mode provides a simplified calling interface with large buttons for emergency contacts and family members. It includes hands-free calling and quick-dial options designed for easy use.'
      },
      {
        q: 'What is Security Mode?',
        a: 'Security Mode offers reassuring checks for doors, windows, lights, and overall safety. It uses gentle language to provide peace of mind without triggering anxiety about security concerns.'
      },
      {
        q: 'What is Night Watch?',
        a: 'Night Watch is a specialized nighttime companion that gently redirects confused nighttime wandering, provides comfort during distress, and logs incidents for caregiver review. It operates in a calming low-light interface.'
      },
      {
        q: 'What is Bad Day Mode?',
        a: 'Bad Day Mode can be activated by voice ("Hey Mirror, I\'m having a bad day"), button press, or remotely by caregivers. It provides guided breathing exercises, plays calming music, shows happy memories, and offers gentle comfort. It automatically alerts caregivers.'
      },
      {
        q: 'How does era adaptation work?',
        a: 'The AI detects which time period your loved one is mentally experiencing and adapts its language, cultural references, and conversation style accordingly. You can also manually select an era or use auto-detection mode.'
      }
    ]
  },
  {
    category: 'For Caregivers',
    questions: [
      {
        q: 'How do I access the Caregiver Portal?',
        a: 'Click the Settings icon (gear) in the top-right corner of the home screen, or visit the Caregiver Portal link in the footer. You\'ll need to log in or create an account.'
      },
      {
        q: 'What can I do in the Caregiver Portal?',
        a: 'In the portal, you can: set up user profiles, upload family photos and videos, create music playlists, manage activity reminders, view insights and analytics, read conversation logs, monitor anxiety trends, configure smart home automations, and review night watch incidents.'
      },
      {
        q: 'How do I set up activity reminders?',
        a: 'Go to Caregiver Portal → Activity Reminders. Create reminders for medication, meals, exercise, social calls, etc. Set the time, frequency, and custom voice prompts. Reminders appear as gentle notifications with optional voice announcements.'
      },
      {
        q: 'Can I upload my own photos and videos?',
        a: 'Yes! In the Caregiver Portal → Photo Library, upload family photos and videos with captions. The AI will use these to spark conversations and show them at appropriate times.'
      },
      {
        q: 'How do I monitor anxiety levels?',
        a: 'The Insights & Analytics section shows anxiety trends over time, common triggers, and patterns. The system tracks conversational cues and logs high-anxiety moments automatically.'
      },
      {
        q: 'Can I remotely activate Bad Day Mode?',
        a: 'Yes! From the Caregiver Portal home screen, click "Activate Bad Day Mode" to remotely trigger calming interventions when your loved one needs extra support.'
      }
    ]
  },
  {
    category: 'Voice & AI Features',
    questions: [
      {
        q: 'How do I use voice commands?',
        a: 'Tap the large microphone button and speak clearly. Say "Hey Mirror" as a wake word, or use specific commands like "I\'m having a bad day," "Play some music," "Show me memories," or "Call my daughter."'
      },
      {
        q: 'What languages does Memory Mirror support?',
        a: 'Memory Mirror supports 20+ languages including English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Arabic, Hindi, and more. Select your language in the language selector.'
      },
      {
        q: 'Can I customize the AI\'s voice?',
        a: 'The AI uses natural speech synthesis with gentle pacing and warm tone. Voice settings adapt automatically based on anxiety levels - slower and calmer during distress.'
      },
      {
        q: 'How does the AI detect anxiety?',
        a: 'The AI analyzes conversation tone, word choice, repetition patterns, and emotional cues to detect anxiety levels (0-10 scale). High anxiety triggers gentle redirections to "safe memory zones" and can suggest mode switches.'
      },
      {
        q: 'What are Safe Memory Zones?',
        a: 'Safe Memory Zones are pre-configured positive topics (like family, hobbies, favorite places) that the AI redirects to when anxiety is detected, avoiding triggering subjects.'
      }
    ]
  },
  {
    category: 'Smart Home Integration',
    questions: [
      {
        q: 'Can Memory Mirror control smart home devices?',
        a: 'Yes! Connect smart lights, thermostats, door locks, and plugs. The AI can adjust lighting and temperature based on mood, time of day, or routines. Configure in Caregiver Portal → Smart Home.'
      },
      {
        q: 'What are Mood-Based Automations?',
        a: 'Mood-Based Automations automatically adjust your environment based on detected emotional state. For example, dimming lights and playing calm music when anxiety is high, or brightening lights during happy moments.'
      },
      {
        q: 'Which smart home brands are supported?',
        a: 'Memory Mirror works with most Wi-Fi smart devices including Philips Hue, LIFX, Nest, Ecobee, August, Ring, and generic WiFi plugs/lights. Devices must have API access.'
      }
    ]
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        q: 'Is my data secure?',
        a: 'Yes. All conversations and personal data are encrypted. Data is stored securely and never shared with third parties. You have full control to delete any data at any time.'
      },
      {
        q: 'Are conversations recorded?',
        a: 'Conversations are logged for caregiver review and to improve AI responses, but audio is not permanently recorded. Logs can be viewed or deleted from the Caregiver Portal.'
      },
      {
        q: 'Who can access the caregiver features?',
        a: 'Only authorized caregivers with login credentials can access the portal. You can invite additional family members as caregivers or regular users.'
      },
      {
        q: 'Can I export my data?',
        a: 'Yes. Visit Caregiver Portal → Settings to export all your data including conversation logs, memories, photos, and analytics in standard formats.'
      }
    ]
  },
  {
    category: 'Memories & Media',
    questions: [
      {
        q: 'How does Smart Memory Recall work?',
        a: 'The AI analyzes conversations in real-time and proactively suggests relevant photos, videos, and memories from your library. It shows them at appropriate moments to spark positive reminiscence.'
      },
      {
        q: 'Can I organize memories by era?',
        a: 'Yes! When uploading memories, tag them by era (1940s, 1960s, 1980s, present). The AI prioritizes showing memories from the mental time period your loved one is currently experiencing.'
      },
      {
        q: 'What music features are available?',
        a: 'Create custom playlists organized by era and mood (uplifting, calm, nostalgic). The AI can play music on request or automatically during Bad Day Mode. Search for songs by decade or artist.'
      }
    ]
  },
  {
    category: 'Technical & Troubleshooting',
    questions: [
      {
        q: 'The microphone isn\'t working. What should I do?',
        a: 'Ensure your browser has microphone permissions enabled. On mobile, check device settings. Try refreshing the page. Voice features require Chrome, Safari, or Edge browsers.'
      },
      {
        q: 'The app seems slow or laggy.',
        a: 'Memory Mirror works best with a stable internet connection. However, most features work offline once cached. Try clearing your browser cache or restarting the app. Check your connection speed.'
      },
      {
        q: 'Voice recognition isn\'t understanding my loved one.',
        a: 'Speak clearly and ensure there\'s minimal background noise. The AI learns speech patterns over time. You can also use the text input option instead of voice.'
      },
      {
        q: 'How do I sync data across devices?',
        a: 'Data syncs automatically when online. Visit Sync & Backup page to manually trigger sync or check sync status. Ensure you\'re logged in with the same account on all devices.'
      },
      {
        q: 'Can multiple caregivers access the same account?',
        a: 'Yes! Invite additional caregivers from the Settings page. Each can have admin or viewer roles with different permission levels.'
      }
    ]
  },
  {
    category: 'Legal & Disclaimers',
    questions: [
      {
        q: 'Is Memory Mirror a medical device?',
        a: 'No. Memory Mirror is NOT a medical device and is NOT intended to diagnose, treat, cure, or prevent any disease. It is a companion tool designed to supplement professional dementia care, not replace it. Always consult healthcare professionals for medical advice.'
      },
      {
        q: 'What are the liability limitations?',
        a: 'Memory Mirror is provided "as is" without warranties. We are not liable for any damages, harm, or losses resulting from app use. This includes AI errors, technical failures, or any physical, emotional, or financial harm. See our Terms of Service for complete details.'
      },
      {
        q: 'Who is responsible for the safety of my loved one?',
        a: 'Caregivers and family members are fully responsible for the safety and wellbeing of their loved ones. Memory Mirror is a support tool that should be used under supervision, not as a replacement for human care and medical oversight.'
      },
      {
        q: 'Can I use Memory Mirror without caregiver supervision?',
        a: 'No. Memory Mirror should always be used under the supervision of a qualified caregiver or family member. It is not designed for unsupervised use by individuals with dementia.'
      },
      {
        q: 'What should I do in an emergency?',
        a: 'Memory Mirror is NOT for emergencies. In case of medical emergency, call emergency services immediately (911, 999, 112, or your local emergency number). Do not rely on the app for urgent medical situations.'
      },
      {
        q: 'Is the AI perfect?',
        a: 'No. AI may produce incorrect, inappropriate, or unexpected responses. All AI interactions should be monitored by caregivers. We do not guarantee the accuracy or reliability of AI-generated content.'
      },
      {
        q: 'What laws govern my use of Memory Mirror?',
        a: 'Memory Mirror complies with HIPAA (US), GDPR (EU), CCPA (California), PIPEDA (Canada), and Australian Privacy Act. These Terms are governed by California law. International users must comply with their local laws.'
      }
    ]
  },
  {
    category: 'Pricing & Support',
    questions: [
      {
        q: 'How much does Memory Mirror cost?',
        a: 'Memory Mirror offers a free tier with daily limited access. Premium subscription is $9.99/month - intentionally priced well below other dementia care apps. IMPORTANT: Subscription fees will not begin until the app is running smoothly and all final tweaks are complete. We will notify you before billing starts.'
      },
      {
        q: 'Is there a free trial?',
        a: 'Yes! All premium features are available free for 30 days. No credit card required to start. Cancel anytime without charge.'
      },
      {
        q: 'How do I cancel my subscription?',
        a: 'Visit Caregiver Portal → Settings → Billing. Click "Cancel Subscription." Your access continues until the end of the paid period.'
      },
      {
        q: 'How do I get support?',
        a: 'Email support: mcnamaram86@gmail.com. We typically respond within 24 hours. For urgent issues, use the in-app chat support (premium members get priority response).'
      },
      {
        q: 'Do you offer discounts for families in need?',
        a: 'Yes. We offer financial assistance for families who cannot afford the subscription. Contact us at mcnamaram86@gmail.com to apply.'
      }
    ]
  }
];

export default function FAQ() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [openQuestions, setOpenQuestions] = useState(new Set());

  const toggleQuestion = (categoryIdx, questionIdx) => {
    const key = `${categoryIdx}-${questionIdx}`;
    setOpenQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const filteredCategories = searchTerm
    ? faqCategories.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q =>
          q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(cat => cat.questions.length > 0)
    : faqCategories;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-white/90">Everything you need to know about Memory Mirror</p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No questions found matching "{searchTerm}"</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((category, catIdx) => (
              <div key={catIdx}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <span className="text-3xl">{
                    catIdx === 0 ? '🚀' :
                    catIdx === 1 ? '✨' :
                    catIdx === 2 ? '👨‍👩‍👧' :
                    catIdx === 3 ? '🎤' :
                    catIdx === 4 ? '🏠' :
                    catIdx === 5 ? '🔒' :
                    catIdx === 6 ? '⚖️' :
                    catIdx === 7 ? '📸' :
                    catIdx === 8 ? '🔧' :
                    '💳'
                  }</span>
                  {category.category}
                </h2>
                
                <div className="space-y-3">
                  {category.questions.map((item, qIdx) => {
                    const isOpen = openQuestions.has(`${catIdx}-${qIdx}`);
                    return (
                      <div
                        key={qIdx}
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden"
                      >
                        <button
                          onClick={() => toggleQuestion(catIdx, qIdx)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <span className="font-semibold text-gray-900 dark:text-white pr-4">
                            {item.q}
                          </span>
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          </motion.div>
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {item.a}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
          <p className="text-white/90 mb-6">
            We're here to help! Contact our support team anytime.
          </p>
          <a
            href="mailto:mcnamaram86@gmail.com"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}