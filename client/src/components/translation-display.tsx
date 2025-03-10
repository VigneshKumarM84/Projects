
import { useState } from "react";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TranslationDisplayProps {
  translations: {
    sourceText: string;
    sourceLanguage: string;
    english?: string;
    tamil?: string;
    telugu?: string;
    malayalam?: string;
    [key: string]: any;
  };
}

export function TranslationDisplay({ translations }: TranslationDisplayProps) {
  const { toast } = useToast();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["english"]);

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
    // Always include English and the selected language(s)
    const newLanguages = value === "english" 
      ? ["english"] 
      : ["english", value];
    
    setSelectedLanguages(newLanguages);
  };

  // Language display names mapping
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

  const TranslationCard = ({
    languageKey,
    text,
  }: {
    languageKey: string;
    text?: string;
  }) => {
    if (!text) return null;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{languageNames[languageKey] || languageKey}</span>
            <div className="space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(text)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => downloadText(text, languageKey)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="min-h-[100px] whitespace-pre-wrap break-words overflow-auto max-h-[300px] text-wrap">{text}</p>
        </CardContent>
      </Card>
    );
  };

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
        <TranslationCard languageKey="sourceText" text={translations.sourceText} />
        <TranslationCard languageKey="english" text={translations.english} />
        {selectedLanguages.includes("tamil") && (
          <TranslationCard languageKey="tamil" text={translations.tamil} />
        )}
        {selectedLanguages.includes("telugu") && (
          <TranslationCard languageKey="telugu" text={translations.telugu} />
        )}
        {selectedLanguages.includes("malayalam") && (
          <TranslationCard languageKey="malayalam" text={translations.malayalam} />
        )}
      </div>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface TranslationDisplayProps {
  translations: {
    hindi?: string;
    english?: string;
    tamil?: string;
    telugu?: string;
    malayalam?: string;
    wordByWord?: Array<any>;
  };
}

export function TranslationDisplay({ translations }: TranslationDisplayProps) {
  if (!translations || (!translations.hindi && !translations.english && !translations.tamil && !translations.telugu && !translations.malayalam)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Translation Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="english">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="hindi">Hindi</TabsTrigger>
            <TabsTrigger value="english">English</TabsTrigger>
            <TabsTrigger value="tamil">Tamil</TabsTrigger>
            <TabsTrigger value="telugu">Telugu</TabsTrigger>
            <TabsTrigger value="malayalam">Malayalam</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hindi">
            <div className="p-4 border rounded-md mt-2">
              {translations.hindi || "No Hindi translation available"}
            </div>
          </TabsContent>
          
          <TabsContent value="english">
            <div className="p-4 border rounded-md mt-2">
              {translations.english || "No English translation available"}
            </div>
          </TabsContent>
          
          <TabsContent value="tamil">
            <div className="p-4 border rounded-md mt-2">
              {translations.tamil || "No Tamil translation available"}
            </div>
          </TabsContent>
          
          <TabsContent value="telugu">
            <div className="p-4 border rounded-md mt-2">
              {translations.telugu || "No Telugu translation available"}
            </div>
          </TabsContent>
          
          <TabsContent value="malayalam">
            <div className="p-4 border rounded-md mt-2">
              {translations.malayalam || "No Malayalam translation available"}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
