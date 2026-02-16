import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, era, source = 'youtube' } = await req.json();

    if (!query) {
      return Response.json({ error: 'Query required' }, { status: 400 });
    }

    let results = [];

    // YouTube Music Search
    if (source === 'youtube' || source === 'both') {
      const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
      if (youtubeApiKey) {
        const searchQuery = era ? `${query} ${era}` : query;
        const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoCategoryId=10&maxResults=10&key=${youtubeApiKey}`;
        
        const youtubeResponse = await fetch(youtubeUrl);
        const youtubeData = await youtubeResponse.json();

        if (youtubeData.items) {
          results = youtubeData.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.medium.url,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            source: 'youtube'
          }));
        }
      }
    }

    // Spotify Search
    if ((source === 'spotify' || source === 'both') && results.length < 5) {
      const spotifyClientId = Deno.env.get('SPOTIFY_CLIENT_ID');
      const spotifyClientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

      if (spotifyClientId && spotifyClientSecret) {
        // Get Spotify access token
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${spotifyClientId}:${spotifyClientSecret}`)
          },
          body: 'grant_type=client_credentials'
        });

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Search Spotify
        const searchQuery = era ? `${query} year:${getEraYearRange(era)}` : query;
        const spotifyUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=10`;
        
        const spotifyResponse = await fetch(spotifyUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const spotifyData = await spotifyResponse.json();

        if (spotifyData.tracks?.items) {
          const spotifyResults = spotifyData.tracks.items.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            thumbnail: track.album.images[0]?.url,
            url: track.external_urls.spotify,
            previewUrl: track.preview_url,
            source: 'spotify'
          }));
          results = [...results, ...spotifyResults];
        }
      }
    }

    // If no API keys, return message
    if (results.length === 0) {
      return Response.json({
        results: [],
        message: 'Music search requires API keys. Please configure YOUTUBE_API_KEY or SPOTIFY credentials in environment variables.'
      });
    }

    return Response.json({ results });

  } catch (error) {
    console.error('Music search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getEraYearRange(era) {
  const ranges = {
    '1940s': '1940-1949',
    '1960s': '1960-1969',
    '1980s': '1980-1989',
    'present': '2010-2026'
  };
  return ranges[era] || '';
}