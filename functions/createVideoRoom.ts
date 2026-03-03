import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Creates a video call room and returns a shareable room ID + join link
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { roomName } = body;

    // Generate a unique room ID
    const roomId = `mm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Store the room in VideoCall entity
    const room = await base44.asServiceRole.entities.VideoCall.create({
      conversation_id: roomId,
      initiated_by_email: user.email,
      initiated_by_name: user.full_name || user.email,
      participants: [user.email],
      call_status: 'pending',
      room_id: roomId,
      access_token: roomId, // used as the join key
      started_at: new Date().toISOString(),
      call_type: 'one_to_one',
      encrypted: true,
      call_recording_enabled: false,
    });

    return Response.json({
      roomId,
      roomName: roomName || `Call with ${user.full_name || user.email}`,
      hostEmail: user.email,
      hostName: user.full_name || user.email,
      sessionId: room.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});