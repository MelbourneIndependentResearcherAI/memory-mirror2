// Pre-load and cache all essential data for 100% offline functionality
import { base44 } from '@/api/base44Client';
import { saveToStore, STORES, initOfflineStorage } from './offlineStorage';
import { isOnline } from './offlineManager';

// Essential offline responses for dementia care
const ESSENTIAL_RESPONSES = [
  {
    prompt: "scared, afraid, worried, anxious, nervous",
    response: "I understand you're feeling worried right now. You're safe here, and everything is going to be alright. You're in your home, and people who care about you are nearby. Would you like to look at some happy memories together, or perhaps listen to some calming music?",
    category: "anxiety"
  },
  {
    prompt: "what time is it, what day is it, when is it, what date",
    response: `Right now it's ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} on ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}. Everything is just fine. Is there anything I can help you with?`,
    category: "orientation"
  },
  {
    prompt: "where am i, where is this, what is this place",
    response: "You're in your home, where you're safe and comfortable. This is your familiar place where you've spent so much time. Everything here is just as it should be.",
    category: "orientation"
  },
  {
    prompt: "who are you, what is this, who am i talking to",
    response: "I'm Memory Mirror, your friendly AI companion. I'm here to chat with you, share memories, play music, and keep you company anytime you need me. Think of me as a friend who's always here to listen.",
    category: "identity"
  },
  {
    prompt: "family, daughter, son, children, grandchildren, wife, husband",
    response: "Your family loves you very much and they think about you often. They'll be here to see you soon. Would you like me to show you some photos of them, or shall we talk about happy memories you have together?",
    category: "family"
  },
  {
    prompt: "lonely, alone, sad, miss",
    response: "You're not alone - I'm right here with you, and I'm happy to keep you company. Your loved ones care about you deeply. Would you like to chat, listen to some of your favorite music, or look at happy memories together?",
    category: "comfort"
  },
  {
    prompt: "pain, hurt, sick, unwell, doctor",
    response: "I'm sorry you're not feeling well. It's important we let someone know. I'll alert your caregiver right away. In the meantime, try to relax and breathe slowly. You're going to be okay.",
    category: "medical"
  },
  {
    prompt: "bathroom, toilet, restroom",
    response: "Of course! The bathroom is nearby - let me help remind you where it is. If you need assistance, your caregiver can help you. Take your time, there's no rush.",
    category: "assistance"
  },
  {
    prompt: "hungry, thirsty, eat, drink, food, water",
    response: "Would you like something to eat or drink? I can let your caregiver know. What sounds good to you right now?",
    category: "needs"
  },
  {
    prompt: "music, song, sing, play music",
    response: "I'd love to play some music for you! What kind of music would you enjoy? Perhaps something from the 1940s, 60s, or 80s? Or I can play something calming and peaceful.",
    category: "activity"
  },
  {
    prompt: "story, tell me, read",
    response: "I'd be happy to share a story with you! Would you like a peaceful nature story, a heartwarming family tale, or perhaps a memory from a special time in your life?",
    category: "activity"
  },
  {
    prompt: "hello, hi, hey, good morning, good afternoon, good evening",
    response: "Hello! It's wonderful to hear from you. I'm here and ready to chat, share memories, or just keep you company. How are you feeling today?",
    category: "greeting"
  }
];

export async function preloadEssentialData() {
  console.log('🚀 Starting essential data preload for offline mode...');
  
  await initOfflineStorage();
  
  const results = {
    aiResponses: 0,
    userProfile: 0,
    memories: 0,
    familyMedia: 0,
    playlists: 0,
    stories: 0,
    emergencyContacts: 0,
    errors: []
  };

  // 1. Cache essential AI responses
  try {
    for (const resp of ESSENTIAL_RESPONSES) {
      await saveToStore(STORES.aiResponses, {
        id: `offline_${resp.category}_${Date.now()}`,
        prompt: resp.prompt,
        response: resp.response,
        category: resp.category,
        timestamp: Date.now(),
        offline: true
      });
      results.aiResponses++;
    }
    console.log(`✅ Cached ${results.aiResponses} essential AI responses`);
  } catch (error) {
    results.errors.push(`AI responses: ${error.message}`);
  }

  // Only fetch from API if online
  if (!isOnline()) {
    console.log('⚠️ Offline - skipping API data fetch. Using cached data only.');
    return results;
  }

  // 2. Cache user profile
  try {
    const profiles = await base44.entities.UserProfile.list();
    for (const profile of profiles) {
      await saveToStore(STORES.userProfile, profile);
      results.userProfile++;
    }
    console.log(`✅ Cached ${results.userProfile} user profiles`);
  } catch (error) {
    results.errors.push(`User profiles: ${error.message}`);
  }

  // 3. Cache memories
  try {
    const memories = await base44.entities.Memory.list('-created_date', 100);
    for (const memory of memories) {
      await saveToStore(STORES.memories, memory);
      results.memories++;
    }
    console.log(`✅ Cached ${results.memories} memories`);
  } catch (error) {
    results.errors.push(`Memories: ${error.message}`);
  }

  // 4. Cache family media
  try {
    const media = await base44.entities.FamilyMedia.list('-created_date', 50);
    for (const item of media) {
      await saveToStore(STORES.familyMedia, item);
      results.familyMedia++;
    }
    console.log(`✅ Cached ${results.familyMedia} family media items`);
  } catch (error) {
    results.errors.push(`Family media: ${error.message}`);
  }

  // 5. Cache playlists
  try {
    const playlists = await base44.entities.Playlist.list();
    for (const playlist of playlists) {
      await saveToStore(STORES.playlists, playlist);
      results.playlists++;
    }
    console.log(`✅ Cached ${results.playlists} playlists`);
  } catch (error) {
    results.errors.push(`Playlists: ${error.message}`);
  }

  // 6. Cache stories
  try {
    const stories = await base44.entities.Story.list();
    for (const story of stories) {
      await saveToStore(STORES.stories, story);
      results.stories++;
    }
    console.log(`✅ Cached ${results.stories} stories`);
  } catch (error) {
    results.errors.push(`Stories: ${error.message}`);
  }

  // 7. Cache emergency contacts
  try {
    const contacts = await base44.entities.EmergencyContact.list();
    for (const contact of contacts) {
      await saveToStore(STORES.emergencyContacts, contact);
      results.emergencyContacts++;
    }
    console.log(`✅ Cached ${results.emergencyContacts} emergency contacts`);
  } catch (error) {
    results.errors.push(`Emergency contacts: ${error.message}`);
  }

  console.log('✅ Preload complete:', results);
  return results;
}

// Auto-preload on app start (only if online)
if (typeof window !== 'undefined') {
  // Preload after a short delay to not block initial render
  setTimeout(() => {
    if (isOnline()) {
      preloadEssentialData().catch(err => 
        console.log('Preload failed:', err.message)
      );
    }
  }, 2000);

  // Re-preload when coming back online
  window.addEventListener('online', () => {
    console.log('📶 Back online - refreshing offline cache...');
    setTimeout(() => preloadEssentialData(), 1000);
  });
}

export default preloadEssentialData;