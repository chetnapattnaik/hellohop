import { useState } from "react";
import { Header } from "@/components/Header";
import { ModeSelector, TranscriptionMode } from "@/components/ModeSelector";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { SignalsGrid, Signal } from "@/components/SignalCard";
import { ServiceRecommendation } from "@/components/ServiceRecommendation";
import { CallerProfile } from "@/components/CallerProfile";
import { AudioUploader } from "@/components/AudioUploader";
import { CrmCopyButton } from "@/components/CrmCopyButton";
import { useLiveTranscription } from "@/hooks/useLiveTranscription";
import { useUploadTranscription } from "@/hooks/useUploadTranscription";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Sparkles, AlertCircle } from "lucide-react";
import type { Recommendation } from "@/types/transcription";

const Index = () => {
  const [mode, setMode] = useState<TranscriptionMode | null>(null);

  // Live transcription
  const live = useLiveTranscription();

  // Upload transcription
  const upload = useUploadTranscription();

  // Determine active state based on mode
  const isActive = mode === "live" ? live.isLive : upload.isDone;
  const entries = mode === "live" ? live.entries : upload.entries;
  const duration = mode === "live" ? live.duration : upload.duration;
  const activeError = mode === "live" ? live.error : upload.error;

  // Signals and recommendations are empty until AI analysis is added
  const signals: Signal[] = [];
  const recommendations: Recommendation[] = [];

  const handleBack = () => {
    if (mode === "live" && live.isLive) live.stopListening();
    if (mode === "upload") upload.reset();
    setMode(null);
  };

  const handleFileSelected = (file: File) => {
    upload.transcribe(file);
  };

  // Show dashboard when live is active, upload is processing, or upload is done
  const showDashboard =
    (mode === "live") ||
    (mode === "upload" && (upload.isProcessing || upload.isDone));

  return (
    <div className="min-h-screen bg-background">
      <Header isLive={live.isLive} mode={mode} onBack={mode ? handleBack : undefined} />

      <main className="container mx-auto px-6 py-6">
        {/* Mode Selection */}
        {!mode && <ModeSelector onSelect={setMode} />}

        {/* Upload Mode — file picker before dashboard */}
        {mode === "upload" && !upload.isProcessing && !upload.isDone && (
          <div className="max-w-xl mx-auto mt-8 animate-fade-in">
            <h2 className="font-serif text-2xl font-medium text-foreground mb-1 text-center">
              Upload a Call Recording
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              We'll transcribe and analyse the conversation for you.
            </p>
            <AudioUploader
              onFileSelected={handleFileSelected}
              isProcessing={upload.isProcessing}
            />
          </div>
        )}

        {/* Error display */}
        {activeError && (
          <div className="max-w-xl mx-auto mt-4 rounded-xl border border-terracotta/30 bg-terracotta-light p-4 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="h-5 w-5 text-terracotta flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Something went wrong</p>
              <p className="text-sm text-muted-foreground mt-1">{activeError}</p>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {showDashboard && (
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
                        ? "Transcribing your microphone in real time"
                        : upload.isProcessing
                        ? "Processing uploaded recording..."
                        : "Uploaded recording analysis"}
                    </p>
                  </div>

                  {mode === "live" && (
                    <>
                      {!live.isLive ? (
                        <Button
                          onClick={live.startListening}
                          disabled={!live.isSupported}
                          className="gap-2 bg-sage hover:bg-sage/90 text-primary-foreground"
                        >
                          <Phone className="h-4 w-4" />
                          Start Listening
                        </Button>
                      ) : (
                        <Button
                          onClick={live.stopListening}
                          variant="outline"
                          className="gap-2 border-terracotta/30 text-terracotta hover:bg-terracotta-light"
                        >
                          <PhoneOff className="h-4 w-4" />
                          Stop Listening
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Transcript Content */}
                <div className="flex-1 p-4 overflow-hidden">
                  {upload.isProcessing ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="h-12 w-12 rounded-full border-2 border-sage/30 border-t-sage animate-spin mb-4" />
                      <p className="text-muted-foreground text-sm">
                        Transcribing your recording...
                      </p>
                      <p className="text-muted-foreground/60 text-xs mt-1">
                        This may take a moment depending on the file length
                      </p>
                    </div>
                  ) : (
                    <TranscriptPanel entries={entries} />
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Intelligence */}
            <div className="lg:col-span-5 space-y-6">
              {/* Caller Profile */}
              <CallerProfile
                duration={duration}
                overallReadiness={0}
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
                    <CrmCopyButton signals={signals} recommendations={recommendations} />
                  )}
                </div>

                {signals.length > 0 ? (
                  <SignalsGrid signals={signals} />
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      {isActive
                        ? "AI signal detection coming soon..."
                        : "Signals will appear as the conversation progresses..."}
                    </p>
                  </div>
                )}
              </div>

              {/* Service Recommendations */}
              {recommendations.length > 0 && (
                <div className="space-y-3">
                  <h2 className="font-serif text-lg font-medium text-foreground px-1">
                    Recommended Services
                  </h2>
                  {recommendations.map((rec, index) => (
                    <ServiceRecommendation key={`${rec.service}-${index}`} recommendation={rec} />
                  ))}
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
