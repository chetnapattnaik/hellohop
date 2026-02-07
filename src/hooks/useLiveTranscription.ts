import { useState, useEffect, useCallback, useRef } from "react";
import type { TranscriptEntry } from "@/types/transcription";

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useLiveTranscription() {
  const [isLive, setIsLive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const entryCountRef = useRef(0);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    setError(null);
    setEntries([]);
    setDuration(0);
    entryCountRef.current = 0;

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();

        if (!transcript) continue;

        if (result.isFinal) {
          const id = `live-${entryCountRef.current++}`;
          setEntries((prev) => {
            // Remove any partial entry that this finalises
            const withoutPartial = prev.filter(
              (e) => !e.isPartial || !transcript.startsWith(e.text.slice(0, 10))
            );
            return [
              ...withoutPartial,
              {
                id,
                speaker: "caller",
                text: transcript,
                timestamp: new Date(),
                isPartial: false,
              },
            ];
          });
        } else {
          // Show interim result
          setEntries((prev) => {
            const withoutOldPartial = prev.filter((e) => !e.isPartial);
            return [
              ...withoutOldPartial,
              {
                id: `partial-${i}`,
                speaker: "caller",
                text: transcript,
                timestamp: new Date(),
                isPartial: true,
              },
            ];
          });
        }
      }
    };

    recognition.onerror = (event: { error: string }) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        setError(`Microphone error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be live
      if (recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch {
          // Already stopped
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsLive(true);
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      const ref = recognitionRef.current;
      recognitionRef.current = null;
      ref.stop();
    }
    setIsLive(false);
    // Remove any partial entries
    setEntries((prev) => prev.filter((e) => !e.isPartial));
  }, []);

  // Duration timer
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isLive,
    duration,
    entries,
    error,
    isSupported,
    startListening,
    stopListening,
  };
}
