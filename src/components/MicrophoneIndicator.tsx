import { cn } from "@/lib/utils";
import { Mic, MicOff } from "lucide-react";

interface MicrophoneIndicatorProps {
  isListening: boolean;
  partialTranscript?: string;
}

export function MicrophoneIndicator({ isListening, partialTranscript }: MicrophoneIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-full transition-all",
          isListening
            ? "bg-terracotta-light"
            : "bg-muted"
        )}
      >
        {isListening ? (
          <>
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 rounded-full bg-terracotta/20 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-terracotta/10 animate-pulse" />
            <Mic className="h-5 w-5 text-terracotta relative z-10" />
          </>
        ) : (
          <MicOff className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      
      {isListening && partialTranscript && (
        <div className="flex-1 max-w-xs">
          <p className="text-sm text-muted-foreground italic truncate animate-pulse">
            {partialTranscript}...
          </p>
        </div>
      )}
      
      {isListening && !partialTranscript && (
        <p className="text-xs text-muted-foreground">
          Listening...
        </p>
      )}
    </div>
  );
}
