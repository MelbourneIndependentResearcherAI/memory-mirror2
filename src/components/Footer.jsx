import React from 'react';
import { Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer 
      className="relative border-t-4 border-purple-300 dark:border-purple-700 z-10 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900"
      style={{
        marginTop: '0',
        padding: '40px 20px 50px'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="text-center md:text-left space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-2 text-purple-400">
              <Heart className="w-6 h-6 fill-current animate-pulse" />
              <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Memory Mirror</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              AI Companion for Dementia Care - Bringing comfort through intelligent conversation
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-white mb-3">Quick Links</h3>
            <div className="space-y-1">
              <a href="/PrivacyPolicy" className="block text-sm text-slate-400 hover:text-purple-400 transition-colors">Privacy Policy</a>
              <a href="/TermsOfService" className="block text-sm text-slate-400 hover:text-purple-400 transition-colors">Terms of Service</a>
              <a href="/FAQ" className="block text-sm text-slate-400 hover:text-purple-400 transition-colors">FAQ & Support</a>
            </div>
          </div>
          
          {/* Contact */}
          <div className="text-center md:text-right space-y-2">
            <h3 className="font-semibold text-white mb-3">Get in Touch</h3>
            <div className="flex items-center justify-center md:justify-end gap-2 text-sm text-slate-300">
              <Mail className="w-4 h-4 text-purple-400" />
              <a 
                href="mailto:mcnamaram86@gmail.com?subject=Memory%20Mirror%20Support"
                className="hover:text-purple-400 transition-colors underline decoration-purple-400/30 hover:decoration-purple-400"
              >
                mcnamaram86@gmail.com
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="pt-6 border-t border-slate-700/50 text-center space-y-2">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Memory Mirror. Created by <span className="font-semibold text-purple-400">MM AI Technologies</span>.
          </p>
          <p className="text-xs text-slate-500">
            ABN 22366098626 • All rights reserved
          </p>
          <p className="text-xs text-slate-500">
            Designed with care for families living with dementia 💜
          </p>
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
            © {new Date().getFullYear()} Memory Mirror. Created by <span className="font-semibold">MM AI Technologies</span>.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            ABN 22366098626
          </p>
          <p className="text-xs text-slate-500 mt-1">
            All rights reserved. Designed with care for families living with dementia.
          </p>
        </div>
      </div>
    </footer>
  );
}