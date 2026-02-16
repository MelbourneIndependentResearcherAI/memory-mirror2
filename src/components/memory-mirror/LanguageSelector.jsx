import React, { useState, useEffect } from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakWithRealisticVoice } from './voiceUtils';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
];

export default function LanguageSelector({ selectedLanguage, onLanguageChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const handleLanguageSelect = (lang) => {
    onLanguageChange(lang.code);
    setIsOpen(false);
    
    const greetings = {
      en: "Language set to English",
      es: "Idioma configurado en Español",
      fr: "Langue définie en Français",
      de: "Sprache auf Deutsch eingestellt",
      it: "Lingua impostata su Italiano",
      pt: "Idioma definido para Português",
      zh: "语言设置为中文",
      ja: "言語を日本語に設定",
      ko: "언어가 한국어로 설정되었습니다",
      ar: "تم تعيين اللغة إلى العربية",
      hi: "भाषा हिंदी पर सेट की गई",
      ru: "Язык установлен на русский",
      nl: "Taal ingesteld op Nederlands",
      pl: "Język ustawiony na Polski",
      tr: "Dil Türkçe olarak ayarlandı",
      vi: "Ngôn ngữ được đặt thành Tiếng Việt",
      th: "ภาษาตั้งเป็นไทย",
      sv: "Språk inställt på Svenska",
      no: "Språk satt til Norsk",
      da: "Sprog indstillet til Dansk",
    };
    
    speakWithRealisticVoice(greetings[lang.code] || greetings.en);
  };

  return (
    <div className="mx-4 mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[56px]"
      >
        <span className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-medium">
          <Languages className="w-5 h-5" />
          <span className="flex items-center gap-2">
            <span className="text-2xl">{currentLang.flag}</span>
            <span>{currentLang.nativeName}</span>
          </span>
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 border border-blue-100 dark:border-slate-600 border-t-0 rounded-b-xl max-h-[300px] overflow-y-auto">
              <div className="grid gap-1">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang)}
                    className={`w-full p-3 rounded-lg text-left transition-all min-h-[56px] flex items-center gap-3 ${
                      selectedLanguage === lang.code
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 dark:text-slate-100">{lang.nativeName}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{lang.name}</p>
                    </div>
                    {selectedLanguage === lang.code && (
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}