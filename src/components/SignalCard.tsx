import { cn } from "@/lib/utils";
import { 
  Flame, 
  Heart, 
  Brain, 
  Sparkles, 
  Activity,
  LucideIcon 
} from "lucide-react";

export type SignalType = "burnout" | "pain" | "emotional" | "ready" | "neutral";

export interface Signal {
  type: SignalType;
  label: string;
  description: string;
  intensity: number; // 0-100
}

const signalConfig: Record<SignalType, { icon: LucideIcon; bgClass: string; borderClass: string }> = {
  burnout: { 
    icon: Flame, 
    bgClass: "bg-terracotta-light", 
    borderClass: "border-terracotta/30" 
  },
  pain: { 
    icon: Activity, 
    bgClass: "bg-sunrise-light", 
    borderClass: "border-sunrise/30" 
  },
  emotional: { 
    icon: Heart, 
    bgClass: "bg-lavender-light", 
    borderClass: "border-lavender/30" 
  },
  ready: { 
    icon: Sparkles, 
    bgClass: "bg-sage-light", 
    borderClass: "border-sage/30" 
  },
  neutral: { 
    icon: Brain, 
    bgClass: "bg-muted", 
    borderClass: "border-border" 
  },
};

interface SignalCardProps {
  signal: Signal;
  className?: string;
}

export function SignalCard({ signal, className }: SignalCardProps) {
  const config = signalConfig[signal.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-300 animate-fade-in",
        config.bgClass,
        config.borderClass,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "rounded-lg p-2",
          signal.type === "burnout" && "bg-terracotta/10 text-terracotta",
          signal.type === "pain" && "bg-sunrise/10 text-sunrise",
          signal.type === "emotional" && "bg-lavender/10 text-lavender",
          signal.type === "ready" && "bg-sage/10 text-sage",
          signal.type === "neutral" && "bg-muted-foreground/10 text-muted-foreground",
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-medium text-foreground">
              {signal.label}
            </h4>
            <span className="text-xs text-muted-foreground">
              {signal.intensity}%
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {signal.description}
          </p>
          {/* Gentle intensity bar */}
          <div className="mt-2 h-1 rounded-full bg-background/50 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                signal.type === "burnout" && "bg-terracotta/60",
                signal.type === "pain" && "bg-sunrise/60",
                signal.type === "emotional" && "bg-lavender/60",
                signal.type === "ready" && "bg-sage/60",
                signal.type === "neutral" && "bg-muted-foreground/40",
              )}
              style={{ width: `${signal.intensity}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface SignalsGridProps {
  signals: Signal[];
}

export function SignalsGrid({ signals }: SignalsGridProps) {
  return (
    <div className="grid gap-3">
      {signals.map((signal) => (
        <SignalCard 
          key={signal.type} 
          signal={signal} 
        />
      ))}
    </div>
  );
}
