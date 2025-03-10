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

    if (data && data[0]) {
      // Combine all sentences in the translation
      const translatedText = data[0]
        .filter((item: any) => item && item[0])
        .map((item: any) => item[0])
        .join(' ');
      
      return translatedText;
    } else {
      throw new Error('Translation failed');
    }
  } catch (error) {
    console.error('Translation error:', error);

    // Map of language codes to names for better error messages
    const languageNames: Record<string, string> = {
      'en': 'English',
      'ta': 'Tamil',
      'te': 'Telugu',
      'ml': 'Malayalam',
      'hi': 'Hindi'
    };

    // Common words in various languages as fallback
    const commonWords: Record<string, Record<string, string>> = {
      'hi': { // Hindi to other languages
        'en': {
          'नमस्ते': 'hello',
          'धन्यवाद': 'thank you',
          'हां': 'yes',
          'नहीं': 'no',
          // ... other words from your existing dictionary
        }
      },
      'ta': { // Tamil to other languages
        'en': {
          'வணக்கம்': 'hello',
          'நன்றி': 'thank you',
        }
      },
      'te': { // Telugu to other languages
        'en': {
          'నమస్కారం': 'hello',
          'ధన్యవాదాలు': 'thank you',
        }
      },
      'ml': { // Malayalam to other languages
        'en': {
          'നമസ്കാരം': 'hello',
          'നന്ദി': 'thank you',
        }
      }
    };
    
    // Try basic word-by-word fallback if dictionary exists
    if (commonWords[fromLang] && commonWords[fromLang][toLang]) {
      const dictionary = commonWords[fromLang][toLang];
      const words = text.split(/\s+/);
      const translatedWords = words.map(word => {
        // Strip punctuation
        const cleanWord = word.replace(/[^\p{L}\p{N}]/gu, '');
        return dictionary[cleanWord] || `[${languageNames[fromLang] || fromLang} word]`;
      });
      return translatedWords.join(' ');
    }

    // If no specific fallback is defined
    return `Translation to ${languageNames[toLang] || toLang.toUpperCase()} unavailable`;
  }
}

async function translateWords(text: string, fromLang: string = 'hi') {
  // Language-specific regex patterns for different scripts
  const scriptPatterns: Record<string, RegExp> = {
    'hi': /[\u0900-\u097F]+|\S+/g,  // Hindi
    'ta': /[\u0B80-\u0BFF]+|\S+/g,  // Tamil
    'te': /[\u0C00-\u0C7F]+|\S+/g,  // Telugu
    'ml': /[\u0D00-\u0D7F]+|\S+/g,  // Malayalam
    'en': /\S+/g                    // English (fallback)
  };
  
  // Get the appropriate regex pattern for the source language
  const pattern = scriptPatterns[fromLang] || scriptPatterns['en'];
  
  // Split text into words, preserving punctuation
  const words = text.match(pattern) || [];
  
  // Filter out very short words for better performance
  // but process all words to maintain sequence
  const translations = await Promise.all(
    words.map(async (word) => {
      // For very short words or punctuation, use simpler translation
      const needsFullTranslation = word.length > 1 && !/^[.,!?;:।॥]$/.test(word);
      
      const [english, tamil, telugu, malayalam] = await Promise.all([
        needsFullTranslation ? translateText(word, fromLang, 'en') : word,
        needsFullTranslation ? translateText(word, fromLang, 'ta') : word,
        needsFullTranslation ? translateText(word, fromLang, 'te') : word,
        needsFullTranslation ? translateText(word, fromLang, 'ml') : word
      ]);

      return {
        sourceText: word,
        english: english || word,
        tamil: tamil || word,
        telugu: telugu || word,
        malayalam: malayalam || word
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
      const { originalText, userAnswer, targetLanguage, sourceLanguage = "hi" } = req.body;

      if (!originalText || !userAnswer || !targetLanguage) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Map target language name to language code
      const targetLangCode = {
        "english": "en",
        "tamil": "ta",
        "telugu": "te",
        "malayalam": "ml"
      }[targetLanguage];

      if (!targetLangCode) {
        return res.status(400).json({ message: "Invalid target language" });
      }

      // Get the system translation
      const systemTranslation = await translateText(originalText, sourceLanguage, targetLangCode);

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
      const { text, sourceLanguage = 'hi', targetLanguages = ['en'] } = req.body;

      // Ensure at least English is included in target languages
      const languages = Array.isArray(targetLanguages) 
        ? (targetLanguages.includes('en') ? targetLanguages : [...targetLanguages, 'en']) 
        : ['en'];

      // Map to translate text to all requested languages
      const translationPromises = languages.map(lang => 
        translateText(text, sourceLanguage, lang)
      );

      const translationResults = await Promise.all(translationPromises);
      
      // Create result object
      const translations: Record<string, string> = {
        sourceText: text,
        sourceLanguage
      };

      // Add results for each target language
      languages.forEach((lang, index) => {
        translations[lang] = translationResults[index];
      });

      // Prepare data for storage
      const storageData = {
        sourceText: text,
        sourceLanguage,
        english: translations.en || '',
        tamil: translations.ta || '',
        telugu: translations.te || '',
        malayalam: translations.ml || ''
      };

      const validatedData = insertTranslationSchema.parse(storageData);
      await storage.createTranslation(validatedData);

      res.json(translations);
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({ message: "Translation failed" });
    }
  });

  app.post("/api/translate/text", async (req, res) => {
    try {
      const { text, sourceLanguage = 'hi', targetLanguages = ['en'] } = req.body;

      // Language script patterns for validation
      const scriptPatterns: Record<string, RegExp> = {
        'hi': /[\u0900-\u097F]/,  // Hindi
        'ta': /[\u0B80-\u0BFF]/,  // Tamil
        'te': /[\u0C00-\u0C7F]/,  // Telugu
        'ml': /[\u0D00-\u0D7F]/,  // Malayalam
        'en': /[a-zA-Z]/          // English
      };
      
      // Validate that the text contains characters in the source language
      const pattern = scriptPatterns[sourceLanguage];
      if (!text || (pattern && !pattern.test(text))) {
        return res.status(400).json({ 
          message: `Please provide valid text in the selected language (${sourceLanguage})` 
        });
      }

      // Ensure at least English is included in target languages
      const languages = Array.isArray(targetLanguages) 
        ? (targetLanguages.includes('en') ? targetLanguages : [...targetLanguages, 'en']) 
        : ['en'];

      // Translate to all requested languages
      const translationPromises = languages.map(lang => 
        translateText(text, sourceLanguage, lang)
      );

      // Get both full text and word-by-word translations
      const [translationResults, wordByWordTranslations] = await Promise.all([
        Promise.all(translationPromises),
        translateWords(text, sourceLanguage)
      ]);

      // Create result object
      const translations: Record<string, any> = {
        sourceText: text,
        sourceLanguage,
        wordByWord: wordByWordTranslations
      };

      // Add results for each target language
      languages.forEach((lang, index) => {
        translations[lang] = translationResults[index];
      });

      // Prepare data for storage
      const storageData = {
        sourceText: text,
        sourceLanguage,
        english: translations.en || '',
        tamil: translations.ta || '',
        telugu: translations.te || '',
        malayalam: translations.ml || ''
      };

      const validatedData = insertTranslationSchema.parse(storageData);
      await storage.createTranslation(validatedData);

      res.json(translations);
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Translation failed" 
      });
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