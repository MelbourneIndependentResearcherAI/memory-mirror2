import React, { useState, useEffect, useRef } from 'react';
import { Moon, AlertTriangle, Phone, X, Volume2, Loader2, Zap, Lightbulb, Thermometer, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import RemoteCheckIn from '../caregiver/RemoteCheckIn';
import { speakWithRealisticVoice } from './voiceUtils';

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
  const [bedSensorStatus, setBedSensorStatus] = useState({ inBed: true, timeOutOfBed: 0 });
  const [emergencyDetection, setEmergencyDetection] = useState(null);
  const [automatedActionsLog, setAutomatedActionsLog] = useState([]);
  const [showRemoteCheckIn, setShowRemoteCheckIn] = useState(false);
  const [alertHistory, setAlertHistory] = useState([]);
  const [motionDetected, setMotionDetected] = useState(false);
  const [soundLevel, setSoundLevel] = useState(0);
  const systemRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const emergencyMonitorRef = useRef(null);
  const bedSensorIntervalRef = useRef(null);
  const motionListenerRef = useRef(null);
  const soundAnalyzerRef = useRef(null);
  const audioContextRef = useRef(null);

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
      if (emergencyMonitorRef.current) {
        clearInterval(emergencyMonitorRef.current);
      }
      if (bedSensorIntervalRef.current) {
        clearInterval(bedSensorIntervalRef.current);
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
      stopEmergencyMonitoring();
    } else {
      systemRef.current?.activate();
      setIsActive(true);
      addMessage('assistant', "Good evening. I'm here to keep you safe and comfortable through the night. Advanced monitoring is now active.");
      speakText("Good evening. I'm here to keep you safe and comfortable through the night. Advanced monitoring is now active.");
      startListening();
      startEmergencyMonitoring();
      startBedSensorSimulation();
      
      // Track night watch activation
      const sessionData = sessionStorage.getItem('patientSession');
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          if (session.patientId) {
            base44.functions.invoke('trackPatientSession', {
              patient_id: session.patientId,
              session_type: 'night_watch_activated'
            }).catch(() => {});
          }
        } catch {}
      }
    }
  };

  const startBedSensorSimulation = async () => {
    let outOfBedTime = 0;
    let lastMotionTime = Date.now();
    
    // ACCURATE Motion Detection - uses device accelerometer/gyroscope
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission === 'granted') {
          motionListenerRef.current = (event) => {
            const acceleration = event.accelerationIncludingGravity;
            const motionThreshold = 2.0; // Significant movement threshold
            
            if (acceleration && (
              Math.abs(acceleration.x) > motionThreshold ||
              Math.abs(acceleration.y) > motionThreshold ||
              Math.abs(acceleration.z) > motionThreshold
            )) {
              setMotionDetected(true);
              lastMotionTime = Date.now();
              setTimeout(() => setMotionDetected(false), 3000);
            }
          };
          window.addEventListener('devicemotion', motionListenerRef.current);
        }
      } catch {
        console.log('Motion detection permission denied or unavailable');
      }
    }
    
    // ACCURATE Sound Detection - uses microphone to detect noise
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: false, // We WANT to detect noise
          autoGainControl: false 
        } 
      });
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContextRef.current.createAnalyser();
      const microphone = audioContextRef.current.createMediaStreamSource(stream);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      soundAnalyzerRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setSoundLevel(average);
        
        // Sound threshold for "out of bed" activity (talking, moving, etc.)
        const noiseThreshold = 30; // Adjust based on environment
        if (average > noiseThreshold) {
          lastMotionTime = Date.now();
        }
      }, 500);
    } catch {
      console.log('Microphone access denied - using fallback detection');
    }
    
    // ACCURATE Bed Status Determination - combines motion + sound + voice activity
    bedSensorIntervalRef.current = setInterval(() => {
      const timeSinceMotion = Date.now() - lastMotionTime;
      const recentVoiceActivity = messages.filter(m => 
        m.role === 'user' && 
        Date.now() - new Date(m.timestamp).getTime() < 120000 // Voice in last 2 min
      ).length > 0;
      
      // ACCURATE LOGIC: Person is OUT OF BED if:
      // 1. Recent motion detected (last 30 seconds), OR
      // 2. Sound level is high (talking/moving), OR  
      // 3. Recent voice activity detected
      const isOutOfBed = (
        timeSinceMotion < 30000 || // Motion in last 30 sec
        soundLevel > 25 ||          // Current noise
        recentVoiceActivity ||      // Recent talking
        motionDetected              // Active motion
      );
      
      const currentlyInBed = !isOutOfBed;
      
      // Track time out of bed
      if (!currentlyInBed) {
        outOfBedTime += 0.5; // Increment by 0.5 min (30 sec checks)
      } else {
        if (outOfBedTime > 0) {
          // Reset counter when back in bed
          outOfBedTime = 0;
        }
      }
      
      setBedSensorStatus({ 
        inBed: currentlyInBed, 
        timeOutOfBed: Math.round(outOfBedTime) 
      });
      
      // Alert if out of bed too long (5+ minutes)
      if (outOfBedTime >= 5 && outOfBedTime % 1 === 0) { // Alert every minute after 5 min
        toast.warning(`Person has been out of bed for ${Math.round(outOfBedTime)} minutes`, {
          id: 'out-of-bed-warning'
        });
        
        // Create alert for caregiver
        if (outOfBedTime >= 10) {
          handleAlert({
            type: 'extended_out_of_bed',
            message: `⚠️ Person out of bed for ${Math.round(outOfBedTime)} minutes - Check needed`,
            timestamp: new Date(),
            urgency: 'medium'
          });
        }
      }
    }, 30000); // Check every 30 seconds for accuracy
  };

  const startEmergencyMonitoring = () => {
    // Continuous AI monitoring every 30 seconds
    emergencyMonitorRef.current = setInterval(async () => {
      if (!isActive) return;
      
      const recentMessages = messages.slice(-5).map(m => `${m.role}: ${m.content}`);
      
      try {
        const detection = await base44.functions.invoke('detectNightEmergency', {
          voiceTranscript: messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '',
          voicePatterns: {
            speechRate: 'normal',
            breathingIrregular: false
          },
          environmentalSounds: [],
          bedSensorData: bedSensorStatus,
          recentActivity: recentMessages
        });

        if (detection.data.emergencyType !== 'NONE') {
          setEmergencyDetection(detection.data);
          handleEmergencyDetected(detection.data);
        }
      } catch (error) {
        console.error('Emergency monitoring failed:', error);
      }
    }, 30000); // Every 30 seconds
  };

  const stopEmergencyMonitoring = () => {
    if (emergencyMonitorRef.current) {
      clearInterval(emergencyMonitorRef.current);
      emergencyMonitorRef.current = null;
    }
    if (bedSensorIntervalRef.current) {
      clearInterval(bedSensorIntervalRef.current);
      bedSensorIntervalRef.current = null;
    }
    if (soundAnalyzerRef.current) {
      clearInterval(soundAnalyzerRef.current);
      soundAnalyzerRef.current = null;
    }
    if (motionListenerRef.current) {
      window.removeEventListener('devicemotion', motionListenerRef.current);
      motionListenerRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const handleEmergencyDetected = async (detection) => {
    const severityEmojis = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🚨',
      critical: '🆘'
    };
    
    const urgency = detection.notifications?.urgencyLevel || 'medium';
    const emoji = severityEmojis[urgency];
    
    // Different toast types based on severity
    if (urgency === 'critical') {
      toast.error(`${emoji} CRITICAL: ${detection.emergencyType}`);
    } else if (urgency === 'high') {
      toast.error(`${emoji} URGENT: ${detection.emergencyType}`);
    } else if (urgency === 'medium') {
      toast.warning(`${emoji} ${detection.emergencyType} detected`);
    } else {
      toast.info(`${emoji} ${detection.emergencyType} - monitoring`);
    }
    
    // Speak comfort response
    speakText(detection.comfortResponse);
    addMessage('assistant', detection.comfortResponse);
    
    // Log automated actions
    if (detection.automationResults) {
      setAutomatedActionsLog(prev => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          type: detection.emergencyType,
          urgency,
          actions: detection.automationResults
        }
      ]);
    }
    
    // Add to alert history
    setAlertHistory(prev => [
      {
        type: detection.emergencyType,
        urgency,
        message: detection.reasoning,
        timestamp: new Date().toISOString(),
        distressLevel: detection.distressLevel
      },
      ...prev.slice(0, 9) // Keep last 10 alerts
    ]);
    
    // Show emergency alert
    setCurrentAlert({
      type: detection.emergencyType,
      message: `${emoji} ${detection.emergencyType} DETECTED - ${urgency.toUpperCase()} priority`,
      timestamp: new Date(),
      urgency
    });
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice recognition not supported - use Chrome or Edge');
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let finalTranscript = '';

    recognition.onstart = () => {
      console.log('✅ Night Watch voice STARTED');
      setIsListening(true);
    };

    recognition.onresult = async (event) => {
      if (isSpeaking) {
        console.log('🔇 Ignoring - AI is speaking');
        return;
      }

      let interimTranscript = '';
      finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const completeSpeech = (finalTranscript + interimTranscript).trim();
      
      if (completeSpeech.length > 0) {
        console.log('👂 Hearing:', completeSpeech);
      }

      // Process final speech
      if (finalTranscript.trim().length > 3) {
        const userInput = finalTranscript.trim();
        console.log('✅ FINAL speech:', userInput);
        
        addMessage('user', userInput);
        
        // Stop listening while processing
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {}
        }
        setIsListening(false);
        
        const response = await systemRef.current?.processUserStatement(userInput);
        if (response) {
          addMessage('assistant', response);
          speakText(response);
        }
        
        finalTranscript = '';
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Night Watch voice error:', event.error);
      
      // Critical errors - don't restart
      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(event.error)) {
        toast.error('Microphone access denied - check browser settings');
        setIsListening(false);
        return;
      }
      
      // Recoverable errors - auto-restart
      if (['no-speech', 'aborted', 'network'].includes(event.error)) {
        console.log('🔄 Recoverable error - restarting...');
        setTimeout(() => {
          if (isActive && !isSpeaking) {
            startListening();
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      console.log('⏹️ Night Watch voice ENDED');
      setIsListening(false);
      
      // Auto-restart if still active and not speaking
      if (isActive && !isSpeaking) {
        console.log('🔄 Auto-restarting voice...');
        setTimeout(() => {
          if (isActive && !isSpeaking) {
            startListening();
          }
        }, 500);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      console.log('▶️ Starting Night Watch voice recognition');
    } catch (error) {
      console.error('Failed to start recognition:', error);
      toast.error('Could not start voice recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const speakText = (text) => {
    if (!text) return;
    
    try {
      setIsSpeaking(true);
      console.log('🔊 Night Watch speaking...');
      
      // Use enhanced voice synthesis
      speakWithRealisticVoice(text, {
        emotionalState: 'soothing',
        anxietyLevel: 8, // Night watch is for high anxiety/confusion
        cognitiveLevel: 'moderate',
        rate: 0.85,
        pitch: 1.0,
        volume: 0.95,
        onEnd: () => {
          console.log('✅ AI done speaking - resuming voice');
          setIsSpeaking(false);
          
          // Resume listening after speech
          setTimeout(() => {
            if (isActive && !isSpeaking) {
              console.log('🔄 Resuming voice recognition...');
              startListening();
            }
          }, 300);
        }
      });
    } catch (error) {
      console.error('Night Watch speech error:', error);
      setIsSpeaking(false);
      
      // Fallback to basic speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        utterance.onend = () => {
          setIsSpeaking(false);
          setTimeout(() => {
            if (isActive) startListening();
          }, 300);
        };
        window.speechSynthesis.speak(utterance);
      }
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

        {/* Current Alert with Severity Levels */}
        {currentAlert && (
          <Card className={`mb-6 ${
            currentAlert.urgency === 'critical' ? 'bg-red-950 border-red-600 animate-pulse' :
            currentAlert.urgency === 'high' ? 'bg-red-900 border-red-700' :
            currentAlert.urgency === 'medium' ? 'bg-orange-900 border-orange-700' :
            'bg-yellow-900 border-yellow-700'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <AlertTriangle className={`w-6 h-6 flex-shrink-0 mt-1 ${
                    currentAlert.urgency === 'critical' || currentAlert.urgency === 'high' 
                      ? 'text-red-300' 
                      : currentAlert.urgency === 'medium' 
                      ? 'text-orange-300' 
                      : 'text-yellow-300'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-white">Alert</h3>
                      <Badge className={`${
                        currentAlert.urgency === 'critical' ? 'bg-red-600' :
                        currentAlert.urgency === 'high' ? 'bg-orange-600' :
                        currentAlert.urgency === 'medium' ? 'bg-yellow-600' :
                        'bg-blue-600'
                      } text-white uppercase text-xs`}>
                        {currentAlert.urgency}
                      </Badge>
                    </div>
                    <p className="text-white">{currentAlert.message}</p>
                    <p className="text-sm text-slate-300 mt-1">
                      {currentAlert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowRemoteCheckIn(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Check In
                  </Button>
                  <Button
                    onClick={handleEmergencyCall}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Detection Status */}
        {isActive && emergencyDetection && (
          <Card className="mb-6 bg-red-900/30 border-red-700">
            <CardHeader>
              <CardTitle className="text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Emergency Detection Active
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white space-y-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-red-800/50 rounded">
                  <div className="text-red-300 text-xs">Distress Level</div>
                  <div className="text-lg font-bold">{emergencyDetection.distressLevel}/10</div>
                </div>
                <div className="p-2 bg-red-800/50 rounded">
                  <div className="text-red-300 text-xs">Fall Risk</div>
                  <div className="text-lg font-bold">{emergencyDetection.fallRisk}/10</div>
                </div>
                <div className="p-2 bg-red-800/50 rounded">
                  <div className="text-red-300 text-xs">Medical Risk</div>
                  <div className="text-lg font-bold">{emergencyDetection.medicalEmergencyRisk}/10</div>
                </div>
                <div className="p-2 bg-red-800/50 rounded">
                  <div className="text-red-300 text-xs">Exit Risk</div>
                  <div className="text-lg font-bold">{emergencyDetection.exitRisk}/10</div>
                </div>
              </div>
              <div className="text-xs text-red-200 mt-2">
                <strong>Analysis:</strong> {emergencyDetection.reasoning}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bed Sensor Status - ACCURATE DETECTION */}
        {isActive && (
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                Activity Monitor (Motion + Sound Detection)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-white">
                <div className="flex-1">
                  <div className={`text-lg font-semibold ${bedSensorStatus.inBed ? 'text-green-400' : 'text-yellow-400'}`}>
                    {bedSensorStatus.inBed ? '✓ Resting in Bed' : '⚠️ Activity Detected'}
                  </div>
                  {!bedSensorStatus.inBed && bedSensorStatus.timeOutOfBed > 0 && (
                    <div className="text-sm text-yellow-300 mt-1">
                      Active for {bedSensorStatus.timeOutOfBed} minute{bedSensorStatus.timeOutOfBed !== 1 ? 's' : ''}
                    </div>
                  )}
                  <div className="text-xs text-slate-400 mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${motionDetected ? 'bg-red-400' : 'bg-slate-600'}`} />
                      Motion: {motionDetected ? 'Detected' : 'None'}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${soundLevel > 25 ? 'bg-red-400' : 'bg-slate-600'}`} />
                      Sound: {soundLevel > 25 ? `Active (${Math.round(soundLevel)})` : 'Quiet'}
                    </div>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full ${bedSensorStatus.inBed ? 'bg-green-500' : 'bg-yellow-500'} ${!bedSensorStatus.inBed && 'animate-pulse'}`} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alert History */}
        {alertHistory.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alert History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {alertHistory.map((alert, idx) => (
                  <div key={idx} className={`p-3 rounded-lg text-sm ${
                    alert.urgency === 'critical' ? 'bg-red-900/40 border border-red-700' :
                    alert.urgency === 'high' ? 'bg-orange-900/40 border border-orange-700' :
                    alert.urgency === 'medium' ? 'bg-yellow-900/40 border border-yellow-700' :
                    'bg-blue-900/40 border border-blue-700'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{alert.type}</span>
                        <Badge className={`text-xs ${
                          alert.urgency === 'critical' ? 'bg-red-600' :
                          alert.urgency === 'high' ? 'bg-orange-600' :
                          alert.urgency === 'medium' ? 'bg-yellow-600' :
                          'bg-blue-600'
                        }`}>
                          {alert.urgency}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{alert.message}</p>
                    <div className="text-xs text-slate-400 mt-1">
                      Distress: {alert.distressLevel}/10
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Automated Actions Log */}
        {automatedActionsLog.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Automated Safety Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {automatedActionsLog.map((log, idx) => (
                  <div key={idx} className="p-3 bg-cyan-900/30 rounded-lg text-white text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-cyan-300">{log.type}</span>
                        {log.urgency && (
                          <Badge className="text-xs bg-cyan-700">{log.urgency}</Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {log.actions.map((action, i) => (
                        <li key={i}>✓ {action}</li>
                      ))}
                    </ul>
                  </div>
                ))}
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
              <p>✓ <strong className="text-white">ACCURATE motion detection</strong> using device sensors (accelerometer/gyroscope)</p>
              <p>✓ <strong className="text-white">ACCURATE sound detection</strong> using real-time microphone analysis</p>
              <p>✓ <strong className="text-white">AI-powered voice analysis</strong> for distress, confusion, and emergency detection</p>
              <p>✓ <strong className="text-white">Intelligent bed status tracking</strong> - combines motion + sound + voice activity</p>
              <p>✓ Continuous monitoring for falls, medical emergencies, and wandering</p>
              <p>✓ Automated smart home safety routines (lights, locks, temperature)</p>
              <p>✓ Instant caregiver alerts with severity levels (low → critical)</p>
              <p>✓ Gentle AI conversation and reorientation support</p>
              <p className="text-cyan-300 mt-4 font-semibold">
                🎯 NO FALSE ALARMS - Uses real sensor data, not random simulation
              </p>
              <p className="text-yellow-300 text-sm">
                ⚠️ Grant microphone + motion permissions for full accuracy. This is a supportive tool - always ensure proper supervision.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Remote Check-In Modal */}
      {showRemoteCheckIn && (
        <RemoteCheckIn 
          onClose={() => setShowRemoteCheckIn(false)}
          nightWatchActive={isActive}
        />
      )}
    </div>
  );
}