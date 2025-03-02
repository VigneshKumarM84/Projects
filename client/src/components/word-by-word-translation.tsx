import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WordByWordTranslationProps {
  translations: Array<{
    hindi: string;
    english: string;
    tamil: string;
  }>;
}

export function WordByWordTranslation({ translations }: WordByWordTranslationProps) {
  // Select key words (approximately 1 in 10)
  const getKeyWords = (translations: Array<{ hindi: string; english: string; tamil: string }>) => {
    // Filter out short words and punctuation
    const significantWords = translations.filter(
      word => word.hindi.length > 2 && !/^[.,!?;:।॥]$/.test(word.hindi)
    );
    
    // Select approximately 1 in 10 words, at least 1
    const keyWordCount = Math.max(1, Math.floor(significantWords.length / 10));
    
    // Create a set of indices for key words, distributed across the text
    const keyIndices = new Set<number>();
    
    if (significantWords.length <= keyWordCount) {
      // If we have few words, select them all
      significantWords.forEach((_, i) => keyIndices.add(i));
    } else {
      // Select words distributed evenly through the text
      const step = Math.floor(significantWords.length / keyWordCount);
      for (let i = 0; i < keyWordCount; i++) {
        keyIndices.add(i * step);
      }
    }
    
    // Map back to original indices
    const originalIndices = new Set<number>();
    let significantIndex = 0;
    
    translations.forEach((word, index) => {
      if (word.hindi.length > 2 && !/^[.,!?;:।॥]$/.test(word.hindi)) {
        if (keyIndices.has(significantIndex)) {
          originalIndices.add(index);
        }
        significantIndex++;
      }
    });
    
    return originalIndices;
  };
  
  const keyWordIndices = getKeyWords(translations);

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
          <CardTitle>Word by Word Translation</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hindi</TableHead>
                <TableHead>English</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {translations.map((translation, index) => (
                <TableRow key={index} className={keyWordIndices.has(index) ? "bg-amber-50" : ""}>
                  <TableCell>{translation.hindi}</TableCell>
                  <TableCell>{translation.english}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
