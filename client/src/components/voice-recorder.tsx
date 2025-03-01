import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface VoiceRecorderProps {
  onTranslationComplete: (translations: {
    hindi: string;
    english: string;
    tamil: string;
  }) => void;
}

export function VoiceRecorder({ onTranslationComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const startRecording = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Speech recognition is not supported in your browser",
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = "hi-IN";
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;

    recognitionInstance.onresult = async (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join("");

      if (event.results[0].isFinal) {
        try {
          const response = await apiRequest("POST", "/api/translate", {
            text: transcript,
          });
          const translations = await response.json();
          onTranslationComplete(translations);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Translation Error",
            description: "Failed to translate the text",
          });
        }
      }
    };

    recognitionInstance.onerror = (event) => {
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: event.error,
      });
      stopRecording();
    };

    recognitionInstance.start();
    setRecognition(recognitionInstance);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }
    setIsRecording(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        size="lg"
        variant={isRecording ? "destructive" : "default"}
        onClick={isRecording ? stopRecording : startRecording}
        className="w-40 h-40 rounded-full"
      >
        {isRecording ? (
          <StopCircle className="h-16 w-16" />
        ) : (
          <Mic className="h-16 w-16" />
        )}
      </Button>
      <p className="text-sm text-muted-foreground">
        {isRecording ? "Recording... Click to stop" : "Click to start recording"}
      </p>
    </div>
  );
}
