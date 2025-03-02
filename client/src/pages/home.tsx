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
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Voice & Text Translation</h1>
          <p className="text-muted-foreground">
            Translate Hindi to English using voice or text
          </p>

          <div className="bg-slate-50 p-4 rounded-md mx-auto max-w-3xl text-left border border-slate-200">
            <h3 className="font-semibold text-lg mb-2">How to Use This App:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><span className="font-medium">Voice Input:</span> Click the microphone button and speak Hindi to translate.</li>
              <li><span className="font-medium">Text Input:</span> Type or paste Hindi text and click "Translate".</li>
              <li><span className="font-medium">Practice Exercises:</span> Select a pre-made exercise from the list below to practice translation.</li>
              <li><span className="font-medium">Translation Practice:</span> Enter your translation in the text area and click "Check My Translation" to get feedback.</li>
            </ol>
          </div>
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
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Select Exercise (Hindi):</h3>
                    <div className="grid gap-2">
                      <Button 
                        variant="outline" 
                        className="justify-start text-left w-full" 
                        onClick={() => setTranslations({
                          ...translations,
                          hindi: "मैं आज बहुत खुश हूँ।",
                          english: "I am very happy today."
                        })}
                      >
                        <span className="truncate">Exercise 1: मैं आज बहुत खुश हूँ।</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start text-left w-full" 
                        onClick={() => setTranslations({
                          ...translations,
                          hindi: "मेरा नाम रोहन है और मैं भारत से हूँ।",
                          english: "My name is Rohan and I am from India."
                        })}
                      >
                        <span className="truncate">Exercise 2: मेरा नाम रोहन है और मैं भारत से हूँ।</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start text-left w-full" 
                        onClick={() => setTranslations({
                          ...translations,
                          hindi: "क्या आप हिंदी बोल सकते हैं?",
                          english: "Can you speak Hindi?"
                        })}
                      >
                        <span className="truncate">Exercise 3: क्या आप हिंदी बोल सकते हैं?</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start text-left w-full" 
                        onClick={() => setTranslations({
                          ...translations,
                          hindi: "भारत में बहुत सारे त्योहार मनाए जाते हैं।",
                          english: "Many festivals are celebrated in India."
                        })}
                      >
                        <span className="truncate">Exercise 4: भारत में बहुत सारे त्योहार मनाए जाते हैं।</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}