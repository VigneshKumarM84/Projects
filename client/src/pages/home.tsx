import { useState } from "react";
import { VoiceRecorder } from "@/components/voice-recorder";
import { TextUploader } from "@/components/text-uploader";
import { TranslationDisplay } from "@/components/translation-display";
import { WordByWordTranslation } from "@/components/word-by-word-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnswerInput } from "@/components/answer-input";

interface Translation {
  sourceText: string;
  sourceLanguage: string;
  english?: string;
  tamil?: string;
  telugu?: string;
  malayalam?: string;
  hindi?: string;
  pitman?: string;
  wordByWord?: Array<{
    sourceText: string;
    english: string;
    tamil: string;
    telugu: string;
    malayalam: string;
  }>;
}

interface ScoreResult {
  userAnswer: string;
  score: number;
  feedback: string;
}

export default function Home() {
  // Initialize with Hindi as default source language
  const [translations, setTranslations] = useState<Translation>({
    sourceText: "",
    sourceLanguage: "hi",
  });

  const [englishScoreResult, setEnglishScoreResult] = useState<ScoreResult | null>(null);
  const [tamilScoreResult, setTamilScoreResult] = useState<ScoreResult | null>(null);
  const [teluguScoreResult, setTeluguScoreResult] = useState<ScoreResult | null>(null);
  const [malayalamScoreResult, setMalayalamScoreResult] = useState<ScoreResult | null>(null);
  const [hindiScoreResult, setHindiScoreResult] = useState<ScoreResult | null>(null);
  const [pitmanScoreResult, setPitmanScoreResult] = useState<ScoreResult | null>(null);

  const [selectedInputLanguage, setSelectedInputLanguage] = useState<string>("hi"); // Default to Hindi
  const [inputMethod, setInputMethod] = useState<string>("voice"); // Default to voice input
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);

  // All available input languages (excluding Pitman)
  const allLanguages = [
    { value: "hi", label: "Hindi" }, // Hindi first as default
    { value: "en", label: "English" },
    { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
    { value: "ml", label: "Malayalam" }
  ];

  // Available target languages (including Pitman)
  const availableTargetLanguages = [
    ...allLanguages,
    { value: "pi", label: "Pitman Shorthand" }
  ].filter(lang => 
    lang.value !== selectedInputLanguage
  );

  // Handle target language selection/deselection
  const toggleTargetLanguage = (langCode: string) => {
    setTargetLanguages(prev => 
      prev.includes(langCode) 
        ? prev.filter(lang => lang !== langCode)
        : [...prev, langCode]
    );
  };

  // Map language codes to language names
  const languageNames: Record<string, string> = {
    sourceText: "Source",
    english: "English",
    hindi: "Hindi",
    tamil: "Tamil",
    telugu: "Telugu",
    malayalam: "Malayalam",
    pitman: "Pitman Shorthand"
  };

  // Reset states when input language changes
  const handleInputLanguageChange = (lang: string) => {
    setSelectedInputLanguage(lang);
    setInputMethod("voice"); // Keep voice input as default
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
    setPitmanScoreResult(null);
  };

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-2">Indian Language Translator</h1>
      <p className="text-center text-slate-600 mb-6">Translate between Indian languages and practice your translations</p>

      {/* Step 1: Select Input Language */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 1: Select Input Language</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {allLanguages.map(lang => (
              <Button
                key={lang.value}
                variant={selectedInputLanguage === lang.value ? "default" : "outline"}
                className="w-full"
                onClick={() => handleInputLanguageChange(lang.value)}
              >
                {lang.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Input Method Selection */}
      {selectedInputLanguage && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 2: Input Method</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="voice" value={inputMethod} onValueChange={setInputMethod}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="voice" className="relative">
                  Voice Input
                  <span className="absolute top-0 right-0 px-1 text-xs bg-blue-100 text-blue-800 rounded">Default</span>
                </TabsTrigger>
                <TabsTrigger value="text">Text Input</TabsTrigger>
              </TabsList>

              {inputMethod === "voice" && (
                <TabsContent value="voice">
                  <VoiceRecorder
                    sourceLanguage={selectedInputLanguage}
                    onTranslationComplete={(translations) => {
                      const sourceText = translations[selectedInputLanguage] || translations.english;
                      setTranslations({
                        sourceText,
                        sourceLanguage: selectedInputLanguage,
                        ...translations
                      });
                    }}
                  />
                </TabsContent>
              )}

              {inputMethod === "text" && (
                <TabsContent value="text">
                  <TextUploader
                    sourceLanguage={selectedInputLanguage}
                    onTextReceived={(text) => {
                      setTranslations({
                        sourceText: text,
                        sourceLanguage: selectedInputLanguage,
                      });
                    }}
                  />
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
                  selectedLanguages={targetLanguages.map(lang => 
                    lang === "en" ? "english" : 
                    lang === "hi" ? "hindi" : 
                    lang === "ta" ? "tamil" : 
                    lang === "te" ? "telugu" : 
                    lang === "ml" ? "malayalam" :
                    lang === "pi" ? "pitman" : "" 
                  ).filter(Boolean)}
                  languageNames={languageNames}
                />
                {/* For debugging - shown in all environments until the issue is fixed */}
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                  <p>Debug - Target languages: {targetLanguages.join(', ')}</p>
                  <p>Selected: {targetLanguages.map(lang => 
                    lang === "en" ? "english" : 
                    lang === "hi" ? "hindi" : 
                    lang === "ta" ? "tamil" : 
                    lang === "te" ? "telugu" : 
                    lang === "ml" ? "malayalam" :
                    lang === "pi" ? "pitman" : "" 
                  ).join(', ')}</p>
                  <p>Available translations: {Object.keys(translations).join(', ')}</p>
                  <p>Translation contents:</p>
                  <ul className="pl-4">
                    <li>English: {translations.english?.substring(0, 30) || 'Not available'}</li>
                    <li>Hindi: {translations.hindi?.substring(0, 30) || 'Not available'}</li>
                    <li>Tamil: {translations.tamil?.substring(0, 30) || 'Not available'}</li>
                    <li>Telugu: {translations.telugu?.substring(0, 30) || 'Not available'}</li>
                    <li>Malayalam: {translations.malayalam?.substring(0, 30) || 'Not available'}</li>
                    <li>Pitman: {translations.pitman?.substring(0, 30) || 'Not available'}</li> 
                  </ul>
                </div>

                {translations.wordByWord && translations.wordByWord.length > 0 && targetLanguages.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Word-by-Word Translation</h3>
                    <WordByWordTranslation 
                      translations={translations.wordByWord} 
                      targetLanguage={
                        targetLanguages.includes("ta") ? "tamil" :
                        targetLanguages.includes("te") ? "telugu" :
                        targetLanguages.includes("ml") ? "malayalam" :
                        targetLanguages.includes("hi") ? "hindi" :
                        targetLanguages.includes("pi") ? "pitman" : "english" 
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
            <div className="text-sm text-muted-foreground mt-1">
              <a href="https://www.google.com/inputtools/try/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                <span>Need help typing? Try Google Input Tools</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
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
                                  lang === "te" ? "telugu" : 
                                  lang === "ml" ? "malayalam" : "pitman"; 

                const setScoreResult = lang === "en" ? setEnglishScoreResult :
                                             lang === "hi" ? setHindiScoreResult :
                                             lang === "ta" ? setTamilScoreResult :
                                             lang === "te" ? setTeluguScoreResult :
                                             lang === "ml" ? setMalayalamScoreResult : setPitmanScoreResult; 

                const scoreResult = lang === "en" ? englishScoreResult :
                                         lang === "hi" ? hindiScoreResult :
                                         lang === "ta" ? tamilScoreResult :
                                         lang === "te" ? teluguScoreResult :
                                         lang === "ml" ? malayalamScoreResult : pitmanScoreResult; 

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