import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { conversation_context, detected_emotion, detected_era, anxiety_level, conversation_topics } = body;

    // Fetch available media and memories
    const [familyMedia, memories, userProfile] = await Promise.all([
      base44.entities.FamilyMedia.list('-created_date', 100),
      base44.entities.Memory.list('-created_date', 100),
      base44.entities.UserProfile.list().then(profiles => profiles[0])
    ]);

    // Score and rank media based on context
    const scoredMedia = [];

    // Score family photos/videos
    familyMedia.forEach(media => {
      let score = 0;

      // Match by era
      if (media.era && detected_era) {
        if (media.era === detected_era) score += 30;
        if (media.era !== 'unknown') score += 10;
      }

      // Match by emotional content
      if (detected_emotion === 'anxious' || anxiety_level >= 7) {
        // Prefer calming, positive media
        score += 20;
      } else if (detected_emotion === 'happy' || detected_emotion === 'engaged') {
        // Prefer engaging, fun media
        score += 25;
      }

      // Match by people in media
      if (media.people_in_media?.length > 0 && userProfile?.important_people) {
        const matches = media.people_in_media.filter(p =>
          userProfile.important_people.some(ip => ip.name.toLowerCase().includes(p.toLowerCase()))
        );
        score += matches.length * 20;
      }

      // Match by conversation topics
      if (conversation_topics && conversation_topics.length > 0) {
        const titleLower = media.title.toLowerCase();
        const topicMatches = conversation_topics.filter(topic =>
          titleLower.includes(topic.toLowerCase())
        );
        score += topicMatches.length * 15;
      }

      // Prefer more recent media
      score += Math.max(0, 10 - Math.floor((Date.now() - new Date(media.created_date).getTime()) / (1000 * 60 * 60 * 24 * 30)));

      if (score > 0) {
        scoredMedia.push({ ...media, score, type: 'family_media' });
      }
    });

    // Score memories
    memories.forEach(memory => {
      let score = 0;

      // Match by era
      if (memory.era && detected_era) {
        if (memory.era === detected_era) score += 25;
        if (memory.era !== 'present') score += 8;
      }

      // Match by emotional tone
      const emotionalToneMatch = {
        'joyful': ['happy', 'engaged', 'peaceful'],
        'peaceful': ['calm', 'content'],
        'proud': ['engaged', 'reminiscing'],
        'loving': ['happy', 'content', 'peaceful'],
        'nostalgic': ['reminiscing', 'content']
      };

      if (memory.emotional_tone && emotionalToneMatch[memory.emotional_tone]) {
        if (emotionalToneMatch[memory.emotional_tone].includes(detected_emotion)) {
          score += 20;
        }
      }

      // Match by people involved
      if (memory.people_involved?.length > 0 && userProfile?.important_people) {
        const matches = memory.people_involved.filter(p =>
          userProfile.important_people.some(ip => ip.name.toLowerCase().includes(p.toLowerCase()))
        );
        score += matches.length * 15;
      }

      // Match by conversation topics
      if (conversation_topics && conversation_topics.length > 0) {
        const contentLower = (memory.title + ' ' + memory.description).toLowerCase();
        const topicMatches = conversation_topics.filter(topic =>
          contentLower.includes(topic.toLowerCase())
        );
        score += topicMatches.length * 12;
      }

      // Anxiety mitigation - suggest comforting memories
      if (anxiety_level >= 6) {
        if (['peaceful', 'loving', 'joyful'].includes(memory.emotional_tone)) {
          score += 25;
        }
      }

      if (score > 0) {
        scoredMedia.push({ ...memory, score, type: 'memory', image_url: memory.image_url });
      }
    });

    // Sort by score and return top suggestions
    const topSuggestions = scoredMedia
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => {
        const isMemory = item.type === 'memory';
        return {
          id: item.id,
          type: item.type,
          title: item.title,
          caption: isMemory ? item.description.substring(0, 100) : item.caption,
          media_url: item.media_url || item.image_url,
          media_type: item.media_type || 'photo',
          emotional_context: item.emotional_tone || item.mood,
          score: item.score
        };
      });

    // Decide whether to show visuals
    const shouldShowVisuals = topSuggestions.length > 0 && (
      // Always show for certain emotional states
      anxiety_level >= 5 ||
      detected_emotion === 'anxious' ||
      detected_emotion === 'happy' ||
      // Show if strong topic match
      topSuggestions[0]?.score >= 35
    );

    return Response.json({
      should_show_visuals: shouldShowVisuals,
      suggestions: shouldShowVisuals ? topSuggestions : [],
      reasoning: {
        emotion: detected_emotion,
        anxiety_level: anxiety_level,
        era: detected_era,
        topics: conversation_topics?.slice(0, 3)
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});