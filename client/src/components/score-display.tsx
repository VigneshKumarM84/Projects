
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ScoreDisplayProps {
  scoreResult: {
    userAnswer: string;
    score: number;
    feedback: string;
  };
  systemTranslation: string;
  targetLanguage: "english" | "tamil";
}

export function ScoreDisplay({ scoreResult, systemTranslation, targetLanguage }: ScoreDisplayProps) {
  // Determine score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Translation Score 
          <Badge className={`text-white font-bold ${getScoreColor(scoreResult.score)}`}>
            {scoreResult.score}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-sm mb-1">Your {targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1)} Translation:</h3>
          <p className="p-3 bg-muted rounded-md">{scoreResult.userAnswer}</p>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium text-sm mb-1">System {targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1)} Translation:</h3>
          <p className="p-3 bg-muted rounded-md">{systemTranslation}</p>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium text-sm mb-1">Feedback:</h3>
          <p className="p-3 bg-muted rounded-md">{scoreResult.feedback}</p>
        </div>
      </CardContent>
    </Card>
  );
}
