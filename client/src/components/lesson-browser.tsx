
import React, { useState } from "react";
import { Lesson, lessons } from "@/data/lessons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface LessonBrowserProps {
  onSelectSentence: (hindi: string, english: string) => void;
}

export function LessonBrowser({ onSelectSentence }: LessonBrowserProps) {
  const [selectedDay, setSelectedDay] = useState("1");
  const [currentLesson, setCurrentLesson] = useState<Lesson>(lessons[0]);
  
  const handleDayChange = (day: string) => {
    setSelectedDay(day);
    setCurrentLesson(lessons[parseInt(day) - 1]);
  };

  const handleNextDay = () => {
    const nextDay = Math.min(parseInt(selectedDay) + 1, 10);
    setSelectedDay(nextDay.toString());
    setCurrentLesson(lessons[nextDay - 1]);
  };

  const handlePrevDay = () => {
    const prevDay = Math.max(parseInt(selectedDay) - 1, 1);
    setSelectedDay(prevDay.toString());
    setCurrentLesson(lessons[prevDay - 1]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Hindi Practice Lessons</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrevDay}
              disabled={selectedDay === "1"}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNextDay}
              disabled={selectedDay === "10"}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          {`Day ${currentLesson.day}: ${currentLesson.title}`}
        </CardDescription>
        <p className="text-sm text-muted-foreground mt-1">{currentLesson.description}</p>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedDay} onValueChange={handleDayChange}>
          <TabsList className="grid grid-cols-5 mb-4">
            {lessons.slice(0, 5).map((lesson) => (
              <TabsTrigger key={lesson.day} value={lesson.day.toString()}>
                Day {lesson.day}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsList className="grid grid-cols-5">
            {lessons.slice(5, 10).map((lesson) => (
              <TabsTrigger key={lesson.day} value={lesson.day.toString()}>
                Day {lesson.day}
              </TabsTrigger>
            ))}
          </TabsList>

          {lessons.map((lesson) => (
            <TabsContent key={lesson.day} value={lesson.day.toString()}>
              <div className="space-y-3">
                {lesson.sentences.map((sentence, index) => (
                  <div 
                    key={index} 
                    className="p-3 border rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => onSelectSentence(sentence.hindi, sentence.english)}
                  >
                    <p className="font-medium text-lg">{sentence.hindi}</p>
                    <p className="text-muted-foreground text-sm">{sentence.english}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Click on any sentence to practice translating it
      </CardFooter>
    </Card>
  );
}
