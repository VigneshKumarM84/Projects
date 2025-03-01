import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertTranslationSchema } from "@shared/schema";
import multer from "multer";
import FormData from "form-data";

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

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

async function performOCR(imageBuffer: Buffer): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('apikey', process.env.OCR_SPACE_API_KEY);
    formData.append('language', 'hin'); // Hindi language
    formData.append('file', imageBuffer, { filename: 'image.jpg' });
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // More accurate engine

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData as any,
    });

    const result = await response.json();

    if (!response.ok || result.OCRExitCode !== 1) {
      throw new Error(result.ErrorMessage || 'OCR failed');
    }

    return result.ParsedResults[0].ParsedText;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Failed to extract text from image');
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

  // New endpoint for OCR
  app.post("/api/ocr", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        throw new Error('No image file uploaded');
      }

      const extractedText = await performOCR(req.file.buffer);

      res.json({ text: extractedText });
    } catch (error) {
      console.error('OCR error:', error);
      res.status(500).json({ message: "Failed to process image" });
    }
  });

  return createServer(app);
}