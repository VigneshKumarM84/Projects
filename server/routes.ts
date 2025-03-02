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

// Function to calculate similarity between two strings with improved algorithm
function calculateSimilarity(str1: string, str2: string): number {
  // Convert both strings to lowercase for case-insensitive comparison
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // Split into words
  const words1 = s1.split(/\s+/).filter(word => word.length > 1);
  const words2 = s2.split(/\s+/).filter(word => word.length > 1);
  
  // Base score calculation
  let matchCount = 0;
  let partialMatchCount = 0;
  
  // Check for exact and partial matches
  for (const word1 of words1) {
    // Exact match
    if (words2.includes(word1)) {
      matchCount += 1;
      continue;
    }
    
    // Check for partial matches (at least 50% of characters match)
    for (const word2 of words2) {
      if (word1.length < 3 || word2.length < 3) continue;
      
      // Check if word2 contains at least half of word1's characters
      const commonChars = [...word1].filter(char => word2.includes(char));
      if (commonChars.length >= word1.length * 0.5) {
        partialMatchCount += 0.5;
        break;
      }
    }
  }
  
  // Calculate similarity score
  const totalMatches = matchCount + partialMatchCount;
  const maxWords = Math.max(words1.length, words2.length);
  
  // Apply a more generous baseline score (min 40% if there's any effort)
  let score = maxWords > 0 ? (totalMatches / maxWords) * 100 : 0;
  
  // Boost score if there are any matches (to be more encouraging)
  if (totalMatches > 0 && score < 40) {
    score = 40 + (score / 2); // Boost low scores
  }
  
  return Math.min(100, score); // Cap at 100
}

// Generate more encouraging feedback based on similarity score
function generateFeedback(score: number, targetLanguage: string): string {
  if (score >= 85) {
    return `Excellent! Your ${targetLanguage} translation is very accurate.`;
  } else if (score >= 65) {
    return `Good job! Your ${targetLanguage} translation is mostly correct with minor differences.`;
  } else if (score >= 40) {
    return `Good attempt. You got some key words right. Keep practicing to improve your ${targetLanguage} vocabulary and phrasing.`;
  } else {
    return `Thanks for your attempt. Translation is challenging! Keep practicing your ${targetLanguage} skills, focusing on common vocabulary and sentence structure.`;
  }
}

async function translateText(text: string, fromLang: string, toLang: string) {
  try {
    // Try Google Translate API alternative
    const url = "https://translate.googleapis.com/translate_a/single";

    const params = new URLSearchParams({
      client: 'gtx',
      sl: fromLang,
      tl: toLang,
      dt: 't',
      q: text
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data && data[0] && data[0][0]) {
      return data[0][0][0];
    } else {
      throw new Error('Translation failed');
    }
  } catch (error) {
    console.error('Translation error:', error);

    // Enhanced fallback translations for when API fails
    if (fromLang === 'hi' && toLang === 'en') {
      // Extended Hindi to English dictionary
      const hiToEn: Record<string, string> = {
        'नमस्ते': 'hello',
        'धन्यवाद': 'thank you',
        'हां': 'yes',
        'नहीं': 'no',
        'एक': 'one',
        'दो': 'two',
        'तीन': 'three',
        'मैं': 'I',
        'तुम': 'you',
        'है': 'is',
        'और': 'and',
        'में': 'in',
        'का': 'of',
        'समय': 'time',
        'जंगल': 'forest',
        'गधे': 'donkeys',
        'सभी': 'all',
        'था': 'was',
        'जब': 'when',
        'ऐसा': 'such',
        'अच्छा': 'good',
        'खराब': 'bad',
        'बड़ा': 'big',
        'छोटा': 'small',
        'आज': 'today',
        'कल': 'tomorrow',
        'कैसे': 'how',
        'क्यों': 'why',
        'क्या': 'what',
        'कौन': 'who',
        'कहाँ': 'where',
        'कब': 'when',
        'पानी': 'water',
        'खाना': 'food',
        'दिन': 'day',
        'रात': 'night',
        'सुबह': 'morning',
        'शाम': 'evening'
      };

      // Try to translate word by word
      const words = text.split(/\s+/);
      const translatedWords = words.map(word => {
        // Remove punctuation for lookup
        const cleanWord = word.replace(/[^\u0900-\u097F]/g, '');
        return hiToEn[cleanWord] || "[Hindi word]"; // Replace untranslated words with placeholder
      });

      return translatedWords.join(' ');
    } else if (fromLang === 'hi' && toLang === 'ta') {
      return "Tamil translation unavailable"; // More honest fallback
    }

    // If no specific fallback is defined
    return `Translation to ${toLang.toUpperCase()} unavailable`;
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
    // Convert image buffer to base64
    const base64Image = imageBuffer.toString('base64');

    const formData = new FormData();
    formData.append('apikey', process.env.OCR_SPACE_API_KEY);
    formData.append('language', 'hin'); // Hindi language
    formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // More accurate engine
    formData.append('isTable', 'false');
    formData.append('filetype', 'jpg');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': process.env.OCR_SPACE_API_KEY,
        'Content-Type': 'multipart/form-data'
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

    const extractedText = result.ParsedResults[0].ParsedText;

    if (!extractedText.trim()) {
      throw new Error('No text was found in the image');
    }

    return extractedText;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to extract text from image');
  }
}

export async function registerRoutes(app: Express) {
  app.post("/api/score-translation", async (req, res) => {
    try {
      const { originalText, userAnswer, targetLanguage } = req.body;

      if (!originalText || !userAnswer || !targetLanguage) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get the system translation
      let systemTranslation = "";
      if (targetLanguage === "english") {
        systemTranslation = await translateText(originalText, "hi", "en");
      } else if (targetLanguage === "tamil") {
        systemTranslation = await translateText(originalText, "hi", "ta");
      } else {
        return res.status(400).json({ message: "Invalid target language" });
      }

      // Calculate similarity score
      const similarityScore = calculateSimilarity(userAnswer, systemTranslation);
      const roundedScore = Math.round(similarityScore);

      // Generate feedback
      const feedback = generateFeedback(roundedScore, targetLanguage);

      res.json({
        score: roundedScore,
        systemTranslation,
        feedback
      });
    } catch (error) {
      console.error('Scoring error:', error);
      res.status(500).json({ message: "Failed to score translation" });
    }
  });

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