import { useState } from "react";
import { VoiceRecorder } from "@/components/voice-recorder";
import { TextUploader } from "@/components/text-uploader";
import { TranslationDisplay } from "@/components/translation-display";
import { WordByWordTranslation } from "@/components/word-by-word-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function Home() {
  const [translations, setTranslations] = useState<Translation>({
    hindi: "",
    english: "",
    tamil: "",
    wordByWord: [],
  });

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

        <TranslationDisplay translations={translations} />

        {translations.wordByWord && translations.wordByWord.length > 0 && (
          <WordByWordTranslation translations={translations.wordByWord} />
        )}
      </div>
    </div>
  );
}