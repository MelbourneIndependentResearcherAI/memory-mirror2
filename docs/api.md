# Memory Mirror API Reference

The serverless functions in the `functions/` directory are deployed on [Base44](https://base44.com) as Deno edge functions.  Each function receives an HTTP POST request and returns a JSON response.

## Authentication

Unless stated otherwise every function requires a valid user session.  Requests without a session token receive:

```json
{ "error": "Unauthorized" }
```
HTTP status `401`.

Functions marked **service-role only** (e.g. caregiver reports) additionally check that the caller has admin privileges and return `403` when that check fails.

A small number of functions (`autoFixErrors`, `checkAlertConditions`, `generateMaintenanceReport`, `playScheduledPlaylist`, `triggerReminders`) do not perform an explicit auth check and are intended to be invoked by scheduled automations.

---

## Functions

### analyzeSentiment

Analyses the emotional state and sentiment of a piece of text, optimised for messages from people with dementia.

**Request**
```json
{ "text": "I want to go home, where is everyone?" }
```

| Field | Type   | Required | Description          |
|-------|--------|----------|----------------------|
| text  | string | yes      | Text to analyse      |

**Response**

An LLM-generated object containing:

| Field                    | Type   | Description |
|--------------------------|--------|-------------|
| sentiment                | string | `positive`, `negative`, `neutral`, or `mixed` |
| emotional_tone           | string | e.g. `anxious`, `calm`, `nostalgic` |
| anxiety_level            | number | 0–10 |
| detected_themes          | array  | e.g. `["confusion", "loneliness"]` |
| recommended_approach     | string | e.g. `validate`, `reassure` |
| trigger_words            | array  | Notable phrases detected |

---

### assessCognitiveLevel

Assesses the current cognitive level of a person based on recent conversation history, and compares the result against previous assessments for trend analysis.

**Request**
```json
{
  "conversation_history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "recent_interactions": []
}
```

| Field                  | Type  | Required | Description                       |
|------------------------|-------|----------|-----------------------------------|
| conversation_history   | array | yes      | Array of `{role, content}` objects |
| recent_interactions    | array | no       | Additional interaction records    |

**Response**
```json
{
  "cognitive_level": "mild",
  "indicators": [],
  "adaptations": [],
  "trend": "stable",
  "reasoning": "..."
}
```

---

### auditCompliance

Records an access event in the compliance audit log for HIPAA / GDPR / PDPA requirements.

**Request**
```json
{
  "action_type": "read",
  "resource_type": "health_data",
  "resource_id": "abc123",
  "details": {}
}
```

| Field         | Type   | Required | Description                                         |
|---------------|--------|----------|-----------------------------------------------------|
| action_type   | string | yes      | `read`, `write`, `delete`, `export`, or `share`    |
| resource_type | string | yes      | `memory`, `health_data`, or `contact_info`         |
| resource_id   | string | yes      | ID of the resource being accessed                  |
| details       | object | no       | Additional metadata to store with the audit entry  |

**Response**
```json
{ "success": true, "audit_id": "..." }
```

---

### autoFixErrors

_(No auth check — intended for scheduled use)_

Scans the database for common data integrity issues (e.g. stuck notifications, orphaned records) and applies automatic fixes.

**Request** — no body required.

**Response**
```json
{
  "fixes": [],
  "errors": [],
  "summary": "..."
}
```

---

### chatWithAI

Generates a compassionate, contextually aware AI response for a person with dementia.  Incorporates the user's profile, their current cognitive level, detected historical era, and safe memory zones.

**Request**
```json
{
  "message": "I think I need to pick up the children from school",
  "conversationHistory": [],
  "detectedEra": "1960s",
  "userLanguage": "en"
}
```

| Field               | Type   | Required | Description |
|---------------------|--------|----------|-------------|
| message / userMessage | string | yes    | The user's message (either field name is accepted) |
| conversationHistory | array  | no       | Previous `{role, content}` turns |
| detectedEra         | string | no       | `1940s`, `1960s`, `1980s`, or `present` |
| userLanguage        | string | no       | BCP-47 language code, defaults to `en` |

**Response**
```json
{
  "response": "Of course! Let's see…",
  "detectedEra": "1960s",
  "anxietyDetected": false,
  "recallSuggestion": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### checkAlertConditions

_(No auth check — intended for scheduled use)_

Evaluates all enabled `AlertCondition` records and fires notifications for any conditions that are currently met.

**Request** — no body required.

**Response**
```json
{
  "checked": 12,
  "triggered": 2,
  "alerts": []
}
```

---

### cloneVoice

Creates a cloned voice model from an uploaded audio sample using an AI voice synthesis service.

**Request**
```json
{
  "audio_file_url": "https://…/sample.mp3",
  "voice_name": "Grandma Rose",
  "voice_description": "Warm, gentle, 80s accent"
}
```

| Field             | Type   | Required | Description                         |
|-------------------|--------|----------|-------------------------------------|
| audio_file_url    | string | yes      | Public URL of the audio sample      |
| voice_name        | string | yes      | Human-readable label for the voice  |
| voice_description | string | no       | Optional description for the model  |

**Response**
```json
{ "success": true, "voice_id": "...", "voice_name": "Grandma Rose" }
```

---

### controlSmartDevice

Sends a control command to a connected smart-home device.

**Request**
```json
{
  "device_id": "device_abc",
  "action": "turn_on",
  "parameters": { "brightness": 80 },
  "routine_id": null
}
```

| Field      | Type   | Required | Description                                 |
|------------|--------|----------|---------------------------------------------|
| device_id  | string | yes      | ID of the `SmartDevice` entity              |
| action     | string | yes      | Command to send, e.g. `turn_on`, `set_brightness` |
| parameters | object | no       | Additional action parameters                |
| routine_id | string | no       | If set, logs the action against a routine   |

**Response**
```json
{ "success": true, "device": {}, "result": {} }
```

---

### detectBehaviorAnomalies

Analyses recent activity logs, anxiety trends, conversations, and night incidents to identify unusual behavioural patterns.

**Request** — no body required (reads data server-side).

**Response**
```json
{
  "anomalies": [],
  "risk_level": "low",
  "recommendations": []
}
```

---

### detectNightEmergency

Processes real-time night-watch sensor data (voice transcript, vocal patterns, environmental sounds) and classifies whether an emergency is occurring.

**Request**
```json
{
  "voiceTranscript": "Help, I don't know where I am",
  "voicePatterns": { "volume": 85, "speech_rate": "rapid" },
  "environmentalSounds": ["banging"],
  "movementData": {},
  "timeOfNight": "03:15"
}
```

| Field               | Type   | Required | Description                         |
|---------------------|--------|----------|-------------------------------------|
| voiceTranscript     | string | no       | Transcription of detected speech    |
| voicePatterns       | object | no       | Acoustic feature metrics            |
| environmentalSounds | array  | no       | Labels of detected ambient sounds   |
| movementData        | object | no       | Motion-sensor payload               |
| timeOfNight         | string | no       | Local time string, e.g. `"03:15"`  |

**Response**
```json
{
  "emergencyType": "DISORIENTATION",
  "distressLevel": 7,
  "comfortResponse": "I'm right here…",
  "alertCaregiver": true,
  "timestamp": "2024-01-01T03:15:00.000Z"
}
```

---

### executeSmartHomeRoutine

Runs a predefined smart-home routine by its ID or name.

**Request**
```json
{
  "routine_id": "routine_abc",
  "routineName": "Morning Calm",
  "requires_confirmation": false,
  "override": false
}
```

| Field                | Type    | Required | Description |
|----------------------|---------|----------|-------------|
| routine_id           | string  | no       | ID of the `SmartHomeRoutine` entity |
| routineName          | string  | no       | Name lookup (used if `routine_id` is absent) |
| requires_confirmation | boolean | no      | Skip if the routine needs manual approval, default `false` |
| override             | boolean | no       | Force execution even when conditions are not met, default `false` |

**Response**
```json
{ "success": true, "routine": {}, "devicesControlled": 3 }
```

---

### findRelevantMedia

Selects photos, music, and videos from the user's library that are contextually relevant to the current conversation.

**Request**
```json
{
  "context": "User is talking about a beach holiday",
  "current_era": "1970s",
  "conversation_topics": ["holiday", "ocean"]
}
```

| Field                | Type   | Required | Description |
|----------------------|--------|----------|-------------|
| context              | string | yes      | Summary of the current conversation context |
| current_era          | string | no       | Era the user seems to be experiencing |
| conversation_topics  | array  | no       | Detected topic keywords |

**Response**
```json
{
  "photos": [],
  "music": [],
  "videos": [],
  "reasoning": "..."
}
```

---

### generateAIContent

Generates personalised AI content (stories, conversation starters, memory prompts) based on the user's profile and cognitive level.

**Request**
```json
{
  "type": "story",
  "userProfile": {},
  "existingStories": [],
  "existingMemories": [],
  "cognitiveLevel": "mild"
}
```

| Field           | Type   | Required | Description |
|-----------------|--------|----------|-------------|
| type            | string | yes      | Content type, e.g. `story`, `conversation_starter` |
| userProfile     | object | no       | User profile data for personalisation |
| existingStories | array  | no       | Previously generated stories (to avoid repetition) |
| existingMemories | array | no       | Existing memory records |
| cognitiveLevel  | string | no       | `mild`, `moderate`, `advanced`, or `severe` |

**Response** — LLM-generated content object (structure depends on `type`).

---

### generateCareInsights

Analyses care journal entries, activity logs, and conversation data to produce actionable care insights for the care team.

**Request** — no body required.

**Response**
```json
{
  "insights": [],
  "trends": {},
  "recommendations": [],
  "generated_at": "2024-01-01T00:00:00.000Z"
}
```

---

### generateCaregiverInsights

_(Admin / service-role only)_

Generates aggregated caregiver performance and patient wellbeing metrics for a configurable look-back window.

**Request**
```json
{ "days": 7 }
```

| Field | Type   | Required | Description |
|-------|--------|----------|-------------|
| days  | number | no       | Look-back window in days, default `7` |

**Response**
```json
{
  "period_days": 7,
  "insights": {},
  "generated_at": "2024-01-01T00:00:00.000Z"
}
```

---

### generateCaregiverReport

_(Admin / service-role only)_

Produces a structured caregiver report (daily, weekly, or monthly) for a specific patient.

**Request**
```json
{
  "report_type": "weekly",
  "patient_id": "patient_abc"
}
```

| Field       | Type   | Required | Description |
|-------------|--------|----------|-------------|
| report_type | string | yes      | `daily`, `weekly`, or `monthly` |
| patient_id  | string | yes      | ID of the patient entity |

**Response**
```json
{
  "report_type": "weekly",
  "patient_id": "patient_abc",
  "report": {},
  "generated_at": "2024-01-01T00:00:00.000Z"
}
```

---

### generateMaintenanceReport

_(No auth check — intended for scheduled use)_

Scans entities for data quality issues, orphaned records, and storage statistics, and returns a maintenance health report.

**Request** — no body required.

**Response**
```json
{
  "issues": [],
  "statistics": {},
  "recommendations": [],
  "generated_at": "2024-01-01T00:00:00.000Z"
}
```

---

### generateMemoryReflection

Generates a reflective memory summary or life-story entry based on the user's stored memories.

**Request**
```json
{ "reflection_type": "daily" }
```

| Field           | Type   | Required | Description |
|-----------------|--------|----------|-------------|
| reflection_type | string | no       | `daily`, `weekly`, or `life_story` |

**Response**
```json
{
  "reflection": "...",
  "memories_used": [],
  "generated_at": "2024-01-01T00:00:00.000Z"
}
```

---

### generateMemorySession

Builds a structured interactive memory-therapy session using the user's photos, videos, and life experiences.

**Request**
```json
{ "sessionType": "reminiscence" }
```

| Field       | Type   | Required | Description |
|-------------|--------|----------|-------------|
| sessionType | string | no       | `reminiscence`, `life_review`, or `music_memory` |

**Response** — a session object containing ordered prompts, associated media, and suggested conversation starters.

---

### generatePersonalizedConversation

Generates a tailored conversation script or dialogue starter adapted to the user's current emotional state and context.

**Request**
```json
{
  "emotionalState": "anxious",
  "anxietyLevel": 6,
  "currentContext": "Evening routine"
}
```

| Field           | Type   | Required | Description |
|-----------------|--------|----------|-------------|
| emotionalState  | string | yes      | Detected emotion label |
| anxietyLevel    | number | yes      | 0–10 |
| currentContext  | string | no       | Free-text description of what is happening |

**Response**
```json
{
  "conversation_starters": [],
  "approach": "...",
  "topics_to_avoid": []
}
```

---

### generatePersonalizedStory

Creates a short, personalised story or poem tailored to the user's preferences and current mood.

**Request**
```json
{
  "contentType": "story",
  "theme": "garden",
  "mood": "calm"
}
```

| Field       | Type   | Required | Description |
|-------------|--------|----------|-------------|
| contentType | string | no       | `story` or `poem`, default `story` |
| theme       | string | no       | Story theme, e.g. `garden`, `seaside` |
| mood        | string | no       | Desired emotional tone |

**Response**
```json
{ "title": "...", "content": "...", "theme": "garden" }
```

---

### generatePlaylist

Uses AI to build a music playlist matched to the specified era, mood, and genre preferences.

**Request**
```json
{
  "name": "Sunday Morning",
  "mood": "calm",
  "genres": ["jazz", "classical"],
  "era": "1960s"
}
```

| Field  | Type   | Required | Description |
|--------|--------|----------|-------------|
| name   | string | yes      | Playlist name |
| mood   | string | no       | Mood target |
| genres | array  | no       | Preferred genres |
| era    | string | no       | Decade string, e.g. `1960s` |

**Response**
```json
{ "playlist_id": "...", "tracks": [], "name": "Sunday Morning" }
```

---

### healthCheck

Runs automated checks on database connectivity, entity integrity, error rates, and overall system performance.

**Request** — no body required, no auth check.

**Response**
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "status": "healthy",
  "checks": {
    "database": { "status": "pass", "responseTime": 42 },
    "entities": { "status": "pass", "details": {} },
    "errorRate": { "status": "pass", "recentErrors": 0 },
    "performance": { "status": "pass", "totalCheckTime": 312 }
  },
  "issues": [],
  "recommendations": ["System is operating normally"]
}
```

`status` is one of `healthy`, `degraded`, `unhealthy`, or `critical`.

---

### logAuditEvent

Records a single compliance audit event (lower-level than `auditCompliance`; accepts explicit user metadata for service-role calls).

**Request**
```json
{
  "action_type": "write",
  "user_email": "carer@example.com",
  "user_name": "Jane Smith",
  "resource_type": "memory",
  "resource_id": "mem_abc",
  "details": {},
  "success": true
}
```

| Field         | Type    | Required | Description |
|---------------|---------|----------|-------------|
| action_type   | string  | yes      | Action performed |
| user_email    | string  | yes      | Actor's email |
| user_name     | string  | yes      | Actor's display name |
| resource_type | string  | yes      | Type of resource accessed |
| resource_id   | string  | yes      | Resource identifier |
| details       | object  | no       | Arbitrary additional metadata |
| success       | boolean | no       | Whether the action succeeded, default `true` |

**Response**
```json
{ "success": true, "audit_id": "..." }
```

---

### moodBasedDeviceControl

Evaluates active mood-automation rules against the current anxiety level and mood, and automatically adjusts smart-home devices as configured.

**Request**
```json
{
  "anxiety_level": 7,
  "detected_mood": "anxious",
  "conversation_context": "User expressed worry about family"
}
```

| Field                | Type   | Required | Description |
|----------------------|--------|----------|-------------|
| anxiety_level        | number | yes      | 0–10 |
| detected_mood        | string | yes      | Mood label |
| conversation_context | string | no       | Relevant context excerpt |

**Response**
```json
{
  "applied": true,
  "automations_triggered": [],
  "devices_updated": 2
}
```

---

### nightModeChat

Generates a gentle, safety-focused night-mode conversational response for a person who is awake during the night.

**Request**
```json
{
  "userMessage": "I can't find my husband",
  "conversationHistory": [],
  "incidentType": "disorientation",
  "userProfile": {}
}
```

| Field               | Type   | Required | Description |
|---------------------|--------|----------|-------------|
| userMessage         | string | yes      | The user's message |
| conversationHistory | array  | no       | Prior `{role, content}` turns |
| incidentType        | string | no       | e.g. `disorientation`, `anxiety`, `physical` |
| userProfile         | object | no       | Profile data to personalise the response |

**Response**
```json
{
  "response": "...",
  "alertLevel": "low",
  "suggestCaregiver": false
}
```

---

### nightWatchAI

Assesses the overnight monitoring context and recommends an action: continue monitoring, play comfort audio, check in verbally, or alert the caregiver.

**Request**
```json
{
  "context": "ambient",
  "user_interaction": null,
  "time_of_night": "02:30",
  "detected_anxiety_indicators": [],
  "previous_incidents": []
}
```

| Field                      | Type   | Required | Description |
|----------------------------|--------|----------|-------------|
| context                    | string | no       | `ambient`, `active`, or `distressed` |
| user_interaction           | object | no       | Last detected interaction event |
| time_of_night              | string | no       | Local time string |
| detected_anxiety_indicators | array | no       | List of detected signals |
| previous_incidents         | array  | no       | Recent incident history |

**Response**
```json
{
  "distress_level": 2,
  "recommended_action": "continue_monitoring",
  "comfort_message": null,
  "alert_caregiver": false
}
```

---

### playScheduledPlaylist

_(No auth check — intended for scheduled use)_

Finds the next scheduled playlist and triggers playback.

**Request** — no body required.

**Response**
```json
{ "played": true, "playlist_id": "...", "track_count": 12 }
```

---

### proactiveEngagement

Analyses the user's recent activity, mood history, and time of day to generate a proactive engagement suggestion (e.g. start a music session or share a memory).

**Request** — no body required (reads data server-side).

**Response**
```json
{
  "suggestion_type": "music",
  "message": "...",
  "media": null
}
```

---

### recallMemories

Selects a set of positive memories from the user's memory store that are contextually relevant to the current conversation and detected era.

**Request**
```json
{
  "context": "User is talking about baking",
  "sentiment_analysis": { "emotional_tone": "nostalgic" },
  "detected_era": "1970s"
}
```

| Field              | Type   | Required | Description |
|--------------------|--------|----------|-------------|
| context            | string | yes      | Current conversation context |
| sentiment_analysis | object | no       | Output from `analyzeSentiment` |
| detected_era       | string | no       | Era the user seems to be experiencing |

**Response**
```json
{
  "memories": [],
  "media_items": [],
  "reasoning": "..."
}
```

---

### searchMusic

Searches for music on YouTube (or another configured source) matching a query, era, or mood.

**Request**
```json
{
  "query": "Frank Sinatra",
  "era": "1960s",
  "source": "youtube"
}
```

| Field  | Type   | Required | Description |
|--------|--------|----------|-------------|
| query  | string | yes      | Search terms |
| era    | string | no       | Decade filter, e.g. `1960s` |
| source | string | no       | `youtube` (default) |

**Response**
```json
{ "results": [], "query": "Frank Sinatra" }
```

---

### sendBulkEmail

Sends an email to one or more recipients on behalf of the application.

**Request**
```json
{
  "subject": "Weekly care summary",
  "body": "Here is this week's update…",
  "recipientEmails": ["carer@example.com"]
}
```

| Field           | Type          | Required | Description |
|-----------------|---------------|----------|-------------|
| subject         | string        | yes      | Email subject line |
| body            | string        | yes      | Email body (plain text or HTML) |
| recipientEmails | string/array  | yes      | One or more recipient addresses |

**Response**
```json
{
  "success": true,
  "message": "Sent 1 emails successfully, 0 failed",
  "totalRecipients": 1,
  "successCount": 1,
  "failureCount": 0,
  "details": []
}
```

---

### sendChatNotification

Sends an in-app or email notification to one or more recipients about a new chat message.

**Request**
```json
{
  "message_id": "msg_abc",
  "sender_name": "Alice",
  "message_preview": "Just checking in…",
  "recipient_emails": ["family@example.com"]
}
```

| Field             | Type  | Required | Description |
|-------------------|-------|----------|-------------|
| message_id        | string | yes     | ID of the originating message |
| sender_name       | string | yes     | Display name of the sender |
| message_preview   | string | yes     | Short preview of the message text |
| recipient_emails  | array  | yes     | Recipient email addresses |

**Response**
```json
{ "success": true, "notified": 1 }
```

---

### suggestMusic

Suggests music tracks or playlists suited to the user's current mood, preferred era, and conversation context.

**Request**
```json
{
  "mood": "calm",
  "era": "1950s",
  "context": "User mentioned they used to enjoy dancing"
}
```

| Field   | Type   | Required | Description |
|---------|--------|----------|-------------|
| mood    | string | yes      | Current mood label |
| era     | string | no       | Preferred decade |
| context | string | no       | Relevant conversation context |

**Response** — LLM-generated suggestion object containing track titles, artist names, and rationale.

---

### suggestVisualResponses

Generates contextually appropriate visual response options (image descriptions, emoji sets, or simple gesture cues) for the current conversation state.

**Request**
```json
{
  "conversation_context": "User seems happy",
  "detected_emotion": "happy",
  "detected_era": "1960s",
  "anxiety_level": 2,
  "conversation_topics": ["family", "music"]
}
```

| Field                | Type   | Required | Description |
|----------------------|--------|----------|-------------|
| conversation_context | string | yes      | Summary of the conversation |
| detected_emotion     | string | no       | Emotion label |
| detected_era         | string | no       | Era context |
| anxiety_level        | number | no       | 0–10 |
| conversation_topics  | array  | no       | Topic keywords |

**Response**
```json
{ "visual_suggestions": [], "rationale": "..." }
```

---

### syncOfflineData

Merges offline-captured conversations, audio library metadata, and app settings back into the server-side database when connectivity is restored.

**Request**
```json
{
  "sync_type": "full",
  "offline_conversations": [],
  "audio_library_metadata": [],
  "settings": {}
}
```

| Field                   | Type   | Required | Description |
|-------------------------|--------|----------|-------------|
| sync_type               | string | yes      | `full` or `partial` |
| offline_conversations   | array  | no       | Conversations captured while offline |
| audio_library_metadata  | array  | no       | Metadata for offline audio files |
| settings                | object | no       | App settings delta to merge |

**Response**
```json
{ "success": true, "conversations_synced": 3, "conflicts": [] }
```

---

### synthesizeClonedVoice

Converts text to speech using a previously cloned voice model.

**Request**
```json
{
  "text": "Good morning, how are you feeling today?",
  "voice_id": "voice_abc",
  "stability": 0.75,
  "similarity_boost": 0.75
}
```

| Field            | Type   | Required | Description |
|------------------|--------|----------|-------------|
| text             | string | yes      | Text to synthesise |
| voice_id         | string | yes      | ID of the cloned voice from `cloneVoice` |
| stability        | number | no       | Voice stability 0–1, default `0.75` |
| similarity_boost | number | no       | Similarity to original 0–1, default `0.75` |

**Response**
```json
{ "audio_url": "https://…/audio.mp3", "duration_seconds": 4.2 }
```

---

### trackPatientSession

Starts or updates a caregiver-tracked session record for a specific patient, used for billing, reporting, and care continuity.

**Request**
```json
{
  "patient_id": "patient_abc",
  "session_type": "interaction"
}
```

| Field        | Type   | Required | Description |
|--------------|--------|----------|-------------|
| patient_id   | string | yes      | ID of the patient entity |
| session_type | string | no       | `interaction`, `assessment`, or `care`, default `interaction` |

**Response**
```json
{ "session_id": "...", "patient": {}, "started_at": "2024-01-01T00:00:00.000Z" }
```

---

### translateText

Translates text from one language to another using an AI translation service.  Falls back gracefully by returning the original text if the source is already the target language.

**Request**
```json
{
  "text": "Good morning",
  "targetLanguage": "fr",
  "sourceLanguage": "en"
}
```

| Field          | Type   | Required | Description |
|----------------|--------|----------|-------------|
| text           | string | yes      | Text to translate |
| targetLanguage | string | yes      | BCP-47 target language code |
| sourceLanguage | string | no       | BCP-47 source code (auto-detected if omitted) |

**Response**
```json
{ "translatedText": "Bonjour", "detectedLanguage": "en" }
```

---

### triggerReminders

_(No auth check — intended for scheduled use)_

Scans all active `Reminder` records, fires notifications for any that are due, and returns a summary of what was sent.

**Request** — no body required.

**Response**
```json
{ "triggered": 2, "reminders": [], "timestamp": "2024-01-01T00:00:00.000Z" }
```

---

## Error responses

All functions return standard error shapes:

| HTTP status | Body |
|-------------|------|
| 400 | `{ "error": "..." }` — missing or invalid request field |
| 401 | `{ "error": "Unauthorized" }` — missing or invalid session |
| 403 | `{ "error": "Unauthorized - Admin access required" }` — insufficient role |
| 404 | `{ "error": "... not found" }` — referenced entity does not exist |
| 500 | `{ "error": "...", "details": "..." }` — unexpected server error |
