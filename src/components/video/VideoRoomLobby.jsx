import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Copy, Link, Users, Plus, Phone, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import VideoRoom from './VideoRoom';

export default function VideoRoomLobby() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState(null); // 'create' | 'join' | 'active'
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [recentCalls, setRecentCalls] = useState([]);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u) {
        setUser(u);
        loadRecentCalls(u.email);
      }
    }).catch(() => {});
  }, []);

  async function loadRecentCalls(email) {
    try {
      const calls = await base44.entities.VideoCall.filter(
        { initiated_by_email: email },
        '-started_at',
        5
      );
      setRecentCalls(calls.filter(c => c.call_status !== 'cancelled'));
    } catch (_) {}
  }

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('createVideoRoom', {
        roomName: `${user?.full_name || 'My'} Room`
      });
      const data = res.data;
      setRoomId(data.roomId);
      setActiveRoom(data);
      setMode('active');
    } catch (e) {
      toast.error('Could not create room. Please try again.');
    }
    setLoading(false);
  }

  async function handleJoin() {
    if (!joinRoomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }
    setLoading(true);
    try {
      // Find the room
      const rooms = await base44.entities.VideoCall.filter({ room_id: joinRoomId.trim() });
      if (rooms.length === 0) {
        toast.error('Room not found. Check the room ID and try again.');
        setLoading(false);
        return;
      }
      const room = rooms[0];
      if (room.call_status === 'cancelled') {
        toast.error('This call has ended.');
        setLoading(false);
        return;
      }
      // Update participants
      const participants = Array.isArray(room.participants) ? room.participants : [];
      if (!participants.includes(user?.email)) {
        await base44.entities.VideoCall.update(room.id, {
          participants: [...participants, user?.email],
          call_status: 'active',
        });
      }
      setActiveRoom({
        roomId: room.room_id,
        roomName: `${room.initiated_by_name}'s Room`,
        hostEmail: room.initiated_by_email,
        hostName: room.initiated_by_name,
        sessionId: room.id,
        isGuest: true,
      });
      setMode('active');
    } catch (e) {
      toast.error('Failed to join room. Please try again.');
    }
    setLoading(false);
  }

  function copyRoomLink() {
    const link = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast.success('Room link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Auto-join from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && user) {
      setJoinRoomId(roomParam);
    }
  }, [user]);

  if (mode === 'active' && activeRoom) {
    return (
      <VideoRoom
        roomId={activeRoom.roomId}
        roomName={activeRoom.roomName}
        userEmail={user?.email || 'guest'}
        userName={user?.full_name || user?.email || 'Guest'}
        isHost={!activeRoom.isGuest}
        sessionId={activeRoom.sessionId}
        onLeave={() => {
          setMode(null);
          setActiveRoom(null);
          setRoomId('');
          if (user) loadRecentCalls(user.email);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Create or Join */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Create Room */}
        <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer" onClick={() => !loading && handleCreate()}>
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              <Plus className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Start a Call</h3>
              <p className="text-slate-500 text-sm mt-1">Create a new room and invite your family or caregiver</p>
            </div>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={(e) => { e.stopPropagation(); handleCreate(); }}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Video className="w-4 h-4 mr-2" />}
              Create Room
            </Button>
          </CardContent>
        </Card>

        {/* Join Room */}
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Phone className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Join a Call</h3>
              <p className="text-slate-500 text-sm mt-1">Enter a room ID shared by your family member</p>
            </div>
            <div className="w-full flex gap-2">
              <Input
                placeholder="Room ID or paste link..."
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                className="flex-1"
              />
              <Button
                onClick={handleJoin}
                disabled={loading || !joinRoomId.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room created - show share link */}
      {roomId && mode !== 'active' && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-green-800 dark:text-green-300">Room Created!</p>
                <p className="text-sm text-green-700 dark:text-green-400 truncate">Room ID: <span className="font-mono font-bold">{roomId}</span></p>
              </div>
              <Button size="sm" variant="outline" onClick={copyRoomLink} className="flex-shrink-0 border-green-400">
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                <span className="ml-1 hidden sm:inline">{copied ? 'Copied!' : 'Copy Link'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Calls */}
      {recentCalls.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Recent Calls
          </h3>
          <div className="space-y-2">
            {recentCalls.map((call) => (
              <div key={call.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <Video className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{call.initiated_by_name || call.initiated_by_email}</p>
                    <p className="text-xs text-slate-400">{new Date(call.started_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge variant="outline" className={
                  call.call_status === 'active' ? 'border-green-400 text-green-600' :
                  call.call_status === 'completed' ? 'border-slate-300 text-slate-500' :
                  'border-yellow-400 text-yellow-600'
                }>
                  {call.call_status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Link className="w-3 h-3" /> Share via link</span>
        <span>•</span>
        <span>HD video & audio</span>
        <span>•</span>
        <span>Screen sharing</span>
        <span>•</span>
        <span>End-to-end encrypted</span>
      </div>
    </div>
  );
}