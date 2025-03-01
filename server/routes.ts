import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertTranslationSchema } from "@shared/schema";

async function translateText(text: string, fromLang: string, toLang: string) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.responseData.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Translation failed');
  }
}

async function translateWords(text: string) {
  // Split text into words, preserving punctuation
  const words = text.match(/[\u0900-\u097F]+|\S+/g) || [];

  const translations = await Promise.all(
    words.map(async (word) => {
      const [english, tamil] = await Promise.all([
        translateText(word, 'hi', 'en'),
        translateText(word, 'hi', 'ta')
      ]);

      return {
        hindi: word,
        english,
        tamil
      };
    })
  );

  return translations;
}

export async function registerRoutes(app: Express) {
  app.post("/api/translate", async (req, res) => {
    try {
      const { text } = req.body;

      // Translate Hindi to English and Tamil
      const [englishTranslation, tamilTranslation] = await Promise.all([
        translateText(text, 'hi', 'en'),
        translateText(text, 'hi', 'ta')
      ]);

      const translations = {
        hindi: text,
        english: englishTranslation,
        tamil: tamilTranslation,
      };

      const validatedData = insertTranslationSchema.parse(translations);
      await storage.createTranslation(validatedData);

      res.json(translations);
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({ message: "Translation failed" });
    }
  });

  app.post("/api/translate/text", async (req, res) => {
    try {
      const { text } = req.body;

      // Get both full text and word-by-word translations
      const [
        [englishTranslation, tamilTranslation],
        wordByWordTranslations
      ] = await Promise.all([
        Promise.all([
          translateText(text, 'hi', 'en'),
          translateText(text, 'hi', 'ta')
        ]),
        translateWords(text)
      ]);

      const translations = {
        hindi: text,
        english: englishTranslation,
        tamil: tamilTranslation,
        wordByWord: wordByWordTranslations
      };

      const validatedData = insertTranslationSchema.parse({
        hindi: text,
        english: englishTranslation,
        tamil: tamilTranslation
      });
      await storage.createTranslation(validatedData);

      res.json(translations);
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({ message: "Translation failed" });
    }
  });

  return createServer(app);
}