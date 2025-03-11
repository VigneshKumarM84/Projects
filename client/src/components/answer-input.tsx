
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AnswerInputProps {
  originalText: string;
  sourceLanguage: string;
  targetLanguage: "english" | "hindi" | "tamil" | "telugu" | "malayalam";
  onScoreResult: (score: {
    userAnswer: string;
    score: number;
    feedback: string;
  }) => void;
}

export function AnswerInput({ originalText, sourceLanguage, targetLanguage, onScoreResult }: AnswerInputProps) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        userAnswer: answer,
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

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Your {targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1)} Translation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder={`Enter your ${targetLanguage} translation here...`}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="min-h-[100px]"
        />
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit for Scoring"}
        </Button>
      </CardContent>
    </Card>
  );
}
