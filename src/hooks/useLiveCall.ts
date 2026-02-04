import { useState, useCallback, useRef } from "react";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSignalDetection } from "./useSignalDetection";
import { Signal } from "@/components/SignalCard";
import { ServiceType } from "@/components/ServiceRecommendation";

interface TranscriptEntry {
  id: string;
  speaker: "caller" | "prospect";
  text: string;
  timestamp: Date;
  isPartial?: boolean;
}

interface Recommendation {
  service: ServiceType;
  confidence: number;
  reason: string;
  suggestedApproach: string;
}

export function useLiveCall() {
  const [isLive, setIsLive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [currentSpeaker, setCurrentSpeaker] = useState<"caller" | "prospect">("caller");
  const [partialTranscript, setPartialTranscript] = useState("");
  
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const entryCountRef = useRef(0);
  
  const { analyzeText, generateRecommendation, reset: resetSignals } = useSignalDetection();
  
  const handleSpeechResult = useCallback((result: { transcript: string; isFinal: boolean }) => {
    if (result.isFinal && result.transcript.trim()) {
      // Add the finalized transcript as an entry
      const newEntry: TranscriptEntry = {
        id: `entry-${entryCountRef.current++}`,
        speaker: currentSpeaker,
        text: result.transcript.trim(),
        timestamp: new Date(),
        isPartial: false,
      };
      
      setEntries((prev) => [...prev, newEntry]);
      setPartialTranscript("");
      
      // Analyze for signals
      const detectedSignals = analyzeText(result.transcript);
      if (detectedSignals.length > 0) {
        setSignals(detectedSignals);
      }
      
      // Update recommendation
      const rec = generateRecommendation();
      if (rec) {
        setRecommendation(rec);
      }
    } else if (!result.isFinal) {
      // Update partial transcript
      setPartialTranscript(result.transcript);
    }
  }, [currentSpeaker, analyzeText, generateRecommendation]);
  
  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    onResult: handleSpeechResult,
    onError: (error) => {
      console.error("Speech recognition error:", error);
    },
  });
  
  const startCall = useCallback(() => {
    setIsLive(true);
    setDuration(0);
    setEntries([]);
    setSignals([]);
    setRecommendation(null);
    setPartialTranscript("");
    entryCountRef.current = 0;
    resetSignals();
    
    // Start duration timer
    durationIntervalRef.current = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
    
    // Start listening
    startListening();
  }, [startListening, resetSignals]);
  
  const endCall = useCallback(() => {
    setIsLive(false);
    stopListening();
    setPartialTranscript("");
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, [stopListening]);
  
  const toggleSpeaker = useCallback(() => {
    setCurrentSpeaker((prev) => (prev === "caller" ? "prospect" : "caller"));
  }, []);
  
  // Calculate readiness based on signals
  const overallReadiness = signals.reduce((acc, signal) => {
    if (signal.type === "ready") {
      return Math.min(100, acc + signal.intensity * 0.5);
    }
    return Math.min(100, acc + signal.intensity * 0.2);
  }, 20);
  
  return {
    isLive,
    isListening,
    isSupported,
    duration,
    entries,
    signals,
    recommendation,
    currentSpeaker,
    partialTranscript,
    startCall,
    endCall,
    toggleSpeaker,
    overallReadiness: Math.round(overallReadiness),
  };
}
