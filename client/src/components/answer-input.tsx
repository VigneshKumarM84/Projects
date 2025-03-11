
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Translation } from '@/pages/home';
import axios from 'axios';

type AnswerInputProps = {
  sourceLanguage: string;
  targetLanguages: string[];
  onTranslationReceived: (translation: Translation) => void;
};

export default function AnswerInput({ sourceLanguage, targetLanguages, onTranslationReceived }: AnswerInputProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);

  // Character sets for each language
  const getLanguageKeyboard = (lang: string): string[] => {
    switch (lang) {
      case 'hi':
        return ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ', 'ड', 'ढ', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'ं', 'ः', '्'];
      case 'ta':
        return ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ', 'க', 'ங', 'ச', 'ஞ', 'ட', 'ண', 'த', 'ந', 'ப', 'ம', 'ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'ற', 'ன', '்', 'ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ'];
      case 'te':
        return ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ', 'క', 'ఖ', 'గ', 'ఘ', 'చ', 'ఛ', 'జ', 'ఝ', 'ట', 'ఠ', 'డ', 'ఢ', 'త', 'థ', 'ద', 'ధ', 'న', 'ప', 'ఫ', 'బ', 'భ', 'మ', 'య', 'ర', 'ల', 'వ', 'శ', 'ష', 'స', 'హ', '్', 'ా', 'ి', 'ీ', 'ు', 'ూ', 'ె', 'ే', 'ై', 'ొ', 'ో', 'ౌ'];
      case 'ml':
        return ['അ', 'ആ', 'ഇ', 'ഈ', 'ഉ', 'ഊ', 'ഋ', 'എ', 'ഏ', 'ഐ', 'ഒ', 'ഓ', 'ഔ', 'ക', 'ഖ', 'ഗ', 'ഘ', 'ങ', 'ച', 'ഛ', 'ജ', 'ഝ', 'ഞ', 'ട', 'ഠ', 'ഡ', 'ഢ', 'ണ', 'ത', 'ഥ', 'ദ', 'ധ', 'ന', 'പ', 'ഫ', 'ബ', 'ഭ', 'മ', 'യ', 'ര', 'ല', 'വ', 'ശ', 'ഷ', 'സ', 'ഹ', '്', 'ാ', 'ി', 'ീ', 'ു', 'ൂ', 'ൃ', 'െ', 'േ', 'ൈ', 'ൊ', 'ോ', 'ൌ'];
      default:
        return [];
    }
  };

  const insertCharacter = (char: string) => {
    setText(prev => prev + char);
  };

  const handleSubmit = async () => {
    if (!text.trim() || !sourceLanguage || targetLanguages.length === 0) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/translate', {
        text,
        sourceLanguage,
        targetLanguages
      });

      console.log("Translation data:", response.data);
      onTranslationReceived(response.data);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to enable direct typing in specified language
  const enableLanguageTyping = (language: string) => {
    console.log(`Switching to ${language} keyboard (placeholder implementation)`);
    // This would ideally trigger platform-specific keyboard layout changing
    // Since we can't control the system keyboard directly from the browser,
    // we'll use our virtual keyboard as an alternative
    setShowKeyboard(true);
  };

  const keyboards = {
    en: () => <p className="text-sm text-gray-500">Standard English keyboard available on your device</p>,
    hi: () => (
      <div className="flex flex-wrap gap-1 mt-2">
        {getLanguageKeyboard('hi').map((char, index) => (
          <Button 
            key={index} 
            variant="outline" 
            className="h-8 px-2" 
            onClick={() => insertCharacter(char)}
          >
            {char}
          </Button>
        ))}
      </div>
    ),
    ta: () => (
      <div className="flex flex-wrap gap-1 mt-2">
        {getLanguageKeyboard('ta').map((char, index) => (
          <Button 
            key={index} 
            variant="outline" 
            className="h-8 px-2" 
            onClick={() => insertCharacter(char)}
          >
            {char}
          </Button>
        ))}
      </div>
    ),
    te: () => (
      <div className="flex flex-wrap gap-1 mt-2">
        {getLanguageKeyboard('te').map((char, index) => (
          <Button 
            key={index} 
            variant="outline" 
            className="h-8 px-2" 
            onClick={() => insertCharacter(char)}
          >
            {char}
          </Button>
        ))}
      </div>
    ),
    ml: () => (
      <div className="flex flex-wrap gap-1 mt-2">
        {getLanguageKeyboard('ml').map((char, index) => (
          <Button 
            key={index} 
            variant="outline" 
            className="h-8 px-2" 
            onClick={() => insertCharacter(char)}
          >
            {char}
          </Button>
        ))}
      </div>
    ),
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Type in ${sourceLanguage === 'en' ? 'English' : 
                        sourceLanguage === 'hi' ? 'Hindi' : 
                        sourceLanguage === 'ta' ? 'Tamil' : 
                        sourceLanguage === 'te' ? 'Telugu' : 'Malayalam'}`}
          className="w-full"
        />
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Button 
            onClick={() => enableLanguageTyping('en')}
            variant="outline"
            size="sm"
          >
            English Keyboard
          </Button>
          <Button 
            onClick={() => enableLanguageTyping('hi')}
            variant="outline"
            size="sm"
          >
            Hindi Keyboard
          </Button>
          <Button 
            onClick={() => enableLanguageTyping('ta')}
            variant="outline"
            size="sm"
          >
            Tamil Keyboard
          </Button>
          <Button 
            onClick={() => enableLanguageTyping('te')}
            variant="outline"
            size="sm"
          >
            Telugu Keyboard
          </Button>
          <Button 
            onClick={() => enableLanguageTyping('ml')}
            variant="outline"
            size="sm"
          >
            Malayalam Keyboard
          </Button>
        </div>
      </div>
      
      {showKeyboard && sourceLanguage in keyboards && (
        <div className="border p-2 rounded-md">
          <div className="flex justify-between mb-2">
            <p className="text-sm font-medium">Virtual Keyboard</p>
            <Button size="sm" variant="ghost" onClick={() => setShowKeyboard(false)}>
              Hide
            </Button>
          </div>
          {keyboards[sourceLanguage as keyof typeof keyboards]()}
        </div>
      )}
      
      <Button 
        onClick={handleSubmit} 
        disabled={isLoading || !text.trim()} 
        className="w-full"
      >
        {isLoading ? "Translating..." : "Translate"}
      </Button>
    </div>
  );
}
