import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";

interface WordByWordTranslationProps {
  translations: Array<{
    sourceText: string;
    english: string;
    tamil: string;
    telugu: string;
    malayalam: string;
  }>;
  targetLanguage: string; // Added to select target language
}

export function WordByWordTranslation({ translations, targetLanguage }: WordByWordTranslationProps) {
  // Determine key words for highlighting (those longer than 3 characters)
  const keyWordIndices = useMemo(() => {
    const indices = new Set<number>();
    translations.forEach((translation, index) => {
      // Mark words longer than 3 characters as key words
      if (translation.sourceText.length > 3) {
        indices.add(index);
      }
    });
    return indices;
  }, [translations]);

  // Function to get the translation based on target language
  const getTranslation = (translation: WordByWordTranslationProps["translations"][number]) => {
    switch (targetLanguage) {
      case "telugu": return translation.telugu;
      case "malayalam": return translation.malayalam;
      case "tamil": return translation.tamil;
      default: return translation.english;
    }
  };

  // Combine the translations into continuous sentences
  const sourceSentence = translations.map(t => t.sourceText).join(' ');
  const targetSentence = translations.map(t => getTranslation(t)).join(' ');


  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Key Words ({targetLanguage})</CardTitle> {/* Updated title */}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {translations.map((translation, index) => (
              keyWordIndices.has(index) && (
                <Badge key={index} variant="outline" className="text-lg py-2 px-3">
                  <span className="font-semibold">{translation.sourceText}</span>
                  <span className="mx-1">-</span>
                  <span className="text-slate-600">{getTranslation(translation)}</span>
                </Badge>
              )
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sentence Translation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gray-50 rounded space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">Source Text</h3>
              <p className="text-lg leading-relaxed">{sourceSentence}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">{targetLanguage}</h3>
              <p className="text-lg leading-relaxed">{targetSentence}</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-lg mb-4">Word by Word Breakdown</h3>
            <div className="space-y-3">
              {translations.map((translation, index) => (
                <div key={index} className={`p-2 rounded ${keyWordIndices.has(index) ? "bg-amber-50" : ""}`}>
                  <div className="font-medium">{translation.sourceText}</div>
                  <div className="text-slate-600">{getTranslation(translation)}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Translation {
  sourceText: string;
  wordByWord?: {
    [language: string]: {
      words: {
        source: string;
        target: string;
      }[];
    };
  };
}

interface WordByWordTranslationProps {
  translations: Translation;
  targetLanguage: string;
}

export function WordByWordTranslation({ translations, targetLanguage }: WordByWordTranslationProps) {
  const words = useMemo(() => {
    if (!translations.wordByWord || !translations.wordByWord[targetLanguage]) {
      return [];
    }
    return translations.wordByWord[targetLanguage].words;
  }, [translations, targetLanguage]);

  if (!words.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Word by Word Translation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {words.map((word, index) => (
            <Badge
              key={index}
              variant="outline"
              className="flex flex-col items-start p-2"
            >
              <span className="font-medium">{word.source}</span>
              <span className="text-xs text-gray-500">{word.target}</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}