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
import { useRef } from "react";

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

// Helper function to get language-specific keyboard characters
export default function HomePage() {
  // Your home page component implementation
  // This should contain all the content that's currently in this file
  // ...
}

const getLanguageKeyboard = (lang: string): string[] => {
  switch (lang) {
    case 'hi':
      return ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ', 'ड', 'ढ', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'ं', 'ः', '्'];
    case 'ta':
      return ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ', 'க', 'ங', 'ச', 'ஞ', 'ட', 'ண', 'த', 'ந', 'ப', 'ம', 'ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'ற', 'ன', '்', 'ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ'];
    case 'te':
      return ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ', 'క', 'ఖ', 'గ', 'ఘ', 'చ', 'ఛ', 'జ', 'ఝ', 'ట', 'ఠ', 'డ', 'ఢ', 'త', 'థ', 'ద', 'ధ', 'న', 'ప', 'ఫ', 'బ', 'భ', 'మ', 'య', 'ర', 'ల', 'వ', 'శ', 'ష', 'స', 'హ', '్', 'ా', 'ి', 'ీ', 'ు', 'ూ', 'ె', 'ే', 'ై', 'ొ', 'ో', 'ౌ'];
    case 'ml':
      return ['അ', 'ആ', 'ഇ', 'ഈ', 'ഉ', 'ഊ', 'ഋ', 'എ', 'ഏ', 'ഐ', 'ഒ', 'ഓ', 'ഔ', 'ക', 'ഖ', 'ഗ', 'ഘ', 'ങ', 'ച', 'ഛ', 'ജ', 'ഝ', 'ഞ', 'ട', 'ഠ', 'ഡ', 'ഢ', 'ണ', 'ത', 'ഥ', 'ദ', 'ധ', 'ന', 'പ', 'ഫ', 'ബ', 'ഭ', 'മ', 'യ', 'ര', 'ല', 'വ', 'ശ', 'ഷ', 'സ', 'ഹ', '്', 'ാ', 'ി', 'ീ', 'ു', 'ൂ', 'ൃ', 'െ', 'േ', 'ൈ', 'ൊ', 'ോ', 'ൌ'];
    default:
      return [];
  }
};

export function HomePage() {
  const [selectedInputLanguage, setSelectedInputLanguage] = useState<string>("");
  const [inputMethod, setInputMethod] = useState<"voice" | "text">("voice");
  const [translations, setTranslations] = useState<Translation>({
    sourceText: "",
    sourceLanguage: "",
  });

  const [englishScoreResult, setEnglishScoreResult] = useState<ScoreResult | null>(null);
  const [tamilScoreResult, setTamilScoreResult] = useState<ScoreResult | null>(null);
  const [teluguScoreResult, setTeluguScoreResult] = useState<ScoreResult | null>(null);
  const [malayalamScoreResult, setMalayalamScoreResult] = useState<ScoreResult | null>(null);
  const [hindiScoreResult, setHindiScoreResult] = useState<ScoreResult | null>(null);

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
                  selectedLanguages={targetLanguages.map(lang => 
                    lang === "en" ? "english" : 
                    lang === "hi" ? "hindi" : 
                    lang === "ta" ? "tamil" : 
                    lang === "te" ? "telugu" : 
                    lang === "ml" ? "malayalam" : ""
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
                    lang === "ml" ? "malayalam" : ""
                  ).join(', ')}</p>
                  <p>Available translations: {Object.keys(translations).join(', ')}</p>
                  <p>Translation contents:</p>
                  <ul className="pl-4">
                    <li>English: {translations.english?.substring(0, 30) || 'Not available'}</li>
                    <li>Hindi: {translations.hindi?.substring(0, 30) || 'Not available'}</li>
                    <li>Tamil: {translations.tamil?.substring(0, 30) || 'Not available'}</li>
                    <li>Telugu: {translations.telugu?.substring(0, 30) || 'Not available'}</li>
                    <li>Malayalam: {translations.malayalam?.substring(0, 30) || 'Not available'}</li>
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
                               lang === "te" ? "telugu" : "malayalam";

                const setScoreResult = lang === "en" ? setEnglishScoreResult :
                                     lang === "hi" ? setHindiScoreResult :
                                     lang === "ta" ? setTamilScoreResult :
                                     lang === "te" ? setTeluguScoreResult : setMalayalamScoreResult;

                const scoreResult = lang === "en" ? englishScoreResult :
                                  lang === "hi" ? hindiScoreResult :
                                  lang === "ta" ? tamilScoreResult :
                                  lang === "te" ? teluguScoreResult : malayalamScoreResult;
                const keyboard = getLanguageKeyboard(lang);

                return (
                  <TabsContent key={lang} value={lang}>
                    <div className="mb-4">
                      {keyboard.length > 0 && (
                        <div>
                          <p className="font-medium mb-2">Keyboard:</p>
                          <div className="flex flex-wrap gap-1">
                            {keyboard.map((char) => (
                              <Button key={char} onClick={() => {
                                //This is a placeholder, you need to integrate with the input field here.
                                console.log("Clicked:", char);
                              }}>
                                {char}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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