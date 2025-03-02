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
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="mt-4 p-4 bg-muted rounded-md space-y-3">
      <div className="flex items-center">
        <span className="font-bold mr-2">Score:</span>
        <span className={`font-bold text-xl ${getScoreColor(scoreResult.score)}`}>
          {scoreResult.score}/100
        </span>
      </div>

      <div>
        <p className="font-medium mb-1">Your Translation:</p>
        <p className="p-2 bg-background rounded">{scoreResult.userAnswer}</p>
      </div>

      <div>
        <p className="font-medium mb-1">System Translation:</p>
        <p className="p-2 bg-background rounded">{systemTranslation}</p>
      </div>

      <div>
        <p className="font-medium mb-1">Feedback:</p>
        <p className="p-2 bg-background rounded">{scoreResult.feedback}</p>
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
  const [tamilScoreResult, setTamilScoreResult] = useState<ScoreResult | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<"english" | "tamil">("english");

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
                  <Tabs defaultValue="english">
                    <TabsList className="w-full">
                      <TabsTrigger value="english" className="flex-1">English</TabsTrigger>
                      <TabsTrigger value="tamil" className="flex-1">Tamil</TabsTrigger>
                    </TabsList>

                    <TabsContent value="english">
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
                    </TabsContent>

                    <TabsContent value="tamil">
                      <AnswerInput 
                        originalText={translations.hindi} 
                        targetLanguage="tamil"
                        onScoreResult={setTamilScoreResult}
                      />

                      {tamilScoreResult && (
                        <ScoreDisplay 
                          scoreResult={tamilScoreResult}
                          systemTranslation={translations.tamil}
                          targetLanguage="tamil"
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}