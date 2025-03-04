import { useState, useEffect } from "react";
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
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast({
        variant: "destructive",
        title: "Browser Not Supported",
        description: "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
      });
      return;
    }

    // Check microphone permission
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setHasMicPermission(true))
      .catch(() => setHasMicPermission(false));
  }, [toast]);

  const startRecording = async () => {
    if (!hasMicPermission) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicPermission(true);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice recording.",
        });
        return;
      }
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast({
        variant: "destructive",
        title: "Browser Not Supported",
        description: "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
      });
      return;
    }
    const recognitionInstance = new SpeechRecognitionAPI();

    recognitionInstance.lang = "hi-IN";
    recognitionInstance.continuous = true; // Set to true to prevent auto-stopping
    recognitionInstance.interimResults = true; // Set to true to show results as user speaks
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onstart = () => {
      toast({
        title: "Recording Started",
        description: "Speak in Hindi...",
      });
      setIsRecording(true);
      setCurrentTranscript(''); // Clear transcript on start
    };

    recognitionInstance.onresult = async (event) => {
      // Get the most accurate transcript
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(" ")
        .trim();

      // Clean up the transcript (add spaces between words if needed)
      const cleanedTranscript = transcript
        .replace(/([।\u0964])/g, "$1 ") // Add space after Devanagari danda
        .replace(/(\S)(\s+)(\S)/g, "$1 $3") // Ensure single spaces between words
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim();

      setCurrentTranscript(cleanedTranscript); // Update transcript

      // Final result processing
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
            description: "Failed to translate the text. Please try again.",
          });
        }
      }
    };

    recognitionInstance.onerror = (event) => {
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: `Error: ${event.error}. Please try again.`,
      });
      stopRecording();
    };

    recognitionInstance.onend = () => {
      // Only stop recording if manually stopped by user
      if (isRecording) {
        // Attempt to restart recognition if it stops unexpectedly
        try {
          recognitionInstance.start();
        } catch (error) {
          console.error("Could not restart recording:", error);
          setIsRecording(false);
          toast({
            title: "Recording Ended",
            description: "Recording stopped unexpectedly. Please try again.",
          });
        }
      } else {
        setIsRecording(false);
        toast({
          title: "Recording Ended",
          description: "Processing your speech...",
        });
      }
    };

    try {
      recognitionInstance.start();
      setRecognition(recognitionInstance);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start recording. Please try again.",
      });
    }
  };

  const stopRecording = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
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
        disabled={hasMicPermission === false}
      >
        {isRecording ? (
          <StopCircle className="h-16 w-16" />
        ) : (
          <Mic className="h-16 w-16" />
        )}
      </Button>
      <p className="text-sm text-muted-foreground">
        {hasMicPermission === false
          ? "Microphone access denied. Please check browser permissions."
          : isRecording
          ? "Recording... Click to stop"
          : "Click to start recording"}
      </p>
      <div>
        <p>Recognized Text:</p>
        <pre>{currentTranscript}</pre>
      </div>
    </div>
  );
}