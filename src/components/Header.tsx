import { LiveIndicator } from "./LiveIndicator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { TranscriptionMode } from "./ModeSelector";

interface HeaderProps {
  isLive: boolean;
  mode?: TranscriptionMode | null;
  onBack?: () => void;
}

export function Header({ isLive, mode, onBack }: HeaderProps) {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-sage flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-semibold text-sm">
                  HB+
                </span>
              </div>
              <div>
                <h1 className="font-serif text-lg font-medium text-foreground">
                  Call Intelligence
                </h1>
                <p className="text-xs text-muted-foreground">
                  Wellness-first guidance
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {mode && (
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full capitalize">
                {mode === "live" ? "Live mode" : "Upload mode"}
              </span>
            )}
            <LiveIndicator isLive={isLive} />
          </div>
        </div>
      </div>
    </header>
  );
}
