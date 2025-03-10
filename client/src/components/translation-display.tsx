import { useState } from "react";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TranslationCard } from "./translation-card";

interface TranslationDisplayProps {
  translations: {
    sourceText: string;
    sourceLanguage: string;
    english: string;
    tamil?: string;
    telugu?: string;
    malayalam?: string;
  };
}

export function TranslationDisplay({ translations }: TranslationDisplayProps) {
  const { toast } = useToast();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const downloadText = (text: string, language: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translation_${language}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLanguageChange = (value: string) => {
    if (value === "english") {
      setSelectedLanguages([]);
    } else {
      setSelectedLanguages([value]);
    }
  };

  // Language display names mapping (moved here for better organization)
  const languageNames: Record<string, string> = {
    "sourceText": getSourceLanguageDisplayName(translations.sourceLanguage),
    "english": "English",
    "tamil": "Tamil",
    "telugu": "Telugu",
    "malayalam": "Malayalam"
  };

  // Convert API language code to display name
  function getSourceLanguageDisplayName(code: string): string {
    const sourceLanguageMap: Record<string, string> = {
      "hi": "Hindi",
      "ta": "Tamil",
      "te": "Telugu",
      "ml": "Malayalam",
      "en": "English"
    };
    return sourceLanguageMap[code] || "Source Text";
  }


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Translations</h3>
        <Select onValueChange={handleLanguageChange} defaultValue="english">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English Only</SelectItem>
            <SelectItem value="tamil">Tamil</SelectItem>
            <SelectItem value="telugu">Telugu</SelectItem>
            <SelectItem value="malayalam">Malayalam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TranslationCard languageKey="sourceText" text={translations.sourceText} copyToClipboard={copyToClipboard} downloadText={downloadText} languageNames={languageNames}/>
        <TranslationCard languageKey="english" text={translations.english} copyToClipboard={copyToClipboard} downloadText={downloadText} languageNames={languageNames}/>
        {selectedLanguages.includes("tamil") && (
          <TranslationCard languageKey="tamil" text={translations.tamil} copyToClipboard={copyToClipboard} downloadText={downloadText} languageNames={languageNames}/>
        )}
        {selectedLanguages.includes("telugu") && (
          <TranslationCard languageKey="telugu" text={translations.telugu} copyToClipboard={copyToClipboard} downloadText={downloadText} languageNames={languageNames}/>
        )}
        {selectedLanguages.includes("malayalam") && (
          <TranslationCard languageKey="malayalam" text={translations.malayalam} copyToClipboard={copyToClipboard} downloadText={downloadText} languageNames={languageNames}/>
        )}
      </div>
    </div>
  );
}