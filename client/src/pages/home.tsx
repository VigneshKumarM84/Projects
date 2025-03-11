import { useState } from "react";
import { VoiceRecorder } from "@/components/voice-recorder";
import { TextUploader } from "@/components/text-uploader";
import { TranslationDisplay } from "@/components/translation-display";
import { WordByWordTranslation } from "@/components/word-by-word-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LessonBrowser } from "@/components/lesson-browser";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnswerInput } from "@/components/answer-input";

interface ScoreResult {
  userAnswer: string;
  score: number;
  feedback: string;
}

interface Translation {
  sourceText: string;
  sourceLanguage: string;
  english?: string;
  tamil?: string;
  telugu?: string;
  malayalam?: string;
  hindi?: string;
  wordByWord?: Array<{
    sourceText: string;
    english: string;
    tamil: string;
    telugu: string;
    malayalam: string;
  }>;
  fullTranslation?: {
    english: string;
    tamil: string;
    telugu: string;
    malayalam: string;
  };
}

function ScoreDisplay({ score, feedback }: { score: number; feedback: string }) {
  let bgColor = "bg-red-100";
  let textColor = "text-red-800";

  if (score >= 85) {
    bgColor = "bg-green-100";
    textColor = "text-green-800";
  } else if (score >= 65) {
    bgColor = "bg-yellow-100";
    textColor = "text-yellow-800";
  } else if (score >= 40) {
    bgColor = "bg-orange-100";
    textColor = "text-orange-800";
  }

  return (
    <div className={`p-4 rounded-md ${bgColor} ${textColor} mt-4`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold">Score: {score}%</span>
      </div>
      <p className="mt-2">{feedback}</p>
    </div>
  );
}

export default function Home() {
  const [translations, setTranslations] = useState<Translation>({
    sourceText: "",
    sourceLanguage: "",
  });

  const [englishScoreResult, setEnglishScoreResult] = useState<ScoreResult | null>(null);
  const [tamilScoreResult, setTamilScoreResult] = useState<ScoreResult | null>(null);
  const [teluguScoreResult, setTeluguScoreResult] = useState<ScoreResult | null>(null);
  const [malayalamScoreResult, setMalayalamScoreResult] = useState<ScoreResult | null>(null);
  const [hindiScoreResult, setHindiScoreResult] = useState<ScoreResult | null>(null);

  const [selectedInputLanguage, setSelectedInputLanguage] = useState<string>("");
  const [inputMethod, setInputMethod] = useState<string>("");
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);

  // All available languages - UPDATED TO INCLUDE HINDI
  const allLanguages = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
    { value: "ml", label: "Malayalam" }
  ];

  // Filter out the selected input language from target language options
  const availableTargetLanguages = allLanguages.filter(lang => 
    lang.value !== selectedInputLanguage
  );

  // Handle target language selection/deselection
  const toggleTargetLanguage = (langCode: string) => {
    if (targetLanguages.includes(langCode)) {
      setTargetLanguages(targetLanguages.filter(lang => lang !== langCode));
    } else {
      setTargetLanguages([...targetLanguages, langCode]);
    }
  };

  // Map language codes to language names
  const languageNames: Record<string, string> = {
    sourceText: selectedInputLanguage === "en" ? "English" : 
                selectedInputLanguage === "hi" ? "Hindi" :
                selectedInputLanguage === "ta" ? "Tamil" :
                selectedInputLanguage === "te" ? "Telugu" :
                selectedInputLanguage === "ml" ? "Malayalam" : "Source",
    english: "English",
    hindi: "Hindi",
    tamil: "Tamil",
    telugu: "Telugu",
    malayalam: "Malayalam"
  };

  // Reset states when input language changes
  const handleInputLanguageChange = (lang: string) => {
    setSelectedInputLanguage(lang);
    setInputMethod("");
    setTargetLanguages([]);
    setTranslations({
      sourceText: "",
      sourceLanguage: lang,
    });
    setEnglishScoreResult(null);
    setTamilScoreResult(null);
    setTeluguScoreResult(null);
    setMalayalamScoreResult(null);
    setHindiScoreResult(null);
  };

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-2">Indian Language Translator</h1>
      <p className="text-center text-slate-600 mb-6">Translate between Indian languages and practice your translations</p>

      <div className="bg-slate-50 p-4 rounded-md mx-auto max-w-3xl text-left border border-slate-200 mb-6">
        <h3 className="font-semibold text-lg mb-2">How to Use This App:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li><span className="font-medium">Select Input Language:</span> Choose the source language you want to translate from.</li>
          <li><span className="font-medium">Choose Input Method:</span> Select voice input or text input.</li>
          <li><span className="font-medium">Select Target Languages:</span> Choose which languages you want to translate to.</li>
          <li><span className="font-medium">Translation Practice:</span> Enter your translation to get feedback.</li>
        </ol>
      </div>

      {/* Step 1: Select Input Language */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 1: Select Input Language</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleInputLanguageChange} value={selectedInputLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select input language" />
            </SelectTrigger>
            <SelectContent>
              {allLanguages.map(lang => (
                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Step 2: Select Input Method (only if input language is selected) */}
      {selectedInputLanguage && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 2: Choose Input Method</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={inputMethod} onValueChange={setInputMethod}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="voice">Voice Input</TabsTrigger>
                <TabsTrigger value="text">Text Input</TabsTrigger>
              </TabsList>
              <div className="mt-2 text-center">
                <a href="https://www.google.com/inputtools/try/" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                  Need help typing in Indian languages? Try Google Input Tools
                </a>
              </div>

              {inputMethod === "voice" && (
                <TabsContent value="voice">
                  <Card>
                    <CardHeader>
                      <CardTitle>Record Voice in {languageNames[selectedInputLanguage === "en" ? "english" : selectedInputLanguage === "hi" ? "hindi" : selectedInputLanguage === "ta" ? "tamil" : selectedInputLanguage === "te" ? "telugu" : "malayalam"]}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <VoiceRecorder
                        sourceLanguage={selectedInputLanguage}
                        onTranslationComplete={(translations) => {
                          // Map the source text based on the selected input language
                          const sourceText = 
                            selectedInputLanguage === "hi" ? translations.hindi :
                            selectedInputLanguage === "ta" ? translations.tamil :
                            selectedInputLanguage === "te" ? translations.telugu :
                            selectedInputLanguage === "ml" ? translations.malayalam :
                            translations.english;

                          setTranslations({
                            sourceText,
                            english: translations.english,
                            tamil: translations.tamil,
                            telugu: translations.telugu,
                            malayalam: translations.malayalam,
                            sourceLanguage: selectedInputLanguage,
                          });
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {inputMethod === "text" && (
                <TabsContent value="text">
                  <Card>
                    <CardHeader>
                      <CardTitle>Enter Text in {languageNames[selectedInputLanguage === "en" ? "english" : selectedInputLanguage === "hi" ? "hindi" : selectedInputLanguage === "ta" ? "tamil" : selectedInputLanguage === "te" ? "telugu" : "malayalam"]}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TextUploader
                        sourceLanguage={selectedInputLanguage}
                        onTextReceived={(text) => {
                          setTranslations({
                            sourceText: text,
                            sourceLanguage: selectedInputLanguage,
                          });
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Select Target Languages (only if input method is selected) */}
      {selectedInputLanguage && inputMethod && translations.sourceText && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 3: Select Target Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableTargetLanguages.map(lang => (
                <Button
                  key={lang.value}
                  variant={targetLanguages.includes(lang.value) ? "default" : "outline"}
                  onClick={() => toggleTargetLanguage(lang.value)}
                  className="mb-2"
                >
                  {lang.label}
                </Button>
              ))}
            </div>

            {targetLanguages.length > 0 && (
              <div className="mt-6">
                <TranslationDisplay
                  translations={translations}
                  selectedLanguages={targetLanguages}
                  languageNames={languageNames}
                />

                {translations.wordByWord && translations.wordByWord.length > 0 && targetLanguages.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Word-by-Word Translation</h3>
                    <WordByWordTranslation 
                      translations={translations.wordByWord} 
                      targetLanguage={
                        targetLanguages.includes("ta") ? "tamil" :
                        targetLanguages.includes("te") ? "telugu" :
                        targetLanguages.includes("ml") ? "malayalam" :
                        targetLanguages.includes("hi") ? "hindi" : "english"
                      } 
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Translation Practice */}
      {selectedInputLanguage && inputMethod && translations.sourceText && targetLanguages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Practice Your Translation</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={targetLanguages[0]}>
              <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${targetLanguages.length}, minmax(0, 1fr))` }}>
                {targetLanguages.map(lang => {
                  const langName = allLanguages.find(l => l.value === lang)?.label || lang;
                  return (
                    <TabsTrigger key={lang} value={lang}>{langName}</TabsTrigger>
                  );
                })}
              </TabsList>

              {targetLanguages.map(lang => {
                const langName = lang === "en" ? "english" : 
                               lang === "hi" ? "hindi" : 
                               lang === "ta" ? "tamil" : 
                               lang === "te" ? "telugu" : "malayalam";

                const setScoreResult = lang === "en" ? setEnglishScoreResult :
                                     lang === "hi" ? setHindiScoreResult :
                                     lang === "ta" ? setTamilScoreResult :
                                     lang === "te" ? setTeluguScoreResult : setMalayalamScoreResult;

                const scoreResult = lang === "en" ? englishScoreResult :
                                  lang === "hi" ? hindiScoreResult :
                                  lang === "ta" ? tamilScoreResult :
                                  lang === "te" ? teluguScoreResult : malayalamScoreResult;

                return (
                  <TabsContent key={lang} value={lang}>
                    <AnswerInput 
                      originalText={translations.sourceText}
                      sourceLanguage={translations.sourceLanguage}
                      targetLanguage={langName}
                      onScoreResult={setScoreResult}
                    />
                    {scoreResult && (
                      <ScoreDisplay 
                        score={scoreResult.score} 
                        feedback={scoreResult.feedback} 
                      />
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}