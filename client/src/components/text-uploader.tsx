import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface TextUploaderProps {
  onTranslationComplete: (translations: {
    hindi: string;
    english: string;
    tamil: string;
    telugu: string;
    malayalam: string;
    wordByWord?: Array<{
      hindi: string;
      english: string;
      tamil: string;
      telugu: string;
      malayalam: string;
    }>;
  }) => void;
}

export function TextUploader({ onTranslationComplete }: TextUploaderProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('hi'); // Default to Hindi
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const languageOptions = [
    { value: 'hi', label: 'Hindi' },
    { value: 'ta', label: 'Tamil' },
    { value: 'te', label: 'Telugu' },
    { value: 'ml', label: 'Malayalam' },
  ];


  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'OCR processing failed');
        }

        setText(data.text);
        toast({
          title: "Image processed successfully",
          description: "Text extracted from image.",
        });
      } catch (error) {
        console.error('OCR error:', error);
        toast({
          title: "Image processing failed",
          description: error instanceof Error ? error.message : "Could not extract text from image",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      try {
        const text = await file.text();
        setText(text);
      } catch (error) {
        toast({
          title: "Error reading file",
          description: "Could not read the file content.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Unsupported file type",
        description: "Please upload a .txt file.",
        variant: "destructive",
      });
    }
  };

  const handleTranslate = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty Text",
        description: "Please enter some text to translate",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/translate/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          sourceLanguage,
          targetLanguages: ['en', 'ta', 'te', 'ml']  // Request all target languages
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
        description: error instanceof Error ? error.message : "Failed to translate text",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl">Hindi Text Input</CardTitle>
        <p className="text-sm text-muted-foreground">Upload a text file, image with Hindi text, or type directly</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full">
          <input
            type="file"
            id="file-upload"
            accept=".txt,image/*"
            onChange={handleFileUpload}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-slate-50 file:text-slate-700
              hover:file:bg-slate-100"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Source Language</label>
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
          <Textarea
            placeholder="Or type/paste text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px]"
            lang={sourceLanguage} // Set language attribute dynamically
            inputMode="text"
            dir="auto" // Let browser determine direction
            spellCheck={false}
          />
          <p className="text-xs text-gray-500">
            Keyboard shortcuts: Win+Space (Windows) or Command+Space (Mac) to switch input methods
          </p>
        </div>
        <Button
          className="w-full"
          onClick={handleTranslate}
          disabled={isLoading}
        >
          {isLoading ? "Translating..." : "Translate"}
        </Button>
      </CardContent>
    </Card>
  );
}