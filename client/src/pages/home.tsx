import { useState } from "react";
import { VoiceRecorder } from "@/components/voice-recorder";
import { TranslationDisplay } from "@/components/translation-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [translations, setTranslations] = useState({
    hindi: "",
    english: "",
    tamil: "",
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Voice to Text</h1>
          <p className="text-muted-foreground">
            Speak in Hindi and get translations in English and Tamil
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Record Voice</CardTitle>
          </CardHeader>
          <CardContent>
            <VoiceRecorder onTranslationComplete={setTranslations} />
          </CardContent>
        </Card>

        <TranslationDisplay translations={translations} />
      </div>
    </div>
  );
}
