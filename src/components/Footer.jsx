import React from 'react';
import { Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer 
      className="relative border-t-4 border-orange-300 dark:border-orange-700 z-10"
      style={{
        backgroundColor: '#1a1a1a',
        marginTop: '0',
        padding: '30px 20px 40px'
      }}
    >
      <div className="max-w-4xl mx-auto text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-orange-400">
          <Heart className="w-5 h-5 fill-current" />
          <span className="font-semibold text-lg">Memory Mirror</span>
        </div>
        
        <p className="text-sm text-slate-300">
          AI Companion for Dementia Care
        </p>
        
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
          <Mail className="w-4 h-4" />
          <a 
            href="mailto:mcnamaram86@gmail.com?subject=Memory%20Mirror%20Support"
            className="hover:text-orange-400 transition-colors underline"
          >
            mcnamaram86@gmail.com
          </a>
        </div>
        
        <div className="pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Memory Mirror. Created by <span className="font-semibold">Michael McNamara</span>, Melbourne, Australia.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            All rights reserved. Designed with care for families living with dementia.
          </p>
        </div>
      </div>
    </footer>
  );
}