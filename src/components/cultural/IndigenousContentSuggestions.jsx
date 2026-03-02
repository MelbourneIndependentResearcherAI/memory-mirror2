import React, { useState } from 'react';
import { INDIGENOUS_CONTENT_SUGGESTIONS } from './CulturalSafetyGuide';

/**
 * Displays culturally appropriate music, story, and conversation suggestions
 * for Aboriginal and Torres Strait Islander users.
 * 
 * IMPORTANT: These are general suggestions. Always consult with the individual's
 * family and community for specific appropriate content.
 */
export default function IndigenousContentSuggestions({ countryOrMob }) {
  const [activeTab, setActiveTab] = useState('music');

  const tabs = [
    { id: 'music', label: '🎵 Music', items: INDIGENOUS_CONTENT_SUGGESTIONS.music_themes },
    { id: 'stories', label: '📖 Stories', items: INDIGENOUS_CONTENT_SUGGESTIONS.story_themes },
    { id: 'conversation', label: '💬 Chat Starters', items: INDIGENOUS_CONTENT_SUGGESTIONS.conversation_starters },
  ];

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">🌏</span>
        <h3 className="font-bold text-amber-900">Culturally Appropriate Content</h3>
      </div>
      {countryOrMob && (
        <p className="text-sm text-amber-700 mb-3">Suggestions for <strong>{countryOrMob}</strong> — please verify with family what is appropriate.</p>
      )}
      <p className="text-xs text-amber-600 mb-4 bg-amber-100 rounded-lg px-3 py-2 border border-amber-200">
        ⚠️ <strong>Cultural Safety Note:</strong> These are general suggestions only. Always consult with family members and community Elders to confirm what is safe and appropriate for this individual.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white'
                : 'bg-white text-amber-700 border border-amber-300 hover:bg-amber-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {tabs.find(t => t.id === activeTab)?.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-3 border-t border-amber-200">
        <p className="text-xs text-amber-600 font-medium">
          💡 For guidance, contact your local{' '}
          <a href="https://www.naccho.org.au" target="_blank" rel="noopener noreferrer" className="underline">
            Aboriginal Community Controlled Health Organisation (NACCHO)
          </a>
        </p>
      </div>
    </div>
  );
}