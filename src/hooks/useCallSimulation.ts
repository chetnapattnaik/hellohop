import { useState, useEffect, useCallback } from "react";
import { SignalType, Signal } from "@/components/SignalCard";
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

// Simulated conversation that demonstrates signal detection
const simulatedConversation: Omit<TranscriptEntry, "id" | "timestamp">[] = [
  { speaker: "caller", text: "Hi, thanks for reaching out to HB+. How are you doing today?" },
  { speaker: "prospect", text: "Hi, I'm... honestly, I've been better. Work has been really overwhelming lately." },
  { speaker: "caller", text: "I hear you. That sounds like a lot to carry. What made you curious about reaching out to us?" },
  { speaker: "prospect", text: "I used to be so active, you know? But between the long hours and sitting at my desk all day, my back has been killing me. I feel like I've completely let myself go." },
  { speaker: "caller", text: "That's really common, and it's brave to acknowledge it. When you say your back has been bothering you, is it more of a constant thing or does it come and go?" },
  { speaker: "prospect", text: "It's pretty constant now. I've tried going to the gym a few times but honestly, I feel so out of place there. Everyone seems to know what they're doing and I just... I don't even know where to start anymore." },
  { speaker: "caller", text: "I completely understand that feeling. The gym environment can be really intimidating. Tell me, what does feeling good look like for you? Not just physically, but overall." },
  { speaker: "prospect", text: "I guess... I just want to feel like myself again? I've been stress eating a lot, and my sleep is terrible. I wake up tired, drag myself through the day, come home exhausted but can't sleep. It's this awful cycle." },
];

export function useCallSimulation() {
  const [isLive, setIsLive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [conversationIndex, setConversationIndex] = useState(0);

  const startCall = useCallback(() => {
    setIsLive(true);
    setDuration(0);
    setEntries([]);
    setSignals([]);
    setRecommendation(null);
    setConversationIndex(0);
  }, []);

  const endCall = useCallback(() => {
    setIsLive(false);
  }, []);

  // Duration timer
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Conversation progression
  useEffect(() => {
    if (!isLive || conversationIndex >= simulatedConversation.length) return;

    const timeout = setTimeout(() => {
      const message = simulatedConversation[conversationIndex];
      const newEntry: TranscriptEntry = {
        id: `entry-${conversationIndex}`,
        ...message,
        timestamp: new Date(),
      };

      setEntries((prev) => [...prev, newEntry]);
      setConversationIndex((i) => i + 1);

      // Update signals based on conversation progress
      updateSignalsForMessage(conversationIndex, setSignals);
      
      // Update recommendation after enough context
      if (conversationIndex >= 5) {
        updateRecommendation(conversationIndex, setRecommendation);
      }
    }, conversationIndex === 0 ? 1500 : 3000 + Math.random() * 2000);

    return () => clearTimeout(timeout);
  }, [isLive, conversationIndex]);

  return {
    isLive,
    duration,
    entries,
    signals,
    recommendation,
    startCall,
    endCall,
    overallReadiness: Math.min(85, 20 + conversationIndex * 10),
  };
}

function updateSignalsForMessage(
  index: number, 
  setSignals: React.Dispatch<React.SetStateAction<Signal[]>>
) {
  const signalProgression: Record<number, Signal[]> = {
    1: [
      {
        type: "burnout",
        label: "Workplace Stress",
        description: "Mentioned feeling overwhelmed by work demands",
        intensity: 45,
      },
    ],
    3: [
      {
        type: "burnout",
        label: "Workplace Stress",
        description: "High work demands affecting physical activity",
        intensity: 60,
      },
      {
        type: "pain",
        label: "Physical Discomfort",
        description: "Chronic back pain from sedentary work",
        intensity: 55,
      },
    ],
    5: [
      {
        type: "burnout",
        label: "Workplace Stress",
        description: "Long hours and overwhelming responsibilities",
        intensity: 70,
      },
      {
        type: "pain",
        label: "Physical Discomfort",
        description: "Persistent back pain limiting activity",
        intensity: 65,
      },
      {
        type: "emotional",
        label: "Gym Anxiety",
        description: "Feels intimidated and out of place in gym settings",
        intensity: 50,
      },
    ],
    7: [
      {
        type: "burnout",
        label: "Burnout Cycle",
        description: "Sleep issues, fatigue, and stress eating pattern",
        intensity: 80,
      },
      {
        type: "pain",
        label: "Physical Discomfort",
        description: "Back pain from prolonged sitting",
        intensity: 65,
      },
      {
        type: "emotional",
        label: "Gym Anxiety",
        description: "Intimidated by traditional fitness environments",
        intensity: 55,
      },
      {
        type: "ready",
        label: "Open to Change",
        description: "Wants to 'feel like themselves again' — clear motivation",
        intensity: 75,
      },
    ],
  };

  if (signalProgression[index]) {
    setSignals(signalProgression[index]);
  }
}

function updateRecommendation(
  index: number,
  setRecommendation: React.Dispatch<React.SetStateAction<Recommendation | null>>
) {
  if (index >= 7) {
    setRecommendation({
      service: "restore",
      confidence: 85,
      reason: "They're dealing with chronic back pain that's preventing them from exercising, combined with burnout symptoms. Starting with Restore gives them a path to address the physical barrier first, in a non-intimidating environment. Once pain is managed, they'll be more ready for movement.",
      suggestedApproach: "It sounds like your body has been sending you some signals. Before we talk about fitness, I'd love to introduce you to our Restore program — it's specifically for people who need to heal first. No intimidating gym floor, just gentle, guided work to get your back feeling better. Would that feel like a good starting point?",
    });
  } else if (index >= 5) {
    setRecommendation({
      service: "vault",
      confidence: 65,
      reason: "Their gym anxiety suggests they'd benefit from a private, judgment-free environment. However, their back pain should be addressed first.",
      suggestedApproach: "I'm hearing that the gym environment hasn't felt right for you. We have something called The Vault — it's completely private training, just you and a coach who meets you where you are...",
    });
  }
}
