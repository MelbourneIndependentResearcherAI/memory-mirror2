import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from './i18n/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  
  const languageNames = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    zh: '中文',
    ja: '日本語',
    ar: 'العربية',
    pt: 'Português',
    ru: 'Русский',
    hi: 'हिन्दी',
    it: 'Italiano',
    ko: '한국어',
    nl: 'Nederlands',
    tr: 'Türkçe',
    pl: 'Polski',
    vi: 'Tiếng Việt'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
          <Globe className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(languageNames).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code)}
            className={language === code ? 'bg-blue-50 dark:bg-blue-950' : ''}
          >
            <span className="mr-2">{code === language ? '✓' : ' '}</span>
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}