import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { Mic, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@radix-ui/react-select'
import { Label } from "@radix-ui/react-label"

interface VoiceRecorderProps {
  sourceLanguage?: string;
  onTranslationComplete: (translations: {
    hindi: string;
    english: string;
    tamil: string;
    telugu: string;
    malayalam: string;
    pitman: string; // Added Pitman
  }) => void;
}

export function VoiceRecorder({ sourceLanguage: propSourceLanguage = "hi", onTranslationComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState(propSourceLanguage);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();
  const [showRecordingEnded, setShowRecordingEnded] = useState(false); // Added state for popup

  // Auto-hide recording ended popup after 3 seconds
  useEffect(() => {
    let timer: number;
    if (showRecordingEnded) {
      timer = window.setTimeout(() => {
        setShowRecordingEnded(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showRecordingEnded]);

  // Language options
  const languageOptions = [
    { value: "hi", label: "Hindi" },
    { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
    { value: "ml", label: "Malayalam" },
    { value: "en", label: "English" },
    { value: "pitman", label: "Pitman Shorthand" } // Added Pitman
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

    // Configure the recognition language based on selection
    switch(sourceLanguage) {
      case 'hi':
        recognitionInstance.lang = 'hi-IN'; // Hindi
        break;
      case 'ta':
        recognitionInstance.lang = 'ta-IN'; // Tamil
        break;
      case 'te':
        recognitionInstance.lang = 'te-IN'; // Telugu
        break;
      case 'ml':
        recognitionInstance.lang = 'ml-IN'; // Malayalam
        break;
      case 'en':
        recognitionInstance.lang = 'en-US'; // English
        break;
      case 'pitman':
        //Handle Pitman -  This requires a specialized speech recognition engine for Pitman shorthand.  This is beyond the scope of this example.
        recognitionInstance.lang = 'en-US'; // Placeholder - Needs a Pitman-specific language code
        break;
      default:
        recognitionInstance.lang = 'hi-IN'; // Default to Hindi
    }
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
        setShowRecordingEnded(true); // Show popup on recording end
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
      // Get all target languages except the source language
      const targetLangs = ['en', 'ta', 'te', 'ml', 'hi', 'pitman'].filter(lang => lang !== sourceLanguage);

      console.log(`Requesting translation from ${sourceLanguage} to: ${targetLangs.join(', ')}`);

      const response = await fetch('/api/translate/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          sourceLanguage,
          targetLanguages: targetLangs
        }),
      });

      const data = await response.json();

      // Log what we received - for debugging
      console.log("Translation data:", {
        sourceLanguage,
        recognizedText: text,
        translations: {
          hindi: data.hindi || '',
          english: data.english || '',
          tamil: data.tamil || '',
          telugu: data.telugu || '',
          malayalam: data.malayalam || '',
          pitman: data.pitman || '' // Added Pitman
        }
      });

      if (!response.ok) {
        throw new Error(data.message || 'Failed to translate');
      }

      // Create a translations object with the recognized source text in the correct language field
      const translations = {
        hindi: sourceLanguage === 'hi' ? text : data.hindi || '',
        english: sourceLanguage === 'en' ? text : data.english || '',
        tamil: sourceLanguage === 'ta' ? text : data.tamil || '',
        telugu: sourceLanguage === 'te' ? text : data.telugu || '',
        malayalam: sourceLanguage === 'ml' ? text : data.malayalam || '',
        pitman: sourceLanguage === 'pitman' ? text : data.pitman || '' // Added Pitman
      };

      // Log translations for debugging
      console.log("Translation data:", { 
        sourceLanguage, 
        recognizedText: text,
        translations
      });

      onTranslationComplete(translations);
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

      <div className="mt-4">
        <p>Recognized Text:</p>
        <pre>{currentTranscript}</pre>
      </div>
    </div>
  );
}