import { useState } from "react";
import { VoiceRecorder } from "@/components/voice-recorder";
import { TextUploader } from "@/components/text-uploader";
import { TranslationDisplay } from "@/components/translation-display";
import { WordByWordTranslation } from "@/components/word-by-word-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";


interface Translation {
  hindi: string;
  english: string;
  tamil: string;
  wordByWord?: Array<{
    hindi: string;
    english: string;
    tamil: string;
  }>;
}

interface ScoreResult {
  userAnswer: string;
  score: number;
  feedback: string;
}

function AnswerInput({ originalText, targetLanguage, onScoreResult }: { originalText: string; targetLanguage: "english" | "tamil"; onScoreResult: (result: ScoreResult | null) => void }) {
  const [userAnswer, setUserAnswer] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/score-translation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText,
          userAnswer,
          targetLanguage
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      onScoreResult({ userAnswer, score: result.score, feedback: result.feedback });
    } catch (error) {
      console.error('Scoring error:', error);
      onScoreResult(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="font-medium">Translate the Hindi text to {targetLanguage}:</p>
        <textarea 
          className="w-full min-h-[120px] p-3 border rounded-md"
          placeholder={`Enter your ${targetLanguage} translation...`}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
        />
        <Button onClick={handleSubmit}>Check My Translation</Button>
      </div>
    </div>
  );
}

function ScoreDisplay({ scoreResult, systemTranslation, targetLanguage }: { scoreResult: ScoreResult; systemTranslation: string; targetLanguage: "english" | "tamil" }) {
  // Get color based on score with more generous thresholds
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 45) return "text-yellow-600";
    return "text-amber-600"; // Less harsh than red
  };

  // Check if the translation appears to be unsuccessful
  const isInvalidTranslation = (translation: string) => {
    return translation.includes("Translation to") || 
           translation.includes("unavailable") ||
           translation.includes("[Hindi");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <span className="font-bold mr-2">Score:</span>
        <span className={`font-bold text-xl ${getScoreColor(scoreResult.score)}`}>
          {scoreResult.score}/100
        </span>
      </div>

      <div>
        <p className="font-medium mb-1">Your Translation:</p>
        <p className="p-2 bg-gray-100 rounded">{scoreResult.userAnswer}</p>
      </div>

      <div>
        <p className="font-medium mb-1">System Translation:</p>
        <p className="p-2 bg-gray-100 rounded">
          {isInvalidTranslation(systemTranslation) ? 
            <span className="text-amber-600">Translation API may be unavailable - please try again later</span> : 
            systemTranslation
          }
        </p>
      </div>

      <div>
        <p className="font-medium mb-1">Feedback:</p>
        <p className="p-2 bg-gray-100 rounded">{scoreResult.feedback}</p>
      </div>
    </div>
  );
}


export default function Home() {
  const [translations, setTranslations] = useState<Translation>({
    hindi: "",
    english: "",
    tamil: "",
    wordByWord: [],
  });

  const [englishScoreResult, setEnglishScoreResult] = useState<ScoreResult | null>(null);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Voice & Text Translation</h1>
          <p className="text-muted-foreground">
            Translate Hindi to English and Tamil using voice or text
          </p>
        </div>

        <Tabs defaultValue="voice">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="voice">Voice Input</TabsTrigger>
            <TabsTrigger value="text">Text Input</TabsTrigger>
          </TabsList>

          <TabsContent value="voice">
            <Card>
              <CardHeader>
                <CardTitle>Record Voice</CardTitle>
              </CardHeader>
              <CardContent>
                <VoiceRecorder onTranslationComplete={setTranslations} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="text">
            <TextUploader onTranslationComplete={setTranslations} />
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <TranslationDisplay translations={translations} />

          {translations.wordByWord && translations.wordByWord.length > 0 && (
            <WordByWordTranslation translations={translations.wordByWord} />
          )}

          {translations.hindi && (
            <>
              <Separator className="my-4" />
              <Card>
                <CardHeader>
                  <CardTitle>Practice Your Translation Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnswerInput 
                    originalText={translations.hindi} 
                    targetLanguage="english"
                    onScoreResult={setEnglishScoreResult}
                  />

                  {englishScoreResult && (
                    <ScoreDisplay 
                      scoreResult={englishScoreResult}
                      systemTranslation={translations.english}
                      targetLanguage="english"
                    />
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}