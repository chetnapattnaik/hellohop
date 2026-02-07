

# Plan: Real Transcription + Supabase Integration

## What changes

Currently, both "Live Transcription" and "Upload Recording" modes trigger the same demo simulation with hardcoded fake conversations. This plan completely removes the demo and replaces it with:

1. **Live mode** -- uses the browser's built-in Speech Recognition API to transcribe your microphone in real time (no API key needed).
2. **Upload mode** -- sends the audio file to an ElevenLabs edge function on Supabase for real transcription.
3. **Call history** -- every analysed call (live or uploaded) is saved to a Supabase database so you can revisit past analyses.

---

## Step-by-step

### 1. Enable Lovable Cloud (Supabase)

Set up Supabase so we can create edge functions and a database. This also gives us a place to store past call analyses.

### 2. Connect ElevenLabs

Link the ElevenLabs connector so we have an `ELEVENLABS_API_KEY` available in edge functions for audio transcription.

### 3. Create the ElevenLabs transcription edge function

A new Supabase edge function (`elevenlabs-transcribe`) that:
- Receives an uploaded audio file
- Sends it to the ElevenLabs Speech-to-Text API (`scribe_v2` model) with speaker diarization enabled
- Returns the transcript with word-level timestamps and speaker labels

### 4. Create a live transcription hook (`useLiveTranscription`)

A new React hook that:
- Uses the browser-native `webkitSpeechRecognition` / `SpeechRecognition` API
- Captures interim (partial) and final transcript results
- Populates the same `TranscriptEntry[]` format the dashboard expects
- Tracks call duration with a timer
- No external API or key required

### 5. Create an upload transcription hook (`useUploadTranscription`)

A new React hook that:
- Sends the selected audio file to the `elevenlabs-transcribe` edge function
- Parses the response into `TranscriptEntry[]` entries (using speaker diarization to distinguish speakers)
- Calculates audio duration from the response timestamps

### 6. Remove `useCallSimulation` entirely

Delete the file and all imports. The demo conversation, fake signals, and fake recommendations will be completely gone.

### 7. Update `Index.tsx` to use real hooks

- **Live mode**: Wire the "Start Listening" button to `useLiveTranscription`. Transcript appears word-by-word as you speak.
- **Upload mode**: Wire the "Analyse Recording" button to `useUploadTranscription`. After processing, the full transcript appears on the dashboard.
- Signals and recommendations panels will show empty states until AI-based signal analysis is added in a future step (the UI already handles empty states gracefully).

### 8. Create database tables for call history

A Supabase migration that creates:
- `call_analyses` table -- stores each session's mode, transcript entries, detected signals, recommendations, duration, and timestamps
- RLS policies for basic access

### 9. Save completed analyses

After a live call ends or an upload finishes processing, the transcript data is automatically saved to the `call_analyses` table.

---

## What you will see after this

- **Live mode**: Click "Start Listening", grant microphone permission, speak -- your words appear in the transcript panel in real time. No fake conversations.
- **Upload mode**: Upload an MP3/WAV file, click "Analyse Recording" -- the real transcript (with speaker labels) appears on the dashboard. No fake conversations.
- **Signals & Recommendations**: These panels will show their empty/waiting states ("Signals will appear as the conversation progresses..."). Real AI-powered signal detection will be a separate follow-up step.
- **Call history**: Past analyses are persisted in Supabase for future retrieval.

---

## Technical details

### New files
| File | Purpose |
|---|---|
| `src/hooks/useLiveTranscription.ts` | Browser Speech Recognition hook |
| `src/hooks/useUploadTranscription.ts` | ElevenLabs batch transcription hook |
| `supabase/functions/elevenlabs-transcribe/index.ts` | Edge function for audio-to-text |
| `supabase/migrations/XXXX_create_call_analyses.sql` | Database table for saving past calls |

### Modified files
| File | Change |
|---|---|
| `src/pages/Index.tsx` | Replace `useCallSimulation` with real hooks, wire up both modes |
| `src/components/AudioUploader.tsx` | No changes needed (already passes file up) |

### Deleted files
| File | Reason |
|---|---|
| `src/hooks/useCallSimulation.ts` | All demo/simulated logic removed |

### Dependencies
| Package | Reason |
|---|---|
| `@elevenlabs/react` | Not needed for batch STT (API call only) |

### Edge function: `elevenlabs-transcribe`
- Accepts audio file via `FormData`
- Calls `POST https://api.elevenlabs.io/v1/speech-to-text` with `model_id: scribe_v2`, `diarize: true`
- Returns JSON transcript with speaker-labeled words

### Database: `call_analyses`
```text
id              uuid (PK)
mode            text ("live" | "upload")
transcript      jsonb (array of transcript entries)
signals         jsonb (array of detected signals)
recommendation  jsonb (recommendation object, nullable)
duration        integer (seconds)
file_name       text (nullable, for uploads)
created_at      timestamptz
```

