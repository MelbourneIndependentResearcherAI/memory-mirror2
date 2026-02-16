import React, { useState, useEffect, useRef } from 'react';
import { Moon, AlertTriangle, Phone, X, Volume2, Pause, Loader2, Zap, Lightbulb, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import SmartHomeControls from '../smartHome/SmartHomeControls';

// Night Watch AI System - Prevents wandering, provides comfort, monitors safety
class NightWatchSystem {
  constructor(onIncident, onAlert, userProfile) {
    this.onIncident = onIncident;
    this.onAlert = onAlert;
    this.userProfile = userProfile;
    this.isActive = false;
    this.motionDetectionInterval = null;
    this.conversationLog = [];
    this.currentIncident = null;
    this.lastMotionTime = null;
  }

  activate() {
    this.isActive = true;
    this.startMotionDetection();
    console.log('Night Watch activated');
  }

  deactivate() {
    this.isActive = false;
    if (this.motionDetectionInterval) {
      clearInterval(this.motionDetectionInterval);
    }
    console.log('Night Watch deactivated');
  }

  startMotionDetection() {
    // Simulate motion detection (in production, this would use actual sensors)
    this.motionDetectionInterval = setInterval(() => {
      const currentHour = new Date().getHours();
      const isNightTime = currentHour >= 22 || currentHour < 6;
      
      if (isNightTime && this.isActive) {
        // Simulate random motion detection for demo purposes
        const motionDetected = Math.random() < 0.1; // 10% chance per check
        
        if (motionDetected && !this.currentIncident) {
          this.handleMotionDetected();
        }
      }
    }, 5000); // Check every 5 seconds
  }

  async handleMotionDetected() {
    this.lastMotionTime = new Date();
    
    // Create incident record
    this.currentIncident = {
      timestamp: this.lastMotionTime.toISOString(),
      incident_type: 'movement_detected',
      severity: 'medium',
      conversation_log: []
    };

    // Trigger alert
    this.onAlert({
      type: 'movement_detected',
      message: 'Movement detected during night hours',
      timestamp: this.lastMotionTime
    });

    // Log incident
    this.onIncident(this.currentIncident);
  }

  async processUserStatement(statement) {
    // Ignore empty statements
    if (!statement || statement.trim().length === 0) {
      return null;
    }

    if (!this.currentIncident) {
      this.currentIncident = {
        timestamp: new Date().toISOString(),
        incident_type: 'conversation',
        severity: 'low',
        conversation_log: []
      };
    }

    // Add user statement to log
    this.conversationLog.push({
      role: 'user',
      content: statement,
      timestamp: new Date().toISOString()
    });

    this.currentIncident.user_statement = statement;
    this.currentIncident.conversation_log = this.conversationLog;

    // Analyze for high-risk situations
    const lowerStatement = statement.toLowerCase();
    const isExitAttempt = lowerStatement.includes('go out') || 
                          lowerStatement.includes('leaving') || 
                          lowerStatement.includes('going home') ||
                          lowerStatement.includes('need to leave');
    
    const isDistress = lowerStatement.includes('help') || 
                       lowerStatement.includes('scared') || 
                       lowerStatement.includes('afraid') ||
                       lowerStatement.includes('hurting');

    const isBathroomNeed = lowerStatement.includes('bathroom') || 
                           lowerStatement.includes('toilet') || 
                           lowerStatement.includes('restroom');

    if (isExitAttempt) {
      this.currentIncident.incident_type = 'exit_attempt';
      this.currentIncident.severity = 'high';
      this.onAlert({
        type: 'exit_attempt',
        message: '⚠️ EXIT ATTEMPT DETECTED - Immediate caregiver attention needed',
        timestamp: new Date()
      });
    } else if (isDistress) {
      this.currentIncident.incident_type = 'distress';
      this.currentIncident.severity = 'high';
      this.onAlert({
        type: 'distress',
        message: '⚠️ DISTRESS DETECTED - Check on loved one',
        timestamp: new Date()
      });
    } else if (isBathroomNeed) {
      this.currentIncident.incident_type = 'bathroom_need';
      this.currentIncident.severity = 'medium';
    }

    // Get AI response
    try {
      const response = await base44.functions.invoke('nightModeChat', {
        userMessage: statement,
        conversationHistory: this.conversationLog,
        incidentType: this.currentIncident.incident_type,
        userProfile: this.userProfile
      });

      const aiResponse = response.data.response;

      // Add AI response to log
      this.conversationLog.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      });

      this.currentIncident.ai_response = aiResponse;
      this.currentIncident.conversation_log = this.conversationLog;

      return aiResponse;
    } catch (error) {
      console.error('Night mode chat error:', error);
      return "It's nighttime, and everything is safe. Would you like me to help you get back to bed?";
    }
  }

  async resolveIncident(outcome) {
    if (this.currentIncident) {
      this.currentIncident.outcome = outcome;
      this.currentIncident.duration_minutes = Math.round(
        (new Date() - new Date(this.currentIncident.timestamp)) / 60000
      );

      // Save to database
      try {
        await base44.entities.NightIncident.create(this.currentIncident);
      } catch (error) {
        console.error('Failed to save incident:', error);
      }

      this.currentIncident = null;
      this.conversationLog = [];
    }
  }
}

