import { useState } from "react";
import { VoiceRecorder } from "@/components/voice-recorder";
import { TextUploader } from "@/components/text-uploader";
import { TranslationDisplay } from "@/components/translation-display";
import { WordByWordTranslation } from "@/components/word-by-word-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


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
    // Placeholder for API call to score the answer
    const score = await fetch(`/api/score?original=${encodeURIComponent(originalText)}&translation=${encodeURIComponent(userAnswer)}&language=${targetLanguage}`, {
      method: "POST",
    }).then(res => res.json());

    onScoreResult({ userAnswer, score: score.score, feedback: score.feedback });
  };

  return (
    <>
      <label htmlFor="user-answer" className="block text-sm font-medium mb-2">Your {targetLanguage} Translation:</label>
      <textarea
        id="user-answer"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2"
        rows={5}
      />
      <button onClick={handleSubmit} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit</button>
    </>
  );
}

// Define the ScoreResult type
interface ScoreResult {
  userAnswer: string;
  score: number;
  feedback: string;
}

function ScoreDisplay({ scoreResult, systemTranslation, targetLanguage }: { scoreResult: ScoreResult; systemTranslation: string; targetLanguage: "english" | "tamil" }) {
  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
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
        <p className="p-2 bg-gray-100 rounded">{systemTranslation}</p>
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
                  <Tabs defaultValue="english" onValueChange={(value) => setActiveLanguage(value as "english" | "tamil")}>
                    <TabsList className="w-full">
                      <TabsTrigger value="english" className="flex-1">English</TabsTrigger>
                      <TabsTrigger value="tamil" className="flex-1">Tamil</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="english">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="font-medium">Translate the text to English:</p>
                          <textarea 
                            className="w-full min-h-[120px] p-3 border rounded-md"
                            placeholder="Enter your English translation..."
                            onChange={(e) => {
                              // Store the translation locally
                              localStorage.setItem('userEnglishTranslation', e.target.value);
                            }}
                            defaultValue={localStorage.getItem('userEnglishTranslation') || ''}
                          />
                          <button 
                            className="px-4 py-2 bg-primary text-white rounded-md"
                            onClick={async () => {
                              const userAnswer = localStorage.getItem('userEnglishTranslation') || '';
                              
                              try {
                                const result = await fetch('/api/score-translation', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    originalText: translations.hindi,
                                    userAnswer,
                                    targetLanguage: "english"
                                  }),
                                }).then(res => res.json());
                                
                                setEnglishScoreResult({
                                  userAnswer,
                                  score: result.score,
                                  feedback: result.feedback
                                });
                              } catch (error) {
                                console.error('Scoring error:', error);
                              }
                            }}
                          >
                            Check My Translation
                          </button>
                        </div>
                        
                        {englishScoreResult && (
                          <div className="p-4 bg-muted rounded-md">
                            <ScoreDisplay 
                              scoreResult={englishScoreResult} 
                              systemTranslation={translations.english} 
                              targetLanguage="english" 
                            />
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="tamil">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="font-medium">Translate the text to Tamil:</p>
                          <textarea 
                            className="w-full min-h-[120px] p-3 border rounded-md"
                            placeholder="Enter your Tamil translation..."
                            onChange={(e) => {
                              // Store the translation locally
                              localStorage.setItem('userTamilTranslation', e.target.value);
                            }}
                            defaultValue={localStorage.getItem('userTamilTranslation') || ''}
                          />
                          <button 
                            className="px-4 py-2 bg-primary text-white rounded-md"
                            onClick={async () => {
                              const userAnswer = localStorage.getItem('userTamilTranslation') || '';
                              
                              try {
                                const result = await fetch('/api/score-translation', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    originalText: translations.hindi,
                                    userAnswer,
                                    targetLanguage: "tamil"
                                  }),
                                }).then(res => res.json());
                                
                                setTamilScoreResult({
                                  userAnswer,
                                  score: result.score,
                                  feedback: result.feedback
                                });
                              } catch (error) {
                                console.error('Scoring error:', error);
                              }
                            }}
                          >
                            Check My Translation
                          </button>
                        </div>
                        
                        {tamilScoreResult && (
                          <div className="p-4 bg-muted rounded-md">
                            <ScoreDisplay 
                              scoreResult={tamilScoreResult} 
                              systemTranslation={translations.tamil} 
                              targetLanguage="tamil" 
                            />
                          </div>
                        )}
                      </div>
                    </TabsContent>

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