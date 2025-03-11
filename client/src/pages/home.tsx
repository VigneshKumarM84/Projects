import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import VoiceRecorder from '@/components/voice-recorder';
import TranslationDisplay from '@/components/translation-display';
import AnswerInput from '@/components/answer-input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Type for the translation object
export type Translation = {
  sourceLanguage?: string;
  recognizedText?: string;
  translations?: Record<string, string>;
};

// Helper function to get language-specific keyboard characters
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

// Function to get language typing URLs
const getLanguageTypingURL = (lang: string): string => {
  switch (lang) {
    case 'hi':
      return 'https://www.google.com/inputtools/try/?imb=hi'; // Hindi
    case 'ta':
      return 'https://www.google.com/inputtools/try/?imb=ta'; // Tamil
    case 'te':
      return 'https://www.google.com/inputtools/try/?imb=te'; // Telugu
    case 'ml':
      return 'https://www.google.com/inputtools/try/?imb=ml'; // Malayalam
    default:
      return 'https://www.google.com/inputtools/try/';
  }
};

function HomePage() {
  const [selectedInputLanguage, setSelectedInputLanguage] = useState<string>("");
  const [inputMethod, setInputMethod] = useState<"voice" | "text">("voice");
  const [translations, setTranslations] = useState<Translation>({});
  const [selectedTargetLanguages, setSelectedTargetLanguages] = useState<string[]>([]);

  // Language options for selection
  const inputLanguageOptions = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
    { value: "ml", label: "Malayalam" },
  ];

  const targetLanguageOptions = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
    { value: "ml", label: "Malayalam" },
  ];

  const handleTargetLanguageToggle = (lang: string) => {
    setSelectedTargetLanguages(prev => 
      prev.includes(lang) 
        ? prev.filter(l => l !== lang) 
        : [...prev, lang]
    );
  };

  const handleInputLanguageSelect = (lang: string) => {
    setSelectedInputLanguage(lang);
  };

  const openLanguageTypingTool = (language: string) => {
    window.open(getLanguageTypingURL(language), '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary py-4">
        <div className="container mx-auto">
          <h1 className="text-white text-2xl font-bold">Language Translation App</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 gap-6">
          {/* Step 1: Select Input Language */}
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select Input Language</CardTitle>
              <CardDescription>Choose the language you want to speak or type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {inputLanguageOptions.map(option => (
                  <Button 
                    key={option.value}
                    variant={selectedInputLanguage === option.value ? "default" : "outline"}
                    onClick={() => handleInputLanguageSelect(option.value)}
                    className="flex-grow sm:flex-grow-0"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Select Target Languages */}
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Select Target Languages</CardTitle>
              <CardDescription>Choose one or more languages for translation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {targetLanguageOptions.map(option => (
                  <Button 
                    key={option.value}
                    variant={selectedTargetLanguages.includes(option.value) ? "default" : "outline"}
                    onClick={() => handleTargetLanguageToggle(option.value)}
                    className="flex-grow sm:flex-grow-0"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Record or Type */}
          {selectedInputLanguage && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: {inputMethod === "voice" ? "Record Your Voice" : "Type Your Text"}</CardTitle>
                <CardDescription>
                  {inputMethod === "voice" 
                    ? "Click to start recording in your selected language" 
                    : "Type text in your selected language"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setInputMethod(inputMethod === "voice" ? "text" : "voice")}
                  >
                    Switch to {inputMethod === "voice" ? "Text" : "Voice"} Input
                  </Button>
                </div>

                {inputMethod === "voice" ? (
                  <div className="text-center">
                    <VoiceRecorder
                      sourceLanguage={selectedInputLanguage}
                      targetLanguages={selectedTargetLanguages}
                      onTranslationReceived={setTranslations}
                    />
                  </div>
                ) : (
                  <AnswerInput 
                    sourceLanguage={selectedInputLanguage}
                    targetLanguages={selectedTargetLanguages}
                    onTranslationReceived={setTranslations}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Language Typing Tools */}
          {selectedInputLanguage && (
            <Card>
              <CardHeader>
                <CardTitle>Step 4: Language Typing Tools</CardTitle>
                <CardDescription>Tools to help with typing in different languages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div>
                    <p className="mb-2">Need help typing in your selected language?</p>
                    <div className="flex flex-wrap gap-2">
                      {inputLanguageOptions.map(option => (
                        <Button 
                          key={option.value}
                          variant="outline"
                          onClick={() => openLanguageTypingTool(option.value)}
                          className="flex-grow sm:flex-grow-0"
                        >
                          {option.label} Typing Tool
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2">Practice your translation:</p>
                    <a 
                      href="https://www.google.com/inputtools/try/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google Input Tools
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Translation Results */}
          {translations.recognizedText && (
            <Card>
              <CardHeader>
                <CardTitle>Step 5: Translation Results</CardTitle>
                <CardDescription>See your text translated into selected languages</CardDescription>
              </CardHeader>
              <CardContent>
                <TranslationDisplay translation={translations} />
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="bg-gray-100 py-4">
        <div className="container mx-auto text-center text-gray-600">
          <p>© 2023 Language Translation App</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;

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