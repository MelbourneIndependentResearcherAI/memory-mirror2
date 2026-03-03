import React from 'react';
import { ArrowLeft, Video, Shield, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VideoRoomLobby from '@/components/video/VideoRoomLobby';

export default function FamilyVideoCallPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 p-4 md:p-6 pb-24">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">Video Calling</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm ml-13 pl-1">
            Connect face-to-face with your family and caregivers
          </p>
          <div className="flex gap-3 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-full">
              <Lock className="w-3 h-3" /> End-to-end encrypted
            </span>
            <span className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-full">
              <Shield className="w-3 h-3" /> HIPAA compliant
            </span>
          </div>
        </div>

        <VideoRoomLobby />
      </div>
    </div>
  );
}