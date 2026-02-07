import { SignalType } from "@/components/SignalCard";
import { ServiceType } from "@/components/ServiceRecommendation";

export interface TranscriptEntry {
  id: string;
  speaker: "caller" | "prospect";
  text: string;
  timestamp: Date;
  isPartial?: boolean;
}

export interface Recommendation {
  service: ServiceType;
  confidence: number;
  reason: string;
  suggestedApproach: string;
}

export interface Signal {
  type: SignalType;
  label: string;
  description: string;
  intensity: number;
}
