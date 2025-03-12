import { useState, useEffect } from "react";
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
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
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

  // Cleanup function
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

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
    recognitionInstance.lang = sourceLanguage === 'hi' ? 'hi-IN' :
                            sourceLanguage === 'ta' ? 'ta-IN' :
                            sourceLanguage === 'te' ? 'te-IN' :
                            sourceLanguage === 'ml' ? 'ml-IN' :
                            'en-US';
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;

    recognitionInstance.onstart = () => {
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

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const transcript = Array.from(results)
        .map(result => result[0].transcript)
        .join(' ')
        .trim();

      setCurrentTranscript(transcript);

      // Also try to recognize English
      if (sourceLanguage !== 'en') {
        const englishTranscript = transcript; // For now, store the same transcript
        setEnglishTranscript(englishTranscript);
      }

      if (results[results.length - 1].isFinal) {
        onTranslationComplete({
          sourceText: transcript,
          englishRecognition: englishTranscript || transcript,
          [sourceLanguage === 'hi' ? 'hindi' :
          sourceLanguage === 'ta' ? 'tamil' :
          sourceLanguage === 'te' ? 'telugu' :
          sourceLanguage === 'ml' ? 'malayalam' :
          'english']: transcript
        });
      }
    };

    recognitionInstance.onend = () => {
      if (isRecording) {
        try {
          recognitionInstance.start();
        } catch (error) {
          console.error("Error restarting recognition:", error);
        }
      }
    };

    recognitionInstance.onerror = (event: { error: string }) => {
      if (event.error === 'no-speech') {
        return; // Ignore no-speech errors
      }
      console.error('Recognition error:', event);
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: `Error: ${event.error}. Please try again.`,
      });
    };

    try {
      recognitionInstance.start();
      setRecognition(recognitionInstance);
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
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }

    if (currentTranscript) {
      onTranslationComplete({
        sourceText: currentTranscript,
        englishRecognition: englishTranscript || currentTranscript,
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
              <p className="bg-muted p-2 rounded">{englishTranscript || currentTranscript}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}