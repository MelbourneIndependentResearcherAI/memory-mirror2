import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MUSIC_DATABASE = {
  '1940s': {
    big_band: [
      { title: 'Moonlight Serenade', artist: 'Glenn Miller', mood: ['peaceful', 'nostalgic', 'romantic'] },
      { title: 'In the Mood', artist: 'Glenn Miller', mood: ['energetic', 'uplifting'] },
      { title: 'String of Pearls', artist: 'Glenn Miller', mood: ['romantic', 'peaceful'] },
      { title: 'Sing Sing Sing', artist: 'Benny Goodman', mood: ['energetic', 'uplifting'] }
    ],
    jazz: [
      { title: 'Take Five', artist: 'Dave Brubeck', mood: ['peaceful', 'calming'] },
      { title: 'All Blues', artist: 'Miles Davis', mood: ['calm', 'nostalgic'] }
    ]
  },
  '1960s': {
    rock: [
      { title: 'Stand By Me', artist: 'Ben E. King', mood: ['uplifting', 'nostalgic'] },
      { title: 'Satisfaction', artist: 'The Rolling Stones', mood: ['energetic'] }
    ],
    pop: [
      { title: 'What A Wonderful World', artist: 'Louis Armstrong', mood: ['peaceful', 'uplifting'] },
      { title: 'Unchained Melody', artist: 'The Righteous Brothers', mood: ['romantic', 'peaceful'] }
    ],
    folk: [
      { title: 'Blowin in the Wind', artist: 'Bob Dylan', mood: ['uplifting', 'nostalgic'] }
    ]
  },
  '1980s': {
    pop: [
      { title: 'Billie Jean', artist: 'Michael Jackson', mood: ['energetic', 'uplifting'] },
      { title: 'Sweet Dreams', artist: 'Eurythmics', mood: ['nostalgic', 'calm'] }
    ],
    rock: [
      { title: 'Every Breath You Take', artist: 'The Police', mood: ['romantic', 'peaceful'] },
      { title: 'Don\'t Stop Believin', artist: 'Journey', mood: ['uplifting', 'energetic'] }
    ],
    disco: [
      { title: 'Stayin Alive', artist: 'Bee Gees', mood: ['energetic', 'uplifting'] }
    ]
  },
  'present': {
    classical: [
      { title: 'Peaceful Piano', artist: 'Relaxing Music', mood: ['peaceful', 'calming'] },
      { title: 'Morning Meditation', artist: 'Calm Sounds', mood: ['calming', 'peaceful'] }
    ],
    jazz: [
      { title: 'Soft Jazz', artist: 'Jazz Collection', mood: ['peaceful', 'romantic'] }
    ]
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, mood, genres, era } = await req.json();

    // Get music from appropriate eras
    let sources = [];
    if (era === 'mixed') {
      sources = ['1940s', '1960s', '1980s', 'present'];
    } else {
      sources = [era];
    }

    // Collect songs matching genres and mood
    const songs = [];
    for (const source of sources) {
      const eraMusic = MUSIC_DATABASE[source] || {};
      for (const genre of genres) {
        if (eraMusic[genre]) {
          const genreSongs = eraMusic[genre].filter(s => 
            s.mood.includes(mood)
          );
          songs.push(...genreSongs);
        }
      }
    }

    // If not enough mood-matched songs, add genre songs anyway
    if (songs.length < 5) {
      for (const source of sources) {
        const eraMusic = MUSIC_DATABASE[source] || {};
        for (const genre of genres) {
          if (eraMusic[genre]) {
            songs.push(...eraMusic[genre]);
          }
        }
      }
    }

    // Remove duplicates and shuffle
    const uniqueSongs = Array.from(new Map(songs.map(s => [s.title, s])).values());
    const shuffled = uniqueSongs.sort(() => Math.random() - 0.5).slice(0, 12);

    // Create playlist record
    const playlist = {
      name,
      description: `${mood.charAt(0).toUpperCase() + mood.slice(1)} playlist featuring ${genres.join(', ')} from the ${era} era(s)`,
      mood,
      era,
      song_ids: shuffled.map(s => `${s.artist}-${s.title}`.replace(/\s+/g, '-')),
      is_ai_generated: true,
      is_custom: false,
      created_by_name: 'AI Playlist Generator'
    };

    // Save to database
    await base44.asServiceRole.entities.Playlist.create(playlist);

    return Response.json({
      success: true,
      playlist: {
        ...playlist,
        songs: shuffled
      },
      summary: {
        total_songs: shuffled.length,
        genres: genres,
        era: era,
        mood: mood
      }
    });

  } catch (error) {
    console.error('Playlist generation error:', error);
    return Response.json({ 
      error: error.message,
      fallback: {
        name: 'Relaxing Collection',
        songs: []
      }
    }, { status: 500 });
  }
});