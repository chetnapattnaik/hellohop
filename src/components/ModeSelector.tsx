import { cn } from "@/lib/utils";
import { Mic, Upload, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TranscriptionMode = "live" | "upload";

interface ModeSelectorProps {
  onSelect: (mode: TranscriptionMode) => void;
  className?: string;
}

export function ModeSelector({ onSelect, className }: ModeSelectorProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[60vh]", className)}>
      <div className="text-center mb-10 animate-fade-in">
        <h2 className="font-serif text-3xl font-medium text-foreground mb-2">
          How would you like to begin?
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Choose to listen in real-time or upload a recorded call for analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full animate-fade-in" style={{ animationDelay: "150ms" }}>
        {/* Live Transcription */}
        <button
          onClick={() => onSelect("live")}
          className="group relative rounded-2xl border bg-card p-8 text-left transition-all duration-300 hover:shadow-lg hover:border-sage/40 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex flex-col items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-sage-light flex items-center justify-center group-hover:bg-sage/20 transition-colors">
              <Mic className="h-7 w-7 text-sage" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-foreground mb-1">
                Live Transcription
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Start a call and get real-time transcription with live signal detection as the conversation unfolds.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sage text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Start listening <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </button>

        {/* Upload Audio */}
        <button
          onClick={() => onSelect("upload")}
          className="group relative rounded-2xl border bg-card p-8 text-left transition-all duration-300 hover:shadow-lg hover:border-terracotta/40 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex flex-col items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-terracotta-light flex items-center justify-center group-hover:bg-terracotta/20 transition-colors">
              <Upload className="h-7 w-7 text-terracotta" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-foreground mb-1">
                Upload Recording
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload an audio file of a past call for post-call analysis, signal detection, and service recommendations.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-terracotta text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Upload file <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
