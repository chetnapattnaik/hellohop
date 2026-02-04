import { cn } from "@/lib/utils";
import { User, Clock, TrendingUp } from "lucide-react";

interface CallerProfileProps {
  name?: string;
  duration: number; // in seconds
  overallReadiness: number; // 0-100
  className?: string;
}

export function CallerProfile({
  name,
  duration,
  overallReadiness,
  className,
}: CallerProfileProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getReadinessLabel = (readiness: number) => {
    if (readiness >= 70) return "Open to change";
    if (readiness >= 40) return "Exploring options";
    return "Early conversation";
  };

  return (
    <div className={cn("rounded-xl bg-card border p-4", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-sage-light flex items-center justify-center">
          <User className="h-5 w-5 text-sage" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">
            {name || "New Prospect"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {getReadinessLabel(overallReadiness)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Duration</span>
          </div>
          <p className="text-lg font-medium text-foreground font-mono">
            {formatDuration(duration)}
          </p>
        </div>

        <div className="rounded-lg bg-sage-light/50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-sage" />
            <span className="text-xs text-muted-foreground">Readiness</span>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-lg font-medium text-foreground">
              {overallReadiness}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
