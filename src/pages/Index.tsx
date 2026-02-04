import { Header } from "@/components/Header";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { SignalsGrid } from "@/components/SignalCard";
import { ServiceRecommendation } from "@/components/ServiceRecommendation";
import { CallerProfile } from "@/components/CallerProfile";
import { SpeakerToggle } from "@/components/SpeakerToggle";
import { MicrophoneIndicator } from "@/components/MicrophoneIndicator";
import { useLiveCall } from "@/hooks/useLiveCall";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Sparkles, AlertCircle } from "lucide-react";

const Index = () => {
  const {
    isLive,
    isListening,
    isSupported,
    duration,
    entries,
    signals,
    recommendation,
    currentSpeaker,
    partialTranscript,
    startCall,
    endCall,
    toggleSpeaker,
    overallReadiness,
  } = useLiveCall();

  return (
    <div className="min-h-screen bg-background">
      <Header isLive={isLive} />

      <main className="container mx-auto px-6 py-6">
        {/* Browser support warning */}
        {!isSupported && (
          <div className="mb-6 p-4 bg-terracotta-light/50 border border-terracotta/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-terracotta flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Speech recognition not supported
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Please use Chrome, Edge, or Safari for real-time transcription. 
                Firefox does not support the Web Speech API.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Transcript */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-card rounded-2xl border shadow-sm flex flex-col h-[calc(100vh-180px)]">
              {/* Transcript Header */}
              <div className="p-4 border-b space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-medium text-foreground">
                      Live Transcript
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Real-time conversation transcription
                    </p>
                  </div>
                  
                  {!isLive ? (
                    <Button
                      onClick={startCall}
                      disabled={!isSupported}
                      className="gap-2 bg-sage hover:bg-sage/90 text-primary-foreground"
                    >
                      <Phone className="h-4 w-4" />
                      Start Live Call
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
                </div>
                
                {/* Controls when live */}
                {isLive && (
                  <div className="flex items-center justify-between pt-2 border-t border-dashed">
                    <SpeakerToggle
                      currentSpeaker={currentSpeaker}
                      onToggle={toggleSpeaker}
                    />
                    <MicrophoneIndicator
                      isListening={isListening}
                      partialTranscript={partialTranscript}
                    />
                  </div>
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
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded-lg bg-lavender-light flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-lavender" />
                </div>
                <h2 className="font-serif text-lg font-medium text-foreground">
                  Detected Signals
                </h2>
              </div>

              {signals.length > 0 ? (
                <SignalsGrid signals={signals} />
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isLive 
                      ? "Signals will appear as the conversation progresses..."
                      : "Start a call to detect wellness signals"
                    }
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
      </main>
    </div>
  );
};

export default Index;
