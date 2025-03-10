
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";

interface TranslationCardProps {
  title: string;
  content: string;
  onCopy: (text: string) => void;
  onDownload: (text: string, language: string) => void;
}

export function TranslationCard({ title, content, onCopy, onDownload }: TranslationCardProps) {
  if (!content) return null;
  
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium">{title}</h4>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={() => onCopy(content)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDownload(content, title.toLowerCase())}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="whitespace-pre-wrap">{content}</p>
      </CardContent>
    </Card>
  );
}
