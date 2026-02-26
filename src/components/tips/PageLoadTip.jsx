import React, { useState, useEffect } from 'react';
import { X, Lightbulb, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const tips = [
  {
    title: "Did You Know?",
    icon: "💡",
    content: "Music from a person's youth can trigger vivid memories and improve mood, even in advanced dementia stages."
  },
  {
    title: "Carer Tip",
    icon: "❤️",
    content: "Taking regular breaks is not selfish - it's essential. Caregiver burnout affects 40-70% of family caregivers."
  },
  {
    title: "Understanding Dementia",
    icon: "🧠",
    content: "People with dementia often feel emotions more deeply than they can express. A gentle tone and patient presence matter more than perfect words."
  },
  {
    title: "Carer Tip",
    icon: "🤝",
    content: "Join a support group. Caregivers who connect with others report 30% less stress and feel more prepared."
  },
  {
    title: "Communication Tip",
    icon: "💬",
    content: "Use simple sentences and give time to respond. People with dementia may need 30-60 seconds to process information."
  },
  {
    title: "Did You Know?",
    icon: "🌙",
    content: "Sundowning - increased confusion in late afternoon - affects up to 45% of dementia patients. Consistent routines help."
  },
  {
    title: "Safety First",
    icon: "🔐",
    content: "Wandering affects 6 in 10 people with dementia. GPS tracking and door alarms provide peace of mind for families."
  },
  {
    title: "Carer Wellbeing",
    icon: "🧘",
    content: "Just 15 minutes of mindfulness daily can reduce caregiver stress by 40%. Your wellbeing matters too."
  },
  {
    title: "Memory Support",
    icon: "📸",
    content: "Photo albums from their past can spark joy and connection. Label photos with names and dates to help conversation flow."
  },
  {
    title: "Daily Routine",
    icon: "⏰",
    content: "Consistent daily routines reduce anxiety. People with dementia feel more secure when they know what to expect."
  },
  {
    title: "Carer Tip",
    icon: "💪",
    content: "Ask for help. 8 in 10 caregivers say they needed support but hesitated to ask. Your friends want to help."
  },
  {
    title: "Validation Works",
    icon: "✅",
    content: "Don't correct - validate. If they think it's 1965, meet them there. Correcting causes distress; validation brings comfort."
  },
  {
    title: "Nutrition Matters",
    icon: "🍎",
    content: "People with dementia may forget to eat. Finger foods and regular small meals help maintain nutrition."
  },
  {
    title: "Touch Therapy",
    icon: "🤲",
    content: "Gentle hand holding or shoulder touches can reduce agitation. Physical connection communicates love when words are hard."
  },
  {
    title: "Night Watch",
    icon: "🌟",
    content: "Night lights and calm voices help with nighttime confusion. 70% of dementia patients experience sleep disturbances."
  },
  {
    title: "Celebrate Small Wins",
    icon: "🎉",
    content: "Every moment of connection is a victory. Focus on what they can still do, not what's been lost."
  },
  {
    title: "Hydration",
    icon: "💧",
    content: "Dehydration worsens confusion. Offer water regularly - people with dementia may not recognize thirst."
  },
  {
    title: "Carer Community",
    icon: "👥",
    content: "You're not alone. Over 400,000 Australians live with dementia, and families caring for them form a powerful support network."
  },
  {
    title: "Patience Practice",
    icon: "🕐",
    content: "Repeat questions are not stubbornness - it's the disease. Respond with kindness each time as if it's the first."
  },
  {
    title: "Technology Helps",
    icon: "📱",
    content: "Simplified interfaces and voice assistants can maintain independence longer. Technology can be empowering, not confusing."
  }
];

export default function PageLoadTip({ pageName }) {
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState(null);

  useEffect(() => {
    // Show tip on page load, but not too frequently
    const lastShown = localStorage.getItem('lastTipShown');
    const now = Date.now();
    
    // Show tip if: never shown before, or it's been more than 2 minutes
    if (!lastShown || now - parseInt(lastShown) > 120000) {
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setCurrentTip(randomTip);
      setShowTip(true);
      localStorage.setItem('lastTipShown', now.toString());
    }
  }, [pageName]);

  const handleClose = () => {
    setShowTip(false);
  };

  return (
    <AnimatePresence>
      {showTip && currentTip && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-8 border-4 border-white/50 dark:border-slate-700/50 relative"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{currentTip.icon}</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {currentTip.title}
              </h3>
            </div>

            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed text-center mb-6">
              {currentTip.content}
            </p>

            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Got it, thanks!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}