import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AnswerInputProps {
  originalText: string;
  sourceLanguage: string;
  targetLanguage: string;
  onScoreResult?: (result: { score: number; feedback: string }) => void;
}

export function AnswerInput({ originalText, sourceLanguage, targetLanguage, onScoreResult }: AnswerInputProps) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null); // Added state for selected language
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast({
        title: "No answer provided",
        description: "Please enter your translation before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest("POST", "/api/score-translation", {
        originalText,
        userAnswer: answer,
        targetLanguage,
        sourceLanguage,
      });

      const result = await response.json();
      onScoreResult({
        score: result.score,
        feedback: result.feedback,
      });

      toast({
        title: "Answer submitted",
        description: "Your translation has been scored.",
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "An error occurred while scoring your translation.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLanguageClick = (lang: string) => {
    setSelectedLanguage(lang);
    //  In a real application, you'd use a more robust method to switch keyboard layout here.
    // This is a placeholder and won't reliably switch keyboard layouts across different operating systems or browsers.
    console.log(`Switching to ${lang} keyboard (placeholder implementation)`);

  };


  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Your {targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1)} Translation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Button onClick={() => handleLanguageClick('english')} variant={'ghost'}>English</Button>
          <Button onClick={() => handleLanguageClick('hindi')} variant={'ghost'}>Hindi</Button>
          <Button onClick={() => handleLanguageClick('tamil')} variant={'ghost'}>Tamil</Button>
          <Button onClick={() => handleLanguageClick('telugu')} variant={'ghost'}>Telugu</Button>
          <Button onClick={() => handleLanguageClick('malayalam')} variant={'ghost'}>Malayalam</Button>
        </div>
        <Textarea
          placeholder={`Enter your ${targetLanguage} translation here...`}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="min-h-[100px]"
          // data-language={selectedLanguage} //This is not reliably switching keyboard.
        />
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit for Scoring"}
        </Button>
      </CardContent>
    </Card>
  );
}