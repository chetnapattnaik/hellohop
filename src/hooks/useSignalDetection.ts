import { useCallback, useRef } from "react";
import { Signal, SignalType } from "@/components/SignalCard";
import { ServiceType } from "@/components/ServiceRecommendation";

interface Recommendation {
  service: ServiceType;
  confidence: number;
  reason: string;
  suggestedApproach: string;
}

// Keywords and phrases that indicate different signals
const signalPatterns: Partial<Record<SignalType, { keywords: string[]; phrases: string[] }>> = {
  burnout: {
    keywords: ["stressed", "exhausted", "tired", "overwhelmed", "burnout", "drained", "fatigue", "sleep", "insomnia", "can't sleep", "no energy"],
    phrases: ["too much work", "long hours", "no time", "can't keep up", "falling apart", "running on empty", "at my limit"],
  },
  pain: {
    keywords: ["pain", "hurt", "ache", "sore", "injury", "back", "shoulder", "knee", "neck", "stiff", "tight", "chronic"],
    phrases: ["killing me", "can't move", "limited mobility", "old injury", "flares up", "constant pain"],
  },
  emotional: {
    keywords: ["anxious", "scared", "intimidated", "afraid", "nervous", "worried", "self-conscious", "judged", "embarrassed"],
    phrases: ["don't belong", "out of place", "everyone stares", "don't fit in", "too intimidated", "feel stupid", "don't know what I'm doing"],
  },
  ready: {
    keywords: ["ready", "change", "want", "need", "help", "better", "improve", "start", "commit", "determined", "motivated"],
    phrases: ["feel like myself", "get back to", "make a change", "tired of feeling", "want to try", "open to", "willing to"],
  },
  consistency: {
    keywords: ["inconsistent", "stop", "quit", "give up", "motivation", "discipline", "routine", "habit", "struggle"],
    phrases: ["can't stick", "keep falling off", "start and stop", "lose motivation", "hard to maintain"],
  },
  nutrition: {
    keywords: ["eating", "food", "diet", "weight", "binge", "stress eating", "unhealthy", "junk", "cravings"],
    phrases: ["relationship with food", "can't stop eating", "emotional eating", "don't know what to eat", "gaining weight"],
  },
};

// Service mapping based on detected signals
const serviceMapping: Record<ServiceType, { signals: (keyof typeof signalPatterns)[]; weight: number }> = {
  restore: { signals: ["pain", "burnout"], weight: 1.5 },
  vault: { signals: ["emotional", "ready"], weight: 1.3 },
  forge: { signals: ["consistency", "ready"], weight: 1.2 },
  nutrition: { signals: ["nutrition", "burnout"], weight: 1.4 },
  mental: { signals: ["burnout", "emotional"], weight: 1.6 },
};

export function useSignalDetection() {
  const conversationHistoryRef = useRef<string[]>([]);
  const signalScoresRef = useRef<Record<string, number>>({
    burnout: 0,
    pain: 0,
    emotional: 0,
    ready: 0,
    consistency: 0,
    nutrition: 0,
  });

  const analyzeText = useCallback((text: string): Signal[] => {
    const lowerText = text.toLowerCase();
    conversationHistoryRef.current.push(lowerText);

    // Check each signal type
    Object.entries(signalPatterns).forEach(([type, patterns]) => {
      const signalType = type as SignalType;
      let score = signalScoresRef.current[signalType];

      // Check keywords
      patterns.keywords.forEach((keyword) => {
        if (lowerText.includes(keyword)) {
          score += 15;
        }
      });

      // Check phrases (higher weight)
      patterns.phrases.forEach((phrase) => {
        if (lowerText.includes(phrase)) {
          score += 25;
        }
      });

      // Cap at 100
      signalScoresRef.current[signalType] = Math.min(100, score);
    });

    // Convert scores to signals (only return signals with score > 20)
    const detectedSignals: Signal[] = Object.entries(signalScoresRef.current)
      .filter(([, score]) => score > 20)
      .map(([type, score]) => {
        const signalType = type as SignalType;
        return {
          type: signalType,
          label: getSignalLabel(signalType),
          description: getSignalDescription(signalType, conversationHistoryRef.current),
          intensity: score,
        };
      })
      .sort((a, b) => b.intensity - a.intensity);

    return detectedSignals;
  }, []);

  const generateRecommendation = useCallback((): Recommendation | null => {
    const scores = signalScoresRef.current;
    
    // Need minimum signal strength to make a recommendation
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    if (totalScore < 50) return null;

    // Calculate service fit scores
    const serviceFitScores: Record<ServiceType, number> = {
      restore: 0,
      vault: 0,
      forge: 0,
      nutrition: 0,
      mental: 0,
    };

    Object.entries(serviceMapping).forEach(([service, config]) => {
      const serviceType = service as ServiceType;
      let fitScore = 0;
      
      config.signals.forEach((signalType) => {
        fitScore += scores[signalType] * config.weight;
      });
      
      serviceFitScores[serviceType] = fitScore;
    });

    // Find best service
    const [bestService, bestScore] = Object.entries(serviceFitScores)
      .sort(([, a], [, b]) => b - a)[0] as [ServiceType, number];

    if (bestScore < 30) return null;

    const confidence = Math.min(95, Math.round(bestScore / 2));

    return {
      service: bestService,
      confidence,
      reason: getRecommendationReason(bestService, scores),
      suggestedApproach: getSuggestedApproach(bestService, scores),
    };
  }, []);

  const reset = useCallback(() => {
    conversationHistoryRef.current = [];
    signalScoresRef.current = {
      burnout: 0,
      pain: 0,
      emotional: 0,
      ready: 0,
      consistency: 0,
      nutrition: 0,
    };
  }, []);

  return {
    analyzeText,
    generateRecommendation,
    reset,
  };
}

