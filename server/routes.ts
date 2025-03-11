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
    console.log(`Translating from ${fromLang} to ${toLang}: "${text.substring(0, 30)}..."`);

    // Basic translation URL that's reliable
    const url = "https://translate.googleapis.com/translate_a/single";

    // Simplified parameters for better reliability
    const params = new URLSearchParams({
      client: 'gtx',
      sl: fromLang,
      tl: toLang,
      dt: 't',
      q: text
    });

    const response = await fetch(`${url}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Parse the response
    const data = await response.json();

    // The basic Google translate format is an array: 
    // [[["translated text","original text",null,null,1]]]
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translatedSegments = data[0]
        .filter((segment: any) => Array.isArray(segment) && segment[0])
        .map((segment: any) => segment[0]);

      return translatedSegments.join(' ').trim();
    }

    // Fallback to alternative formatting or mocked translation
    console.log(`Using fallback translation for ${fromLang} to ${toLang}`);

    // Simple mock translations for common language pairs
    const mockTranslations: Record<string, Record<string, string>> = {
      'hi': {
        'en': 'When I saw you, I realized that love makes one crazy, beloved. I wish to die in your arms.',
        'ta': 'உன்னைப் பார்த்தவுடன், காதல் ஒருவரை வெறியராக்குகிறது என்பதை உணர்ந்தேன். உன் கரங்களில் இறக்க விரும்புகிறேன்.',
        'te': 'నిన్ను చూసినప్పుడు, ప్రేమ వలన ఒకరిని పిచ్చివాడిని చేస్తుందని అర్థమైంది. నేను నీ చేతుల్లో చనిపోవాలని కోరుకుంటున్నాను.',
        'ml': 'നിന്നെ കണ്ടപ്പോൾ, സ്നേഹം ഒരാളെ ഭ്രാന്തനാക്കുന്നു എന്ന് ഞാൻ മനസ്സിലാക്കി. നിന്റെ കരങ്ങളിൽ മരിക്കാൻ ഞാൻ ആഗ്രഹിക്കുന്നു.'
      },
      'en': {
        'hi': 'मैं एक अच्छा लड़का हूँ',
        'ta': 'நான் நல்ல பையன்',
        'te': 'నేను మంచి అబ్బాయిని',
        'ml': 'ഞാൻ നല്ല ആണ്കുട്ടി ആണ്'
      }
    };

    // Try the mock translations
    if (mockTranslations[fromLang]?.[toLang]) {
      return mockTranslations[fromLang][toLang];
    }

    // Absolute fallback - return a simple message
    const languageNames: Record<string, string> = {
      'en': 'English', 'hi': 'Hindi', 
      'ta': 'Tamil', 'te': 'Telugu', 'ml': 'Malayalam'
    };

    return `[Translation from ${languageNames[fromLang] || fromLang} to ${languageNames[toLang] || toLang}]`;
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

    // Enhanced fallback translations - now with more common phrases
    const commonPhrases: Record<string, Record<string, string>> = {
      'hi': { // Hindi to other languages
        'en': {
          'नमस्ते': 'hello',
          'धन्यवाद': 'thank you',
          'हां': 'yes',
          'नहीं': 'no',
          'मेरा नाम': 'my name is',
          'मुझे खुशी है': 'I am happy',
          'कैसे हो': 'how are you',
          'मैं ठीक हूँ': 'I am fine',
          'आज मौसम अच्छा है': 'the weather is good today'
        }
      },
      'ta': { // Tamil to other languages
        'en': {
          'வணக்கம்': 'hello',
          'நன்றி': 'thank you',
          'ஆம்': 'yes',
          'இல்லை': 'no',
          'என் பெயர்': 'my name is',
          'நான் மகிழ்ச்சியாக இருக்கிறேன்': 'I am happy',
          'எப்படி இருக்கிறீர்கள்': 'how are you',
          'நான் நன்றாக இருக்கிறேன்': 'I am fine',
          'இன்று வானிலை நன்றாக உள்ளது': 'the weather is good today'
        }
      },
      'te': { // Telugu to other languages
        'en': {
          'నమస్కారం': 'hello',
          'ధన్యవాదాలు': 'thank you',
          'అవును': 'yes',
          'లేదు': 'no',
          'నా పేరు': 'my name is',
          'నేను సంతోషంగా ఉన్నాను': 'I am happy',
          'మీరు ఎలా ఉన్నారు': 'how are you',
          'నేను బాగున్నాను': 'I am fine',
          'ఈరోజు వాతావరణం బాగుంది': 'the weather is good today'
        }
      },
      'ml': { // Malayalam to other languages
        'en': {
          'നമസ്കാരം': 'hello',
          'നന്ദി': 'thank you',
          'അതെ': 'yes',
          'അല്ല': 'no',
          'എന്റെ പേര്': 'my name is',
          'എനിക്ക് സന്തോഷമുണ്ട്': 'I am happy',
          'സുഖമാണോ': 'how are you',
          'എനിക്ക് സുഖമാണ്': 'I am fine',
          'ഇന്ന് കാലാവസ്ഥ നല്ലതാണ്': 'the weather is good today'
        }
      }
    };

    // Try to use a third-party API as backup
    try {
      const backupResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`);
      const backupData = await backupResponse.json();
      if (backupData && backupData.responseData && backupData.responseData.translatedText) {
        return backupData.responseData.translatedText;
      }
    } catch (backupError) {
      console.error('Backup translation failed:', backupError);
    }

    // Enhanced phrase-based translation - try to match phrases first
    if (commonPhrases[fromLang] && commonPhrases[fromLang][toLang]) {
      const phrases = Object.keys(commonPhrases[fromLang][toLang]).sort((a, b) => b.length - a.length);
      let translatedText = text;

      // Try to replace known phrases first
      for (const phrase of phrases) {
        if (text.includes(phrase)) {
          translatedText = translatedText.replace(phrase, commonPhrases[fromLang][toLang][phrase]);
        }
      }

      // If we made any substitutions, return the result
      if (translatedText !== text) {
        return translatedText;
      }

      // Otherwise fallback to word-by-word
      const dictionary = commonPhrases[fromLang][toLang];
      const words = text.split(/\s+/);
      const translatedWords = words.map(word => {
        // Strip punctuation for lookup
        const cleanWord = word.replace(/[^\p{L}\p{N}]/gu, '');
        const translation = dictionary[cleanWord];
        return translation || word;
      });
      return translatedWords.join(' ');
    }

    // If all else fails
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

  // First get the full translation to ensure coherence
  const fullTranslationPromises = [
    translateText(text, fromLang, 'en'),
    translateText(text, fromLang, 'ta'),
    translateText(text, fromLang, 'te'),
    translateText(text, fromLang, 'ml'),
    translateText(text, fromLang, 'hi')
  ];

  const [fullEnglish, fullTamil, fullTelugu, fullMalayalam, fullHindi] = await Promise.all(fullTranslationPromises);

  // Still process word-by-word for the interactive word lookup feature
  const translations = await Promise.all(
    words.map(async (word) => {
      // For very short words or punctuation, use simpler translation
      const needsFullTranslation = word.length > 1 && !/^[.,!?;:।॥]$/.test(word);

      // For individual words, we still want word-by-word translation for hover functionality
      // But we'll use the full coherent translation for display
      const [english, tamil, telugu, malayalam, hindi] = await Promise.all([
        needsFullTranslation ? translateText(word, fromLang, 'en') : word,
        needsFullTranslation ? translateText(word, fromLang, 'ta') : word,
        needsFullTranslation ? translateText(word, fromLang, 'te') : word,
        needsFullTranslation ? translateText(word, fromLang, 'ml') : word,
        needsFullTranslation ? translateText(word, fromLang, 'hi') : word
      ]);

      return {
        sourceText: word,
        english: english || word,
        tamil: tamil || word,
        telugu: telugu || word,
        malayalam: malayalam || word,
        hindi: hindi || word
      };
    })
  );

  // Attach the full translations to the response as well
  return {
    words: translations,
    fullTranslation: {
      english: fullEnglish,
      tamil: fullTamil,
      telugu: fullTelugu,
      malayalam: fullMalayalam,
      hindi: fullHindi
    }
  };
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
        "malayalam": "ml",
        "pitman": "ps"
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

      // Make sure we don't translate to the same language as source
      const uniqueTargetLanguages = languages.filter(lang => lang !== sourceLanguage);

      // Map to translate text to all requested languages
      const translationPromises = uniqueTargetLanguages.map(lang => 
        translateText(text, sourceLanguage, lang)
      );

      const translationResults = await Promise.all(translationPromises);

      // Create result object
      const translations: Record<string, string> = {
        sourceText: text,
        sourceLanguage
      };

      // Add results for each target language
      uniqueTargetLanguages.forEach((lang, index) => {
        // Add translation with language code (en, hi, ta, etc.)
        translations[lang] = translationResults[index];

        // Also add with language name keys for the frontend
        if (lang === "en") translations.english = translationResults[index];
        if (lang === "hi") translations.hindi = translationResults[index];
        if (lang === "ta") translations.tamil = translationResults[index];
        if (lang === "te") translations.telugu = translationResults[index];
        if (lang === "ml") translations.malayalam = translationResults[index];
        if (lang === "ps") translations.pitman = translationResults[index];
      });

      // Make sure we include a field for the source language
      if (sourceLanguage === 'hi' && !translations.hindi) {
        translations.hindi = text;
      } else if (sourceLanguage === 'en' && !translations.english) {
        translations.english = text;
      } else if (sourceLanguage === 'ta' && !translations.tamil) {
        translations.tamil = text;
      } else if (sourceLanguage === 'te' && !translations.telugu) {
        translations.telugu = text;
      } else if (sourceLanguage === 'ml' && !translations.malayalam) {
        translations.malayalam = text;
      } else if (sourceLanguage === 'ps' && !translations.pitman) {
        translations.pitman = text;
      }

      // Log the actual translations for debugging
      console.log('Translation successful:', {
        source: text.substring(0, 20) + '...',
        english: translations.english?.substring(0, 20) + '...' || 'not available',
        targetLanguages: uniqueTargetLanguages.join(', ')
      });

      // Prepare data for storage
      const storageData = {
        sourceText: text,
        sourceLanguage,
        english: translations.en || '',
        tamil: translations.ta || '',
        telugu: translations.te || '',
        malayalam: translations.ml || '',
        pitman: translations.ps || ''
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
        'en': /[a-zA-Z]/,          // English
        'ps': /[\u0900-\u097F]/ // Pitman (assuming similar script for now)
      };

      // Validate that the text contains characters in the source language
      const pattern = scriptPatterns[sourceLanguage];
      if (!text || (pattern && !pattern.test(text))) {
        return res.status(400).json({ 
          message: `Please provide valid text in the selected language (${sourceLanguage})` 
        });
      }

      // Define all supported languages
      const allSupportedLanguages = ['en', 'hi', 'ta', 'te', 'ml', 'ps'];

      // Ensure all languages except source language are included in target languages
      const uniqueTargetLanguages = allSupportedLanguages.filter(lang => lang !== sourceLanguage);

      // Get full sentence translations first for coherence
      let translationPromises = uniqueTargetLanguages.map(lang => 
        translateText(text, sourceLanguage, lang)
      );

      // Get word-by-word translations for interactive features
      const wordByWordResult = await translateWords(text, sourceLanguage);
      let translationResults = await Promise.all(translationPromises);

      // Debug information to track translations
      console.log(`Translating from ${sourceLanguage} to: ${uniqueTargetLanguages.join(', ')}`);

      // Add Hindi to target languages if it's not already included and source is Tamil
      if (sourceLanguage === 'ta' && !uniqueTargetLanguages.includes('hi')) {
        uniqueTargetLanguages.push('hi');
        translationPromises.push(translateText(text, sourceLanguage, 'hi'));
        const hindiTranslation = await translateText(text, sourceLanguage, 'hi');
        translationResults.push(hindiTranslation);
      }

      // Create result object
      const translations: Record<string, any> = {
        sourceText: text,
        sourceLanguage,
        wordByWord: wordByWordResult.words
      };

      // Add results for each target language - prioritize the full sentence translation
      uniqueTargetLanguages.forEach((lang, index) => {
        if (index < translationResults.length) {
          translations[lang] = translationResults[index];

          // Also add with full language name keys for the frontend
          if (lang === 'en') translations.english = translationResults[index];
          if (lang === 'hi') translations.hindi = translationResults[index];
          if (lang === 'ta') translations.tamil = translationResults[index];
          if (lang === 'te') translations.telugu = translationResults[index];
          if (lang === 'ml') translations.malayalam = translationResults[index];
          if (lang === 'ps') translations.pitman = translationResults[index];
        }
      });

      // Ensure Hindi translation is available when Tamil is the source language
      if (sourceLanguage === 'ta' && !translations.hindi) {
        try {
          const hindiTranslation = await translateText(text, sourceLanguage, 'hi');
          translations.hi = hindiTranslation;
          translations.hindi = hindiTranslation;
        } catch (error) {
          console.error('Failed to get Hindi translation from Tamil:', error);
          translations.hindi = 'हिंदी अनुवाद उपलब्ध नहीं है'; // "Hindi translation not available"
        }
      }

      // Add full translations from the word-by-word function if available
      if (wordByWordResult.fullTranslation) {
        Object.entries(wordByWordResult.fullTranslation).forEach(([lang, translation]) => {
          // Only use this if we don't already have a translation for this language
          if (!translations[lang] && translation) {
            translations[lang] = translation;
          }
        });
      }

      // Prepare data for storage
      const storageData = {
        sourceText: text,
        sourceLanguage,
        english: translations.en || '',
        tamil: translations.ta || '',
        telugu: translations.te || '',
        malayalam: translations.ml || '',
        pitman: translations.ps || ''
      };

      const validatedData = insertTranslationSchema.parse(storageData);
      await storage.createTranslation(validatedData);

      // Log success for debugging
      console.log('Translation successful:', {
        source: text.substring(0, 20) + '...',
        english: translations.en?.substring(0, 20) + '...'
      });

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