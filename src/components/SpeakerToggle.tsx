import { cn } from "@/lib/utils";
import { User, Users } from "lucide-react";

interface SpeakerToggleProps {
  currentSpeaker: "caller" | "prospect";
  onToggle: () => void;
  disabled?: boolean;
}

export function SpeakerToggle({ currentSpeaker, onToggle, disabled }: SpeakerToggleProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
        "border focus:outline-none focus:ring-2 focus:ring-sage/20",
        disabled && "opacity-50 cursor-not-allowed",
        currentSpeaker === "caller"
          ? "bg-sage-light border-sage/30 text-sage"
          : "bg-lavender-light border-lavender/30 text-lavender"
      )}
    >
      {currentSpeaker === "caller" ? (
        <>
          <User className="h-3.5 w-3.5" />
          <span>Speaking as: You</span>
        </>
      ) : (
        <>
          <Users className="h-3.5 w-3.5" />
          <span>Speaking as: Prospect</span>
        </>
      )}
      <span className="text-muted-foreground ml-1">(click to switch)</span>
    </button>
  );
}
