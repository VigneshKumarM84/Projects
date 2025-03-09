import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download } from "lucide-react";

interface TranslationDisplayProps {
  translations: {
    hindi: string;
    english: string;
    tamil: string;
  };
}

export function TranslationDisplay({ translations }: TranslationDisplayProps) {
  const { toast } = useToast();
  const [showTamil, setShowTamil] = useState(false);

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

  const TranslationCard = ({
    language,
    text,
    show,
  }: {
    language: string;
    text: string;
    show: boolean;
  }) => (
    show && (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{language}</span>
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
                onClick={() => downloadText(text, language.toLowerCase())}
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
    )
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TranslationCard language="Hindi" text={translations.hindi} show={true} />
      <TranslationCard language="English" text={translations.english} show={true} />
      <TranslationCard language="Tamil" text={translations.tamil} show={showTamil} />
      <Button onClick={() => setShowTamil(!showTamil)}>
        {showTamil ? "Hide Tamil" : "Show Tamil"}
      </Button>
    </div>
  );
}