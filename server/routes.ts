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

    const headers = formData.getHeaders();

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        ...headers,
        'apikey': process.env.OCR_SPACE_API_KEY,
      },
      body: formData,
    });

    const result = await response.json();
    console.log('OCR Response:', result); // Debug log

    if (!response.ok) {
      throw new Error(`OCR API error: ${result.ErrorMessage || response.statusText}`);
    }

    if (!result.ParsedResults || result.ParsedResults.length === 0) {
      throw new Error('No text found in image');
    }

    return result.ParsedResults[0].ParsedText;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to extract text from image');
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

  // OCR endpoint
  app.post("/api/ocr", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
      }

      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ message: 'Uploaded file is not an image' });
      }

      const extractedText = await performOCR(req.file.buffer);

      if (!extractedText.trim()) {
        return res.status(400).json({ message: 'No text was found in the image' });
      }

      res.json({ text: extractedText });
    } catch (error) {
      console.error('OCR error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to process image" 
      });
    }
  });

  return createServer(app);
}