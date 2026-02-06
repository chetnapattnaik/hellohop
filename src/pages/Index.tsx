import { useState } from "react";
import { Header } from "@/components/Header";
import { ModeSelector, TranscriptionMode } from "@/components/ModeSelector";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { SignalsGrid } from "@/components/SignalCard";
import { ServiceRecommendation } from "@/components/ServiceRecommendation";
import { CallerProfile } from "@/components/CallerProfile";
import { AudioUploader } from "@/components/AudioUploader";
import { CrmCopyButton } from "@/components/CrmCopyButton";
import { useCallSimulation } from "@/hooks/useCallSimulation";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Sparkles, ArrowLeft } from "lucide-react";

const Index = () => {
  const [mode, setMode] = useState<TranscriptionMode | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  const {
    isLive,
    duration,
    entries,
    signals,
    recommendation,
    startCall,
    endCall,
    overallReadiness,
  } = useCallSimulation();

  const handleBack = () => {
    if (isLive) endCall();
    setMode(null);
  };

  const handleFileSelected = (file: File) => {
    setIsProcessingUpload(true);
    // Simulate processing — replace with real transcription later
    setTimeout(() => {
      startCall();
      setIsProcessingUpload(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isLive={isLive} mode={mode} onBack={mode ? handleBack : undefined} />

      <main className="container mx-auto px-6 py-6">
        {/* Mode Selection */}
        {!mode && <ModeSelector onSelect={setMode} />}

        {/* Upload Mode — file picker before dashboard */}
        {mode === "upload" && !isLive && (
          <div className="max-w-xl mx-auto mt-8 animate-fade-in">
            <h2 className="font-serif text-2xl font-medium text-foreground mb-1 text-center">
              Upload a Call Recording
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              We'll transcribe and analyse the conversation for you.
            </p>
            <AudioUploader
              onFileSelected={handleFileSelected}
              isProcessing={isProcessingUpload}
            />
          </div>
        )}

        {/* Dashboard — shown when live (either mode) */}
        {(mode === "live" || (mode === "upload" && isLive)) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel - Transcript */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="bg-card rounded-2xl border shadow-sm flex flex-col h-[calc(100vh-180px)]">
                {/* Transcript Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-medium text-foreground">
                      {mode === "live" ? "Live Transcript" : "Call Transcript"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {mode === "live"
                        ? "Conversation with prospect"
                        : "Uploaded recording analysis"}
                    </p>
                  </div>

                  {mode === "live" && (
                    <>
                      {!isLive ? (
                        <Button
                          onClick={startCall}
                          className="gap-2 bg-sage hover:bg-sage/90 text-primary-foreground"
                        >
                          <Phone className="h-4 w-4" />
                          Start Demo Call
                        </Button>
                      ) : (
                        <Button
                          onClick={endCall}
                          variant="outline"
                          className="gap-2 border-terracotta/30 text-terracotta hover:bg-terracotta-light"
                        >
                          <PhoneOff className="h-4 w-4" />
                          End Call
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Transcript Content */}
                <div className="flex-1 p-4 overflow-hidden">
                  <TranscriptPanel entries={entries} />
                </div>
              </div>
            </div>

            {/* Right Panel - Intelligence */}
            <div className="lg:col-span-5 space-y-6">
              {/* Caller Profile */}
              <CallerProfile
                duration={duration}
                overallReadiness={overallReadiness}
              />

              {/* Detected Signals */}
              <div className="bg-card rounded-2xl border p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-lavender-light flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 text-lavender" />
                    </div>
                    <h2 className="font-serif text-lg font-medium text-foreground">
                      Detected Signals
                    </h2>
                  </div>

                  {signals.length > 0 && (
                    <CrmCopyButton signals={signals} recommendation={recommendation} />
                  )}
                </div>

                {signals.length > 0 ? (
                  <SignalsGrid signals={signals} />
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Signals will appear as the conversation progresses...
                    </p>
                  </div>
                )}
              </div>

              {/* Service Recommendation */}
              {recommendation && (
                <div className="space-y-3">
                  <h2 className="font-serif text-lg font-medium text-foreground px-1">
                    Recommended Service
                  </h2>
                  <ServiceRecommendation recommendation={recommendation} />
                </div>
              )}

              {/* Brand Guidance */}
              <div className="bg-sage-light/50 rounded-xl border border-sage/20 p-4">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  <span className="font-medium text-sage">Remember:</span>{" "}
                  We're not here to close — we're here to help them find the right fit.
                  Sustainability matters more than intensity. If they're not ready,
                  that's okay. Plant the seed and trust the process.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
