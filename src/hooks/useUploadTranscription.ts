import { useState, useCallback } from "react";
import type { TranscriptEntry } from "@/types/transcription";

interface ElevenLabsWord {
  text: string;
  start: number;
  end: number;
  speaker?: string;
}

interface ElevenLabsResponse {
  text: string;
  words: ElevenLabsWord[];
}

export function useUploadTranscription() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const transcribe = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setEntries([]);
    setIsDone(false);

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/elevenlabs-transcribe`,
        {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(
          errData?.error || `Transcription failed (${response.status})`
        );
      }

      const data: ElevenLabsResponse = await response.json();

      // Group words by speaker into conversation turns
      const transcriptEntries = wordsToEntries(data.words);
      setEntries(transcriptEntries);

      // Calculate duration from last word timestamp
      const lastWord = data.words[data.words.length - 1];
      if (lastWord) {
        setDuration(Math.ceil(lastWord.end));
      }

      setIsDone(true);
    } catch (err) {
      console.error("Upload transcription error:", err);
      setError(err instanceof Error ? err.message : "Transcription failed");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setEntries([]);
    setDuration(0);
    setError(null);
    setIsDone(false);
    setIsProcessing(false);
  }, []);

  return {
    isProcessing,
    isDone,
    entries,
    duration,
    error,
    transcribe,
    reset,
  };
}

/**
 * Groups diarised words into transcript entries by speaker turn.
 * Each time the speaker changes, a new entry is created.
 */
function wordsToEntries(words: ElevenLabsWord[]): TranscriptEntry[] {
  if (!words || words.length === 0) return [];

  const entries: TranscriptEntry[] = [];
  let currentSpeaker = words[0].speaker ?? "speaker_0";
  let currentWords: string[] = [];
  let turnStart = words[0].start;
  let entryIndex = 0;

  for (const word of words) {
    const speaker = word.speaker ?? "speaker_0";

    if (speaker !== currentSpeaker && currentWords.length > 0) {
      // Speaker changed — flush current turn
      entries.push({
        id: `upload-${entryIndex++}`,
        speaker: mapSpeaker(currentSpeaker),
        text: currentWords.join(" "),
        timestamp: new Date(turnStart * 1000),
      });
      currentWords = [];
      currentSpeaker = speaker;
      turnStart = word.start;
    }

    currentWords.push(word.text);
  }

  // Flush last turn
  if (currentWords.length > 0) {
    entries.push({
      id: `upload-${entryIndex}`,
      speaker: mapSpeaker(currentSpeaker),
      text: currentWords.join(" "),
      timestamp: new Date(turnStart * 1000),
    });
  }

  return entries;
}

/**
 * Maps ElevenLabs speaker labels to our "caller" / "prospect" format.
 * First speaker detected is treated as "caller", all others as "prospect".
 */
function mapSpeaker(speaker: string): "caller" | "prospect" {
  // speaker_0 → caller, all others → prospect
  return speaker === "speaker_0" ? "caller" : "prospect";
}
