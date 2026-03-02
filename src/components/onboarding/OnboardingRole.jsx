import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const ROLES = [
  {
    id: 'patient_family',
    emoji: '👨‍👩‍👧',
    title: 'Family Member / Carer at Home',
    desc: "I'm caring for a loved one with dementia at home",
    color: 'from-pink-500 to-rose-500',
    border: 'border-pink-300',
    bg: 'bg-pink-50',
  },
  {
    id: 'caregiver',
    emoji: '👨‍⚕️',
    title: 'Professional Caregiver',
    desc: "I'm a nurse, support worker or aged care professional",
    color: 'from-purple-500 to-indigo-500',
    border: 'border-purple-300',
    bg: 'bg-purple-50',
  },
  {
    id: 'patient',
    emoji: '🧓',
    title: 'I have dementia / memory challenges',
    desc: "I'm setting this up for myself",
    color: 'from-blue-500 to-cyan-500',
    border: 'border-blue-300',
    bg: 'bg-blue-50',
  },
];

export default function OnboardingRole({ data, onUpdate, onNext, onBack }) {
  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Who are you setting this up for?</h2>
        <p className="text-slate-500">This helps us tailor the experience to your needs.</p>
      </div>

      <div className="space-y-4 mb-8">
        {ROLES.map(role => (
          <button
            key={role.id}
            onClick={() => onUpdate({ role: role.id })}
            className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
              data.role === role.id
                ? `${role.border} ${role.bg} shadow-md scale-[1.02]`
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{role.emoji}</span>
              <div>
                <p className="font-bold text-slate-900 text-base">{role.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{role.desc}</p>
              </div>
              {data.role === role.id && (
                <div className={`ml-auto w-6 h-6 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
        <Button
          onClick={onNext}
          disabled={!data.role}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold gap-2"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}