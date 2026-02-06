import { cn } from "@/lib/utils";
import { Upload, FileAudio, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState, useCallback } from "react";

interface AudioUploaderProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
  className?: string;
}

export function AudioUploader({ onFileSelected, isProcessing, className }: AudioUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const acceptTypes = "audio/*,.mp3,.wav,.m4a,.ogg,.webm,.flac,.aac";

  const handleFile = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn("w-full", className)}>
      {!selectedFile ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300",
            dragOver
              ? "border-terracotta bg-terracotta-light/50"
              : "border-border hover:border-terracotta/40 hover:bg-muted/30"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes}
            onChange={handleChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-xl bg-terracotta-light flex items-center justify-center">
              <Upload className="h-7 w-7 text-terracotta" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Drop your audio file here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse — MP3, WAV, M4A, OGG supported
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-5 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-terracotta-light flex items-center justify-center flex-shrink-0">
              <FileAudio className="h-6 w-6 text-terracotta" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatSize(selectedFile.size)}
              </p>
            </div>
            {!isProcessing && (
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            onClick={() => onFileSelected(selectedFile)}
            disabled={isProcessing}
            className="w-full mt-4 gap-2 bg-terracotta hover:bg-terracotta/90 text-primary-foreground"
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileAudio className="h-4 w-4" />
                Analyse Recording
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
