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

  return createServer(app);
}