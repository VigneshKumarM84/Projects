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

        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('OCR failed');
        const data = await response.json();
        setText(data.text);
      } else {
        // Handle text file
        const reader = new FileReader();
        reader.onload = (e) => {
          setText(e.target?.result as string);
        };
        reader.readAsText(file);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process the file. Please try again.",
      });
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
          <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={isLoading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Text or Image File
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".txt,image/*"
            className="hidden"
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