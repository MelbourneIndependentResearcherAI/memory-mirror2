import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Camera, CheckCircle, Home, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'react-hot-toast';

export default function SecurityReassurance() {
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  const securityStatus = {
    doors: 'All locked',
    windows: 'Secure',
    alarmSystem: 'Armed and active',
    cameras: '4 cameras monitoring',
    lastCheck: 'Just now'
  };

  const handleSecurityCheck = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a kind, reassuring security guard for an elderly person with dementia who is worried about their home security. 
        
Provide a warm, simple, and very reassuring message that:
- Confirms everything is completely safe and secure
- Mentions that all doors and windows are locked
- States that the security system is working perfectly
- Reminds them they are safe at home
- Uses simple, comforting language
- Is brief (2-3 sentences max)

Important: Be extremely reassuring and calm. This is for someone who may be anxious.`,
      });

      setAiResponse(response);
      
      // Speak the response
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);

      // Log reassurance activity
      await base44.entities.ActivityLog.create({
        activity_type: 'security_check',
        description: 'Patient requested security reassurance',
        mood_before: 'anxious',
        mood_after: 'reassured'
      });

    } catch (error) {
      console.error('Security check error:', error);
      const fallback = "Everything is perfectly safe. All your doors are locked, windows are secure, and the alarm system is protecting your home. You are completely safe.";
      setAiResponse(fallback);
      
      const utterance = new SpeechSynthesisUtterance(fallback);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } finally {
      setLoading(false);
    }
  };

  const goToHappyPlace = async () => {
    toast.success('Taking you to your happy memories...');
    
    try {
      // Redirect to photo album or happy memories
      window.location.href = '/MemoryGallery';
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
          <Shield className="w-10 h-10 text-green-600" />
          Home Security
        </h1>
        <p className="text-gray-600">Your home is safe and protected</p>
      </div>

      {/* Security Status Dashboard */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle className="w-6 h-6" />
            All Systems Secure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <Lock className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Doors</p>
                  <p className="font-bold text-gray-900">{securityStatus.doors}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Alarm</p>
                  <p className="font-bold text-gray-900">{securityStatus.alarmSystem}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <Camera className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Cameras</p>
                  <p className="font-bold text-gray-900">{securityStatus.cameras}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Windows</p>
                  <p className="font-bold text-gray-900">{securityStatus.windows}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-100 rounded-lg border border-green-300">
            <p className="text-green-900 font-semibold text-center">
              ✓ Last security check: {securityStatus.lastCheck}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Reassurance */}
      {aiResponse && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Shield className="w-6 h-6" />
              Security Guard Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-blue-900 leading-relaxed">
              {aiResponse}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={handleSecurityCheck}
          disabled={loading}
          size="lg"
          className="h-24 text-lg bg-green-600 hover:bg-green-700"
        >
          <Shield className="w-8 h-8 mr-3" />
          {loading ? 'Checking...' : 'Talk to Security Guard'}
        </Button>

        <Button
          onClick={goToHappyPlace}
          size="lg"
          variant="outline"
          className="h-24 text-lg border-2 border-blue-500 text-blue-700 hover:bg-blue-50"
        >
          <Heart className="w-8 h-8 mr-3" />
          Go to Happy Memories
        </Button>
      </div>

      {/* Comforting Message */}
      <Card className="bg-gradient-to-r from-purple-100 to-pink-100">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <Home className="w-16 h-16 text-purple-600 mx-auto" />
            <h3 className="text-2xl font-bold text-gray-900">You Are Safe at Home</h3>
            <p className="text-gray-700 text-lg">
              Everything is secure. Your home is protected. You can relax and feel safe.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}