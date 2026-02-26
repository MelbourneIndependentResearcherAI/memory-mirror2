import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversation_id, participants } = await req.json();

    if (!conversation_id || !participants || !Array.isArray(participants)) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Generate unique room ID
    const roomId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate access token (simplified - in production, use proper JWT)
    const accessToken = btoa(JSON.stringify({
      room: roomId,
      user: user.email,
      timestamp: Date.now(),
      exp: Date.now() + 3600000, // 1 hour
    }));

    // Create video call record
    const videoCall = await base44.asServiceRole.entities.VideoCall.create({
      conversation_id,
      initiated_by_email: user.email,
      initiated_by_name: user.full_name,
      participants,
      call_status: 'pending',
      room_id: roomId,
      access_token: accessToken,
      call_type: participants.length === 1 ? 'one_to_one' : 'group',
      encrypted: true,
    });

    // Create system message in conversation
    await base44.asServiceRole.entities.SecureMessage.create({
      conversation_id,
      sender_email: 'system@videocall',
      sender_name: 'System',
      sender_role: 'admin',
      content: `📞 ${user.full_name} initiated a video call`,
      message_type: 'alert',
    });

    return Response.json({
      success: true,
      callId: videoCall.id,
      roomId,
      accessToken,
      callData: videoCall,
    });
  } catch (error) {
    console.error('Video call initiation error:', error);
    return Response.json(
      { error: 'Failed to initiate video call', details: error.message },
      { status: 500 }
    );
  }
});