import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TextUploaderProps {
  onTranslationComplete: (translations: {
    hindi: string;
    english: string;
    tamil: string;
    wordByWord?: Array<{
      hindi: string;
      english: string;
      tamil: string;
    }>;
  }) => void;
}

export function TextUploader({ onTranslationComplete }: TextUploaderProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      if (file.type.startsWith('image/')) {
        // Handle image file
        const formData = new FormData();
        formData.append('image', file);

        toast({
          title: "Processing Image",
          description: "Extracting text from your image...",
        });

        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'OCR failed');
        }

        if (!data.text?.trim()) {
          throw new Error('No Hindi text could be detected in the image. Please ensure the image is clear and contains Hindi text.');
        }

        setText(data.text);
        toast({
          title: "Success",
          description: "Text extracted from image successfully! You can now translate it.",
        });
      } else {
        // Handle text file
        toast({
          title: "Processing File",
          description: "Reading text file...",
        });

        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content.trim()) {
            setText(content);
            toast({
              title: "Success",
              description: "Text file loaded successfully! You can now translate it.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: "The file appears to be empty. Please upload a file containing Hindi text.",
            });
          }
        };
        reader.readAsText(file);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process the file. Please try a different image or ensure it contains clear Hindi text.",
      });
      setText("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!text.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter or upload some Hindi text",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/translate/text", {
        text: text.trim(),
      });
      const translations = await response.json();
      onTranslationComplete(translations);
      toast({
        title: "Success",
        description: "Text translated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Translation Error",
        description: "Failed to translate the text. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload or Type Hindi Text</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <label htmlFor="file-upload" className="w-full">
            <Button
              variant="outline"
              className="w-full"
              type="button"
              disabled={isLoading}
              asChild
            >
              <div className="flex items-center justify-center w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Text or Image File
              </div>
            </Button>
          </label>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".txt,image/*"
            className="sr-only"
            onChange={handleFileUpload}
          />
        </div>
        <Textarea
          placeholder="Or type/paste Hindi text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[100px]"
        />
        <Button
          className="w-full"
          onClick={handleTranslate}
          disabled={isLoading || !text.trim()}
        >
          {isLoading ? "Processing..." : "Translate"}
        </Button>
      </CardContent>
    </Card>
  );
}