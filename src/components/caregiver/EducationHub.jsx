import React, { useState } from 'react';
import { Book, Brain, Heart, Shield, Lightbulb, ChevronRight, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

const educationTopics = [
  {
    id: 'dementia-basics',
    title: 'Understanding Dementia',
    icon: Brain,
    color: 'from-blue-500 to-cyan-600',
    topics: [
      'What is dementia and how does it progress?',
      'Different types of dementia (Alzheimer\'s, vascular, etc.)',
      'Common symptoms and behavioral changes',
      'Memory loss vs normal aging',
      'How dementia affects perception of time and place'
    ]
  },
  {
    id: 'communication',
    title: 'Communication Strategies',
    icon: Heart,
    color: 'from-pink-500 to-rose-600',
    topics: [
      'How to communicate effectively with someone who has dementia',
      'Validation therapy: Meeting them where they are',
      'Responding to repetitive questions',
      'Non-verbal communication techniques',
      'When and how to redirect conversations'
    ]
  },
  {
    id: 'anxiety-management',
    title: 'Managing Anxiety & Agitation',
    icon: Shield,
    color: 'from-purple-500 to-indigo-600',
    topics: [
      'Common triggers for anxiety in dementia patients',
      'Sundowning: What it is and how to manage it',
      'Creating a calming environment',
      'Distraction and redirection techniques',
      'When to seek professional help'
    ]
  },
  {
    id: 'caregiver-wellbeing',
    title: 'Caregiver Self-Care',
    icon: Heart,
    color: 'from-emerald-500 to-teal-600',
    topics: [
      'Recognizing caregiver burnout',
      'Setting boundaries and asking for help',
      'Finding respite care options',
      'Managing your own emotions and guilt',
      'Building a support network'
    ]
  },
  {
    id: 'memory-mirror-features',
    title: 'How Memory Mirror Helps',
    icon: Lightbulb,
    color: 'from-amber-500 to-orange-600',
    topics: [
      'Era detection: Why it matters for communication',
      'Anxiety intervention: How AI identifies distress',
      'Safe memory zones: Therapeutic redirects',
      'Voice companion: Benefits of consistent support',
      'When to use Phone vs Chat vs Security modes'
    ]
  }
];

export default function EducationHub() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const loadTopicContent = async (categoryId, topic) => {
    setLoading(true);
    setSelectedTopic(topic);
    setContent('');

    try {
      const prompt = categoryId === 'memory-mirror-features'
        ? `As a dementia care expert, explain in 300-400 words: "${topic}"
        
Context: Memory Mirror is an AI companion for dementia care with features like era detection (adapts to what time period the person thinks they're in), anxiety intervention (detects distress and provides calming responses), voice activation, and memory recall.

Focus on:
- Practical, evidence-based information
- How this specific feature helps caregivers and patients
- Real-world examples
- Easy-to-understand language for non-medical caregivers

Format with clear headings and bullet points where helpful.`
        : `As a dementia care expert, explain in 300-400 words: "${topic}"

Provide:
- Clear, compassionate explanation
- Practical strategies caregivers can use immediately
- Real examples
- Evidence-based approaches
- Supportive, non-judgmental tone

Format with clear headings and bullet points where helpful.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setContent(response);
    } catch (error) {
      setContent('Unable to load content. Please try again.');
      console.error('Education content error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-2 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-2xl">Education Hub</h2>
              <p className="text-sm font-normal text-slate-600 dark:text-slate-400 mt-1">
                Learn about dementia care and how to use Memory Mirror effectively
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {educationTopics.map((category) => {
          const Icon = category.icon;
          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedCategory?.id === category.id
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : ''
              }`}
              onClick={() => {
                setSelectedCategory(category);
                setSelectedTopic(null);
                setContent('');
              }}
            >
              <CardContent className="p-6">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-100">
                  {category.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {category.topics.length} topics
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedCategory && (
        <Card className="bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-xl">
              {selectedCategory.title} - Choose a Topic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedCategory.topics.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => loadTopicContent(selectedCategory.id, topic)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
                    selectedTopic === topic
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {topic}
                    </span>
                    {selectedTopic === topic && !loading ? (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card className="bg-white dark:bg-slate-900">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-slate-600 dark:text-slate-400">
              Loading educational content...
            </p>
          </CardContent>
        </Card>
      )}

      {content && !loading && (
        <Card className="bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              {selectedTopic}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-2 border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>💡 Tip:</strong> This content is AI-generated and combines current research with practical caregiving wisdom. Always consult healthcare professionals for medical advice.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}