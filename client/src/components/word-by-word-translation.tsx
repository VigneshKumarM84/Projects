import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";

interface WordByWordTranslationProps {
  translations: Array<{
    hindi: string;
    english: string;
    tamil: string;
  }>;
}

export function WordByWordTranslation({ translations }: WordByWordTranslationProps) {
  // Determine key words for highlighting (those longer than 3 characters)
  const keyWordIndices = useMemo(() => {
    const indices = new Set<number>();
    translations.forEach((translation, index) => {
      // Mark words longer than 3 characters as key words
      if (translation.hindi.length > 3) {
        indices.add(index);
      }
    });
    return indices;
  }, [translations]);

  // Combine the translations into continuous sentences
  const hindiSentence = translations.map(t => t.hindi).join(' ');
  const englishSentence = translations.map(t => t.english).join(' ');

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Key Hindi Words</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {translations.map((translation, index) => (
              keyWordIndices.has(index) && (
                <Badge key={index} variant="outline" className="text-lg py-2 px-3">
                  <span className="font-semibold">{translation.hindi}</span>
                  <span className="mx-1">-</span>
                  <span className="text-slate-600">{translation.english}</span>
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
              <h3 className="font-semibold text-lg mb-1">Hindi</h3>
              <p className="text-lg leading-relaxed">{hindiSentence}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">English</h3>
              <p className="text-lg leading-relaxed">{englishSentence}</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-lg mb-4">Word by Word Breakdown</h3>
            <div className="space-y-3">
              {translations.map((translation, index) => (
                <div key={index} className={`p-2 rounded ${keyWordIndices.has(index) ? "bg-amber-50" : ""}`}>
                  <div className="font-medium">{translation.hindi}</div>
                  <div className="text-slate-600">{translation.english}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}