import React, { useState, useEffect, useRef } from 'react';
import { Moon, Mic, MicOff, AlertTriangle, CheckCircle, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ChatMessage from './ChatMessage';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { speakWithRealisticVoice } from './voiceUtils';

export default function NightWatch({ onClose }) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [incidentId, setIncidentId] = useState(null);
  const [caregiverAlerted, setCaregiverAlerted] = useState(false);
  const [incidentStartTime] = useState(new Date());
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    }
  });

  // Fetch emergency contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['emergencyContacts'],
    queryFn: () => base44.entities.EmergencyContact.list()
  });

  const primaryContact = contacts.find(c => c.is_primary) || contacts[0];

  // Create incident on mount
  useEffect(() => {
    const createIncident = async () => {
      try {
        const incident = await base44.entities.NightIncident.create({
          timestamp: new Date().toISOString(),
          incident_type: 'movement_detected',
          severity: 'medium',
          caregiver_notified: true,
          conversation_log: []
        });
        setIncidentId(incident.id);

        // Alert caregiver
        await base44.entities.CaregiverAlert.create({
          alert_type: 'check_in_suggested',
          severity: 'warning',
          message: `${userProfile?.loved_one_name || 'User'} is awake and moving at ${new Date().toLocaleTimeString()}. Night Watch activated.`,
          pattern_data: { nightWatch: true, timestamp: new Date().toISOString() }
        });

        setCaregiverAlerted(true);
      } catch (error) {
        console.error('Failed to create incident:', error);
      }
    };

    createIncident();
  }, [userProfile]);

  // Initial greeting
  useEffect(() => {
    if (userProfile) {
      const greetings = [
        `Hi ${userProfile.preferred_name || userProfile.loved_one_name}, it's still nighttime. I'm here with you.`,
        `Hello ${userProfile.preferred_name || userProfile.loved_one_name}, I noticed you're awake. How are you feeling?`,
        `Hey ${userProfile.preferred_name || userProfile.loved_one_name}, it's the middle of the night. Would you like to chat with me?`
      ];
      
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      
      setMessages([{ role: 'assistant', content: greeting }]);
      speakWithRealisticVoice(greeting, { rate: 0.85, pitch: 1.05, volume: 0.8 });
    }
  }, [userProfile]);

  // Auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (transcribedText) => {
    const userMessage = transcribedText || '';
    if (!userMessage.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await base44.functions.invoke('nightModeChat', {
        message: userMessage,
        conversationHistory: messages,
        incidentId
      });

      const aiResponse = response.data;
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse.response,
        hasAlert: !!aiResponse.alertType
      }]);

      // Speak response
      speakWithRealisticVoice(aiResponse.response, { 
        rate: 0.85, 
        pitch: 1.05, 
        volume: 0.8 
      });

      // If high priority alert detected
      if (aiResponse.alertSeverity === 'high') {
        setCaregiverAlerted(true);
      }

    } catch (error) {
      console.error('Night mode chat error:', error);
      const fallback = "I'm here with you. Everything is okay.";
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
      speakWithRealisticVoice(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    
    recognitionRef.current.onstart = () => setIsListening(true);
    
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      sendMessage(transcript);
    };
    
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error('Error starting recognition:', e);
      setIsListening(false);
    }
  };
  
  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleResolve = async (outcome) => {
    try {
      if (incidentId) {
        const duration = Math.round((new Date() - incidentStartTime) / 1000 / 60);
        
        await base44.entities.NightIncident.update(incidentId, {
          outcome,
          duration_minutes: duration,
          severity: 'resolved'
        });
      }
      
      // Log successful resolution
      await base44.entities.ActivityLog.create({
        activity_type: 'security_check',
        details: { 
          nightWatch: true, 
          outcome,
          duration_minutes: Math.round((new Date() - incidentStartTime) / 1000 / 60)
        }
      });

      queryClient.invalidateQueries({ queryKey: ['nightIncidents'] });
      
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to resolve incident:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-4 border-b border-indigo-700">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Moon className="w-8 h-8 text-yellow-300" />
            <div>
              <h1 className="text-xl font-bold text-white">Night Watch</h1>
              <p className="text-sm text-indigo-200">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </p>
            </div>
          </div>
          
          {caregiverAlerted && (
            <Alert className="bg-amber-500/20 border-amber-500 max-w-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <AlertDescription className="text-amber-200 text-sm">
                {primaryContact?.name || 'Caregiver'} has been notified
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full"
      >
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              message={msg.content}
              isAssistant={msg.role === 'assistant'}
              hasVoice={msg.role === 'assistant'}
              onSpeak={() => speakWithRealisticVoice(msg.content, { rate: 0.85 })}
            />
          ))}
          
          {isLoading && (
            <div className="text-center text-slate-400 py-4 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Listening...
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 border-t border-slate-700 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Voice Button */}
          <div className="flex justify-center mb-6">
            <Button
              size="lg"
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              disabled={isLoading}
              className={`
                w-24 h-24 rounded-full shadow-2xl transition-all duration-300
                ${isListening 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                }
              `}
            >
              {isListening ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </Button>
          </div>

          <p className="text-center text-slate-400 mb-6">
            {isListening ? '🎤 Listening...' : 'Tap to speak'}
          </p>

          {/* Resolution Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleResolve('caregiver_assisted')}
              className="border-green-500 text-green-400 hover:bg-green-500/10"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Caregiver Arrived
            </Button>
            <Button
              variant="outline"
              onClick={() => handleResolve('returned_to_bed')}
              className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
            >
              <Moon className="w-4 h-4 mr-2" />
              Back to Bed
            </Button>
          </div>

          {/* Emergency Contact */}
          {primaryContact && (
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
                onClick={() => window.location.href = `tel:${primaryContact.phone}`}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call {primaryContact.name}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}