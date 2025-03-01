import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WordByWordTranslationProps {
  translations: Array<{
    hindi: string;
    english: string;
    tamil: string;
  }>;
}

export function WordByWordTranslation({ translations }: WordByWordTranslationProps) {
  return (
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
              <TableHead>Tamil</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {translations.map((translation, index) => (
              <TableRow key={index}>
                <TableCell>{translation.hindi}</TableCell>
                <TableCell>{translation.english}</TableCell>
                <TableCell>{translation.tamil}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
