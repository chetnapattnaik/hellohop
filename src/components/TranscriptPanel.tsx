import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import type { TranscriptEntry } from "@/types/transcription";

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
  className?: string;
}

export function TranscriptPanel({ entries, className }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth",
        className
      )}
    >
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <div className="w-16 h-16 rounded-full bg-sage-light flex items-center justify-center mb-4">
            <div className="w-8 h-8 rounded-full bg-sage/20 animate-breathe" />
          </div>
          <p className="text-muted-foreground text-sm">
            Waiting for conversation to begin...
          </p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            The transcript will appear here as you speak
          </p>
        </div>
      ) : (
        entries.map((entry, index) => (
          <div
            key={entry.id}
            className={cn(
              "animate-fade-in",
              entry.speaker === "caller" ? "pl-0 pr-8" : "pl-8 pr-0"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={cn(
                "rounded-2xl px-4 py-3 transition-all duration-300",
                entry.speaker === "caller"
                  ? "bg-sage-light rounded-tl-sm"
                  : "bg-muted rounded-tr-sm",
                entry.isPartial && "opacity-70"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    "text-xs font-medium uppercase tracking-wider",
                    entry.speaker === "caller"
                      ? "text-sage"
                      : "text-muted-foreground"
                  )}
                >
                  {entry.speaker === "caller" ? "You" : "Prospect"}
                </span>
                <span className="text-xs text-muted-foreground/60">
                  {entry.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {entry.isPartial && (
                  <span className="text-xs text-muted-foreground/50 animate-gentle-pulse">
                    transcribing...
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {entry.text}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
