
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScoreResult {
  userAnswer: string;
  score: number;
  feedback: string;
}

interface ScoreDisplayProps {
  scoreResult: ScoreResult;
  systemTranslation: string;
  targetLanguage: "english" | "tamil";
}

export function ScoreDisplay({ 
  scoreResult, 
  systemTranslation, 
  targetLanguage 
}: ScoreDisplayProps) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Score Result
          <Badge variant={scoreResult.score > 70 ? "success" : "destructive"}>
            {scoreResult.score}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold mb-1">Your Translation:</h3>
          <p className="p-2 bg-muted rounded-md">{scoreResult.userAnswer}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-1">System Translation:</h3>
          <p className="p-2 bg-muted rounded-md">{systemTranslation}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-1">Feedback:</h3>
          <p className="p-2 bg-muted rounded-md">{scoreResult.feedback}</p>
        </div>
      </CardContent>
    </Card>
  );
}
