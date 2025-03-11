import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@radix-ui/react-select'
import { Label } from "@radix-ui/react-label"

interface VoiceRecorderProps {
  onTranslationComplete: (translations: {
    hindi: string;
    english: string;
    tamil: string;
    telugu: string;
    malayalam: string;
  }) => void;
}

export function VoiceRecorder({ onTranslationComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState("hi"); // Default to Hindi
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  // Language options
  const languageOptions = [
    { value: "hi", label: "Hindi" },
    { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
    { value: "ml", label: "Malayalam" }
  ];

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

    recognitionInstance.lang = sourceLanguage;
    recognitionInstance.continuous = true; 
    recognitionInstance.interimResults = true; 
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onstart = () => {
      toast({
        title: "Recording Started",
        description: "Speak in your selected language...",
      });
      setIsRecording(true);
      setCurrentTranscript(''); 
    };

    recognitionInstance.onresult = async (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(" ")
        .trim();

      const cleanedTranscript = transcript
        .replace(/([।\u0964])/g, "$1 ") 
        .replace(/(\S)(\s+)(\S)/g, "$1 $3") 
        .replace(/\s+/g, " ") 
        .trim();

      setCurrentTranscript(cleanedTranscript); 

      if (event.results[0].isFinal) {
        try {
          await translateText(cleanedTranscript);
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
      if (isRecording) {
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

  const translateText = async (text: string) => {
    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          sourceLanguage,
          targetLanguages: ['en', 'ta', 'te', 'ml']  
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to translate');
      }

      onTranslationComplete(data);
    } catch (error) {
      toast({
        title: "Translation Error",
        description: error instanceof Error ? error.message : "Failed to translate speech",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
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
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Label htmlFor="source-language">Input Language</Label>
        <Select 
          value={sourceLanguage} 
          onValueChange={setSourceLanguage}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languageOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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