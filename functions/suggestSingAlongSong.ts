import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mood = 'happy', era = 'timeless', theme = null } = await req.json();

    // Get all available sing-along songs
    const songs = await base44.entities.SingAlongSong.list();

    // Filter based on mood and era
    let filtered = songs.filter(s => 
      s.singalong_enabled && 
      (s.era === era || s.era === 'timeless')
    );

    // Sort by mood match
    const moodScores = {
      'happy': ['happy', 'energetic'],
      'calm': ['calm', 'soothing'],
      'sad': ['soothing', 'nostalgic'],
      'energetic': ['energetic', 'happy']
    };

    const targetMoods = moodScores[mood] || ['happy'];
    
    filtered.sort((a, b) => {
      const aScore = targetMoods.includes(a.mood) ? 1 : 0;
      const bScore = targetMoods.includes(b.mood) ? 1 : 0;
      return bScore - aScore;
    });

    if (filtered.length === 0) {
      // Fall back to any mood
      filtered = songs.filter(s => s.singalong_enabled);
    }

    // Pick a random song from top matches
    const suggested = filtered.length > 0 
      ? filtered[Math.floor(Math.random() * Math.min(3, filtered.length))]
      : null;

    return Response.json({
      suggested_song: suggested,
      available_count: songs.filter(s => s.singalong_enabled).length,
      recommendation: suggested 
        ? `How about singing "${suggested.title}"? It's a ${suggested.category.replace('_', ' ')} that's perfect for a ${mood} mood.`
        : 'Would you like to sing along to a song?'
    });
  } catch (error) {
    console.error('Suggest song error:', error);
    return Response.json({ 
      error: 'Failed to suggest song',
      details: error.message 
    }, { status: 500 });
  }
});