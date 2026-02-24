import React, { useState } from 'react';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: '🇬🇧 English' },
  { code: 'es', name: '🇪🇸 Español' },
  { code: 'fr', name: '🇫🇷 Français' },
  { code: 'de', name: '🇩🇪 Deutsch' },
  { code: 'zh', name: '🇨🇳 中文' },
  { code: 'ja', name: '🇯🇵 日本語' },
  { code: 'ar', name: '🇸🇦 العربية' },
  { code: 'pt', name: '🇵🇹 Português' },
  { code: 'ru', name: '🇷🇺 Русский' },
  { code: 'hi', name: '🇮🇳 हिन्दी' },
  { code: 'it', name: '🇮🇹 Italiano' },
  { code: 'ko', name: '🇰🇷 한국어' },
  { code: 'nl', name: '🇳🇱 Nederlands' },
  { code: 'tr', name: '🇹🇷 Türkçe' },
  { code: 'pl', name: '🇵🇱 Polski' },
  { code: 'vi', name: '🇻🇳 Tiếng Việt' },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = LANGUAGES.find(lang => lang.code === language);

  const handleSelectLanguage = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="w-full flex items-center gap-2 text-base h-11"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-5 h-5" />
        <span className="flex-1 text-left">{currentLanguage?.name || 'Language'}</span>
        <span className="text-xs">▼</span>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          role="listbox"
          aria-label="Language options"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-100 transition-colors border-b last:border-b-0 text-base ${
                language === lang.code ? 'bg-blue-50 font-semibold' : ''
              }`}
              role="option"
              aria-selected={language === lang.code}
            >
              <span>{lang.name}</span>
              {language === lang.code && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}