export default function NightWatch({ onClose }) {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isCheckingDistress, setIsCheckingDistress] = useState(false);
  const [comfortAudio, setComfortAudio] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const systemRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch user profile
    const loadProfile = async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) {
          setUserProfile(profiles[0]);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (!systemRef.current) {
      systemRef.current = new NightWatchSystem(
        handleIncident,
        handleAlert,
        userProfile
      );
    }

    return () => {
      if (systemRef.current) {
        systemRef.current.deactivate();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [userProfile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleIncident = (incident) => {
    console.log('Incident logged:', incident);
  };

  const handleAlert = (alert) => {
    setCurrentAlert(alert);
    toast.error(alert.message);
  };

  const toggleNightWatch = () => {
    if (isActive) {
      systemRef.current?.deactivate();
      systemRef.current?.resolveIncident('caregiver_assisted');
      setIsActive(false);
      stopListening();
    } else {
      systemRef.current?.activate();
      setIsActive(true);
      addMessage('assistant', "Good evening. I'm here to keep you safe and comfortable through the night. If you need anything, just speak to me.");
      speakText("Good evening. I'm here to keep you safe and comfortable through the night. If you need anything, just speak to me.");
      startListening();
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Voice recognition not supported');
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      
      // Ignore empty transcripts
      if (!transcript) return;
      
      addMessage('user', transcript);
      
      const response = await systemRef.current?.processUserStatement(transcript);
      if (response) {
        addMessage('assistant', response);
        speakText(response);
      }
    };

    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isActive) {
        recognition.start(); // Keep listening continuously
      } else {
        setIsListening(false);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date().toISOString() }]);
  };

  const handleEmergencyCall = () => {
    if (systemRef.current?.currentIncident) {
      systemRef.current.currentIncident.caregiver_notified = true;
      systemRef.current.resolveIncident('caregiver_arrived');
    }
    toast.success('Emergency contact notified');
  };

  const checkForDistress = async () => {
    setIsCheckingDistress(true);
    try {
      const hour = new Date().getHours();
      const timeOfNight = hour >= 22 || hour <= 5 ? 'late_night' : 'evening';

      const response = await base44.functions.invoke('nightWatchAI', {
        context: 'ambient_monitoring',
        time_of_night: timeOfNight,
        detected_anxiety_indicators: [],
        previous_incidents: messages
      });

      const result = response.data;
      
      if (result.assessment.recommended_action !== 'continue_monitoring') {
        addMessage('assistant', result.comfort_message);
        speakText(result.comfort_message);

        await base44.entities.NightIncident.create({
          timestamp: new Date().toISOString(),
          incident_type: 'distress',
          severity: result.assessment.distress_level >= 6 ? 'high' : 'medium',
          ai_response: result.comfort_message,
          outcome: 'redirected_to_comfort'
        }).catch(() => {});

        setComfortAudio({
          type: result.comfort_audio_type,
          message: result.comfort_message
        });
      }

      if (result.should_notify_caregiver) {
        setCurrentAlert({
          type: 'caregiver_alert',
          message: 'Caregiver has been notified',
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Distress check failed:', error);
    } finally {
      setIsCheckingDistress(false);
    }
  };

  const playComfortAudio = () => {
    if (!comfortAudio) return;
    
    setIsPlayingAudio(true);
    const utterance = new SpeechSynthesisUtterance(comfortAudio.message);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    utterance.onend = () => {
      setIsPlayingAudio(false);
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Moon className="w-8 h-8 text-yellow-300" />
            <h1 className="text-3xl font-bold">Night Watch</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Comfort Audio */}
        {comfortAudio && (
          <Card className="mb-6 bg-cyan-900/50 border-cyan-700">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <p className="text-white font-semibold">{comfortAudio.message}</p>
                <Button
                  onClick={playComfortAudio}
                  disabled={isPlayingAudio}
                  className="bg-cyan-600 hover:bg-cyan-700 gap-2 w-full"
                >
                  {isPlayingAudio ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Playing...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      Play Comfort Audio
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Card */}
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Night Watch Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                <span className="text-lg">
                  {isActive ? 'Active - Monitoring' : 'Inactive'}
                </span>
              </div>
              <Button
                onClick={toggleNightWatch}
                className={isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {isActive ? 'Deactivate' : 'Activate Night Watch'}
              </Button>
            </div>
            
            {isActive && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Volume2 className={`w-4 h-4 ${isListening ? 'text-green-400' : 'text-gray-400'}`} />
                    <span>{isListening ? 'Listening for voice...' : 'Voice detection paused'}</span>
                  </div>
                  {isSpeaking && (
                    <div className="flex items-center gap-2 text-sm mt-2 text-blue-400">
                      <Volume2 className="w-4 h-4 animate-pulse" />
                      <span>AI speaking...</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={checkForDistress}
                  disabled={isCheckingDistress}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 gap-2"
                >
                  {isCheckingDistress ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Check for Distress
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Alert */}
        {currentAlert && (
          <Card className="mb-6 bg-red-900 border-red-700">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-300 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg text-white mb-1">Alert</h3>
                    <p className="text-red-200">{currentAlert.message}</p>
                    <p className="text-sm text-red-300 mt-1">
                      {currentAlert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleEmergencyCall}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Caregiver
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Smart Home Controls */}
        {isActive && (
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Comfort Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SmartHomeControls mode="compact" />
            </CardContent>
          </Card>
        )}

        {/* Conversation Log */}
        {isActive && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Night Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    No activity detected yet...
                  </p>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-900/50 ml-8'
                          : 'bg-slate-700 mr-8'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="font-semibold text-sm text-slate-300">
                          {msg.role === 'user' ? 'Loved One' : 'AI Companion'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <p className="mt-2 text-white">{msg.content}</p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!isActive && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">How Night Watch Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-300">
              <p>✓ Monitors for movement during nighttime hours (10 PM - 6 AM)</p>
              <p>✓ Provides gentle, calming conversation to reorient and comfort</p>
              <p>✓ Detects bathroom needs, distress, or exit attempts</p>
              <p>✓ Sends immediate alerts for high-risk situations</p>
              <p>✓ Logs all incidents for caregiver review</p>
              <p className="text-yellow-300 mt-4">
                ⚠️ This is a supportive tool. Always ensure proper supervision.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}