import React from 'react';
import { Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-orange-100 via-pink-100 to-rose-100 dark:from-orange-950 dark:via-pink-950 dark:to-rose-950 border-t-4 border-orange-300 dark:border-orange-700 py-6 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-orange-800 dark:text-orange-200">
          <Heart className="w-5 h-5 fill-current" />
          <span className="font-semibold text-lg">Memory Mirror</span>
        </div>
        
        <p className="text-sm text-slate-700 dark:text-slate-300">
          AI Companion for Dementia Care
        </p>
        
        <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Mail className="w-4 h-4" />
          <a 
            href="mailto:mcnamaram86@gmail.com?subject=Memory%20Mirror%20Support"
            className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors underline"
          >
            mcnamaram86@gmail.com
          </a>
        </div>
        
        <div className="pt-3 border-t border-orange-200 dark:border-orange-800">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} Memory Mirror. Created by <span className="font-semibold">Michael McNamara</span>, Melbourne, Australia.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            All rights reserved. Designed with care for families living with dementia.
          </p>
        </div>
      </div>
    </footer>
  );
}