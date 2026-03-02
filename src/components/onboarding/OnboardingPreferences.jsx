import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const ERAS = [
  { id: '1940s', label: '1940s', desc: 'WWII era, big band, classic radio' },
  { id: '1960s', label: '1960s', desc: 'Beatles, flower power, moon landing' },
  { id: '1980s', label: '1980s', desc: 'Pop hits, VHS, disco fading out' },
  { id: 'present', label: 'Present', desc: 'Current era, modern music' },
];

const INTERESTS = ['Music', 'Gardening', 'Cooking', 'Sports', 'Family stories', 'Nature', 'Travel', 'Reading', 'Religion/Faith', 'Crafts'];

const CONCERNS = [
  { id: 'loneliness', label: '😔 Loneliness & isolation' },
  { id: 'anxiety', label: '😰 Anxiety & agitation' },
  { id: 'safety', label: '🛡️ Safety & wandering' },
  { id: 'memory', label: '🧠 Memory loss & confusion' },
  { id: 'family', label: '👨‍👩‍👧 Staying connected to family' },
  { id: 'daily_routine', label: '📅 Daily routine & reminders' },
];

export default function OnboardingPreferences({ data, onUpdate, onNext, onBack }) {
  const toggleInterest = (interest) => {
    const current = data.interests || [];
    const updated = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest];
    onUpdate({ interests: updated });
  };

  const isPatientSetup = data.role === 'patient_family' || data.role === 'patient';

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          {isPatientSetup ? 'Tell us about your loved one' : 'Personalise your experience'}
        </h2>
        <p className="text-slate-500 text-sm">The more you share, the better Memory Mirror can help. All optional.</p>
      </div>

      <div className="space-y-6 mb-8">
        {/* Name */}
        {isPatientSetup && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {data.role === 'patient' ? "What's your preferred name?" : "What's their name?"}
            </label>
            <Input
              placeholder={data.role === 'patient' ? 'e.g. Margaret' : "e.g. Mum, Dad, Margaret..."}
              value={data.lovedOneName}
              onChange={e => onUpdate({ lovedOneName: e.target.value })}
              className="text-base"
            />
          </div>
        )}

        {/* Era */}
        {isPatientSetup && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Which era feels most like "home"?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ERAS.map(era => (
                <button
                  key={era.id}
                  onClick={() => onUpdate({ era: era.id })}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    data.era === era.id
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className="font-bold text-slate-900 text-sm">{era.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{era.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {isPatientSetup ? 'Interests & hobbies (select all that apply)' : 'Areas you want help with'}
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(interest => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                  (data.interests || []).includes(interest)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Concern */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            What's your biggest concern right now?
          </label>
          <div className="grid grid-cols-1 gap-2">
            {CONCERNS.map(c => (
              <button
                key={c.id}
                onClick={() => onUpdate({ primaryConcern: c.id })}
                className={`p-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                  data.primaryConcern === c.id
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold gap-2"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}