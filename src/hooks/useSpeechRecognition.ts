import { useState, useEffect, useCallback, useRef } from "react";

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (result: SpeechRecognitionResult) => void;
  onError?: (error: string) => void;
}

// Type declarations for Web Speech API
interface ISpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: ISpeechRecognitionResultList;
}

interface ISpeechRecognitionResultList {
  length: number;
  [index: number]: ISpeechRecognitionResult;
}

interface ISpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: ISpeechRecognitionAlternative;
}

interface ISpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  }
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const {
    continuous = true,
    interimResults = true,
    language = "en-US",
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  // Check browser support
  useEffect(() => {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionClass);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      onError?.("Speech recognition is not supported in this browser");
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
    };

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
          onResult?.({
            transcript: transcript.trim(),
            isFinal: true,
            confidence: result[0].confidence,
          });
        } else {
          interimTranscript += transcript;
        }
      }

      // Update current transcript for interim results
      if (interimTranscript) {
        setCurrentTranscript(interimTranscript);
        onResult?.({
          transcript: interimTranscript.trim(),
          isFinal: false,
          confidence: 0,
        });
      }

      if (finalTranscript) {
        setCurrentTranscript("");
      }
    };

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      
      // Don't report "no-speech" as an error - it's normal during pauses
      if (event.error !== "no-speech" && event.error !== "aborted") {
        onError?.(event.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart if we're supposed to be listening
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
          isListeningRef.current = false;
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      onError?.("Failed to start speech recognition");
    }
  }, [continuous, interimResults, language, onResult, onError]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setCurrentTranscript("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    currentTranscript,
    startListening,
    stopListening,
  };
}
