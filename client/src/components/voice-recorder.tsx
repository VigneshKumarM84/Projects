import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface VoiceRecorderProps {
  sourceLanguage: string;
  onTranslationComplete: (translations: {
    sourceText: string;
    englishRecognition: string;
    hindi?: string;
    english?: string;
    tamil?: string;
    telugu?: string;
    malayalam?: string;
    pitman?: string;
  }) => void;
}

export function VoiceRecorder({ sourceLanguage, onTranslationComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [englishTranscript, setEnglishTranscript] = useState<string>('');
  const [sourceRecognition, setSourceRecognition] = useState<SpeechRecognition | null>(null);
  const [englishRecognition, setEnglishRecognition] = useState<SpeechRecognition | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast({
        variant: "destructive",
        title: "Browser Not Supported",
        description: "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
      });
      return;
    }

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

    const newSourceRecognition = new SpeechRecognitionAPI();
    const newEnglishRecognition = new SpeechRecognitionAPI();

    // Configure source language recognition
    newSourceRecognition.lang = sourceLanguage === 'hi' ? 'hi-IN' :
                               sourceLanguage === 'ta' ? 'ta-IN' :
                               sourceLanguage === 'te' ? 'te-IN' :
                               sourceLanguage === 'ml' ? 'ml-IN' :
                               'en-US';
    newSourceRecognition.continuous = true;
    newSourceRecognition.interimResults = true;

    // Configure English recognition
    newEnglishRecognition.lang = 'en-US';
    newEnglishRecognition.continuous = true;
    newEnglishRecognition.interimResults = true;

    // Source recognition event handlers
    newSourceRecognition.onstart = () => {
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: `Speak in ${
          sourceLanguage === 'hi' ? 'Hindi' :
          sourceLanguage === 'ta' ? 'Tamil' :
          sourceLanguage === 'te' ? 'Telugu' :
          sourceLanguage === 'ml' ? 'Malayalam' :
          'English'
        }...`,
      });
    };

    newSourceRecognition.onend = () => {
      // Restart recognition if we're still supposed to be recording
      if (isRecording) {
        try {
          newSourceRecognition.start();
        } catch (error) {
          console.error("Error restarting source recognition:", error);
        }
      }
    };

    newSourceRecognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(" ")
        .trim();

      setCurrentTranscript(transcript);

      if (event.results[0].isFinal) {
        onTranslationComplete({
          sourceText: transcript,
          englishRecognition: englishTranscript,
          [sourceLanguage === 'hi' ? 'hindi' :
           sourceLanguage === 'ta' ? 'tamil' :
           sourceLanguage === 'te' ? 'telugu' :
           sourceLanguage === 'ml' ? 'malayalam' :
           'english']: transcript
        });
      }
    };

    // English recognition event handlers
    newEnglishRecognition.onend = () => {
      // Restart recognition if we're still supposed to be recording
      if (isRecording) {
        try {
          newEnglishRecognition.start();
        } catch (error) {
          console.error("Error restarting English recognition:", error);
        }
      }
    };

    newEnglishRecognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(" ")
        .trim();

      setEnglishTranscript(transcript);
    };

    // Error handlers
    const handleError = (error: any) => {
      console.error('Recognition error:', error);
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: `Error: ${error.error}. Please try again.`,
      });
    };

    newSourceRecognition.onerror = handleError;
    newEnglishRecognition.onerror = handleError;

    // Start both recognitions
    try {
      newSourceRecognition.start();
      newEnglishRecognition.start();
      setSourceRecognition(newSourceRecognition);
      setEnglishRecognition(newEnglishRecognition);
    } catch (error) {
      console.error("Failed to start recognition:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start recording. Please try again.",
      });
    }
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (sourceRecognition) {
      try {
        sourceRecognition.stop();
      } catch (error) {
        console.error("Error stopping source recognition:", error);
      }
    }

    if (englishRecognition) {
      try {
        englishRecognition.stop();
      } catch (error) {
        console.error("Error stopping English recognition:", error);
      }
    }

    if (currentTranscript || englishTranscript) {
      onTranslationComplete({
        sourceText: currentTranscript,
        englishRecognition: englishTranscript,
        [sourceLanguage === 'hi' ? 'hindi' :
         sourceLanguage === 'ta' ? 'tamil' :
         sourceLanguage === 'te' ? 'telugu' :
         sourceLanguage === 'ml' ? 'malayalam' :
         'english']: currentTranscript
      });
    }

    toast({
      title: "Recording Ended",
      description: "Processing your speech...",
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col items-center justify-center">
        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          onClick={isRecording ? stopRecording : startRecording}
          className="w-40 h-40 rounded-full mb-2"
          disabled={hasMicPermission === false}
        >
          {isRecording ? (
            <StopCircle className="h-16 w-16" />
          ) : (
            <Mic className="h-16 w-16" />
          )}
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          {hasMicPermission === false
            ? "Microphone access denied. Please check browser permissions."
            : isRecording
            ? "Recording... Click to stop"
            : "Click to start recording"}
        </p>
      </div>

      {(currentTranscript || englishTranscript) && (
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Recognized Text:</h3>
              <p className="bg-muted p-2 rounded">{currentTranscript}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">English Recognition:</h3>
              <p className="bg-muted p-2 rounded">{englishTranscript}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}