function getSignalLabel(type: SignalType): string {
  const labels: Partial<Record<SignalType, string>> = {
    burnout: "Burnout Indicators",
    pain: "Physical Discomfort",
    emotional: "Emotional Load",
    ready: "Readiness for Change",
    consistency: "Consistency Challenge",
    nutrition: "Food Relationship",
    neutral: "General Observation",
  };
  return labels[type] || "Unknown";
}

function getSignalDescription(type: SignalType, history: string[]): string {
  const recentText = history.slice(-3).join(" ");
  
  const descriptions: Partial<Record<SignalType, string>> = {
    burnout: "Showing signs of stress, fatigue, or overwhelm in their daily life",
    pain: "Experiencing physical pain or discomfort that may be limiting activity",
    emotional: "Feeling intimidated or anxious about fitness environments",
    ready: "Expressing motivation and openness to making positive changes",
    consistency: "Struggling to maintain routines or stay committed",
    nutrition: "Challenges with eating habits or relationship with food",
    neutral: "General conversation without specific signals",
  };
  
  return descriptions[type] || "General observation";
}

function getRecommendationReason(service: ServiceType, scores: Record<string, number>): string {
  const reasons: Record<ServiceType, string> = {
    restore: `They're experiencing physical discomfort (${scores.pain || 0}%) combined with burnout signs (${scores.burnout || 0}%). Starting with Restore addresses the physical barriers first in a gentle, supportive environment.`,
    vault: `Their emotional load around gym environments (${scores.emotional || 0}%) suggests they'd thrive in a private, judgment-free setting. The Vault offers personalized attention without the intimidation.`,
    forge: `They show readiness for change (${scores.ready || 0}%) but need support with consistency (${scores.consistency || 0}%). Forge's community accountability could be the missing piece.`,
    nutrition: `Their relationship with food (${scores.nutrition || 0}%) combined with stress patterns (${scores.burnout || 0}%) suggests nutrition coaching would address root causes of their struggles.`,
    mental: `The burnout indicators (${scores.burnout || 0}%) and emotional load (${scores.emotional || 0}%) are significant. Mental health support should be the foundation before adding physical demands.`,
  };
  return reasons[service];
}

function getSuggestedApproach(service: ServiceType, scores: Record<string, number>): string {
  const approaches: Record<ServiceType, string> = {
    restore: "It sounds like your body has been sending you some signals. Before we talk about fitness, I'd love to introduce you to our Restore program — it's specifically for people who need to heal first. No intimidating gym floor, just gentle, guided work to help you feel better. Would that feel like a good starting point?",
    vault: "I'm hearing that the gym environment hasn't felt right for you. We have something called The Vault — it's completely private training, just you and a coach who meets you exactly where you are. No one watching, no pressure. How does that sound?",
    forge: "You mentioned wanting to make a change, and I love that energy. Our Forge community is designed for people who do better with support — small groups, real connections, shared accountability. It might be exactly what helps you stay consistent this time.",
    nutrition: "It sounds like food has become complicated for you, and that's completely understandable given everything else you're carrying. Our nutrition program isn't about diets — it's about healing your relationship with eating. Would you be open to exploring that?",
    mental: "Before we talk about anything physical, I want to acknowledge how much you're carrying right now. We have a Mental Health program that creates space just for that — processing the stress, building resilience. Everything else becomes easier when we start there.",
  };
  return approaches[service];
}
