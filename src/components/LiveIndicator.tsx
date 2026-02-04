import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  isLive: boolean;
  className?: string;
}

export function LiveIndicator({ isLive, className }: LiveIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div
          className={cn(
            "h-2.5 w-2.5 rounded-full transition-colors duration-500",
            isLive ? "bg-sage" : "bg-sand-dark"
          )}
        />
        {isLive && (
          <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-sage animate-breathe" />
        )}
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {isLive ? "Listening" : "Ready"}
      </span>
    </div>
  );
}
