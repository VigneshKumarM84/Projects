import { useState } from "react";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; //Removed import
import { TranslationCard } from "./translation-card";

interface TranslationDisplayProps {
  translations: {
    sourceText: string;
    sourceLanguage: string;
    english: string;
    tamil?: string;
    telugu?: string;
    malayalam?: string;
    hindi?: string;
    pitman?: string;
  };
  selectedLanguages?: string[];
  languageNames?: Record<string, string>;
}

export function TranslationDisplay({ translations, selectedLanguages: propSelectedLanguages, languageNames: propLanguageNames }: TranslationDisplayProps) {
  const { toast } = useToast();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(propSelectedLanguages || []);

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

  // handleLanguageChange function removed

  // Language display names mapping (using props if available)
  const languageNames: Record<string, string> = propLanguageNames || {
    "sourceText": getSourceLanguageDisplayName(translations.sourceLanguage),
    "english": "English",
    "tamil": "Tamil",
    "telugu": "Telugu",
    "malayalam": "Malayalam",
    "hindi": "Hindi"
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
        {/* Select component removed */}
      </div>

      <TranslationCard
        title={languageNames.sourceText}
        content={translations.sourceText}
        onCopy={copyToClipboard}
        onDownload={(text, lang) => downloadText(text, lang)}
      />

      {/* Always show English translation if available */}
      {translations.english && (
        <TranslationCard
          title="English"
          content={translations.english}
          onCopy={copyToClipboard}
          onDownload={(text, lang) => downloadText(text, lang)}
        />
      )}

      {selectedLanguages.includes("tamil") && translations.tamil && (
        <TranslationCard
          title="Tamil"
          content={translations.tamil}
          onCopy={copyToClipboard}
          onDownload={(text, lang) => downloadText(text, lang)}
        />
      )}

      {selectedLanguages.includes("telugu") && translations.telugu && (
        <TranslationCard
          title="Telugu"
          content={translations.telugu}
          onCopy={copyToClipboard}
          onDownload={(text, lang) => downloadText(text, lang)}
        />
      )}

      {selectedLanguages.includes("malayalam") && translations.malayalam && (
        <TranslationCard
          title="Malayalam"
          content={translations.malayalam}
          onCopy={copyToClipboard}
          onDownload={(text, lang) => downloadText(text, lang)}
        />
      )}
      {selectedLanguages.includes("hindi") && translations.hindi && (
        <TranslationCard
          title="Hindi"
          content={translations.hindi}
          onCopy={copyToClipboard}
          onDownload={(text, lang) => downloadText(text, lang)}
        />
      )}

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
        {selectedLanguages.includes("hindi") && (
          <TranslationCard languageKey="hindi" text={translations.hindi} copyToClipboard={copyToClipboard} downloadText={downloadText} languageNames={languageNames}/>
        )}
      </div>
    </div>
  );
}