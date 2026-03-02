/**
 * Cultural Safety Guidelines for AI interactions
 * 
 * These guidelines are based on principles from:
 * - AIATSIS Code of Ethics
 * - Australian Institute for Aboriginal and Torres Strait Islander Studies
 * - Dementia Australia's culturally safe care guidelines
 * 
 * IMPORTANT: Content suggestions here are general and broadly culturally respectful.
 * Specific content (stories, songs, language) should always be sourced from and
 * approved by the relevant local community, Country, and Elders.
 */

export const CULTURAL_BACKGROUNDS = [
  {
    id: 'aboriginal',
    label: 'Aboriginal Australian',
    emoji: '🌏',
    desc: 'Including specific Country, language group or mob if known',
  },
  {
    id: 'torres_strait_islander',
    label: 'Torres Strait Islander',
    emoji: '🌊',
    desc: 'Including island community if known',
  },
  {
    id: 'both',
    label: 'Aboriginal and Torres Strait Islander',
    emoji: '🤝',
    desc: 'Both heritages',
  },
  {
    id: 'non_indigenous',
    label: 'Non-Indigenous Australian',
    emoji: '🇦🇺',
    desc: '',
  },
  {
    id: 'prefer_not_to_say',
    label: 'Prefer not to say',
    emoji: '🔒',
    desc: '',
  },
];

export const isIndigenousBackground = (bg) =>
  ['aboriginal', 'torres_strait_islander', 'both'].includes(bg);

/**
 * Returns culturally appropriate system prompt additions for AI chat.
 * These are safe, respectful, general principles — not specific cultural claims.
 */
export const getCulturalAIContext = (culturalBackground, countryOrMob = '') => {
  if (!isIndigenousBackground(culturalBackground)) return '';

  const mobContext = countryOrMob ? `Their family's Country or mob is: ${countryOrMob}. ` : '';

  return `
CULTURAL CONTEXT — ABORIGINAL AND/OR TORRES STRAIT ISLANDER PERSON:
${mobContext}
CULTURAL SAFETY PRINCIPLES (follow strictly):
- Show deep respect for connection to Country, family, community and spirituality
- Use the term "Mob" naturally when referring to family/community if appropriate
- Acknowledge that family and community are central — conversations about kin, Country, and belonging are deeply comforting
- Do NOT make assumptions about specific beliefs, practices, or language — ask gently if unsure
- If the person mentions specific Country, Elders, or community — honour and engage with those references with respect
- Avoid discussing deceased family members unless the person raises it — be sensitive to cultural protocols around passing
- Nature, land, animals, seasons, and weather are often deeply meaningful conversation topics
- Music, stories, and art connected to their culture can be profoundly comforting
- Always follow the person's lead — never impose cultural frameworks
- If in doubt, focus on warmth, family, Country, and the present moment
- Respond to any spiritual or ceremonial references with respect and openness

SAFE CONVERSATION STARTERS FOR THIS PERSON:
- Gently ask about their Country or where they grew up
- Ask about family members and mob
- Talk about the land, sky, weather, animals
- Ask about favourite foods, community gatherings, or music they love
- Reminisce about being out on Country if they mention it
`;
};

/**
 * Curated general music and story themes appropriate for
 * Aboriginal and Torres Strait Islander users with dementia.
 * Note: Always verify specific content is appropriate for the individual's community.
 */
export const INDIGENOUS_CONTENT_SUGGESTIONS = {
  music_themes: [
    'Classic Australian bush songs and folk music',
    'Yothu Yindi and contemporary Indigenous artists',
    'Archie Roach — healing and country themes',
    'Saltwater Band (Torres Strait)',
    'Frank Yamma — desert blues',
    'Christine Anu — Torres Strait Islander music',
    'Nature sounds — rain, wind, birds of their Country',
    'Gospel and hymns (if spiritually meaningful)',
    'Community and family celebration songs',
  ],
  story_themes: [
    'Stories about Country and the land',
    'Family gatherings and community memories',
    'Childhood memories of being out on Country',
    'Stories about animals — kangaroos, emus, birds',
    'Memories of rivers, sea, billabongs',
    'Community ceremonies and celebrations (appropriate to share)',
    'Memories of working on stations or in communities',
    'Stories of family members and Elders',
  ],
  conversation_starters: [
    'Tell me about where you grew up — what was the land like?',
    'What animals did you see around your Country?',
    'What do you love most about being outside?',
    'Who in your family makes you feel most at home?',
    'What songs remind you of happy times?',
    'Tell me about a beautiful place you remember.',
    'What did you love to eat when you were younger?',
    'What do the seasons feel like where you\'re from?',
  ],
  cultural_safety_reminders: [
    'Always check with family about what is appropriate to discuss',
    'Be aware of sorry business protocols if a family member has recently passed',
    'Some stories and songs may be sacred or gender-specific — follow the person\'s lead',
    'If using images, be mindful that images of deceased persons may cause distress',
    'Engage with local Aboriginal Community Controlled Health Organisations for guidance',
  ],
};