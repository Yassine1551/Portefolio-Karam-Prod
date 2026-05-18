'use client';

import React from 'react';
import { useSettings } from './SettingsProvider';
import { User, Send, FileText } from 'lucide-react';

/**
 * Presents the primary application entry text and actionable navigational hooks.
 * Relies on global settings provider for localization synchronization.
 */
export function HeroIntro() {
  const { t, lang } = useSettings();
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-24 px-6 md:px-20 text-center flex flex-col items-center justify-center bg-white dark:bg-zinc-950 transition-colors">
      <h1 className="text-3xl md:text-5xl lg:text-5xl font-bold font-tajawal max-w-4xl leading-tight text-zinc-900 dark:text-zinc-50 tracking-tight">
        {t('hero_title')}
      </h1>
      <p className="mt-8 mb-10 text-zinc-500 dark:text-zinc-400 font-medium tracking-wide">
        {t('hero_scroll')}
      </p>
      
      <div className="flex flex-row w-full max-w-sm sm:max-w-md mx-auto items-center justify-center gap-2 sm:gap-3">
        <a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="flex-1 flex justify-center items-center gap-1.5 bg-neutral-900 text-white px-2 py-2.5 text-xs font-normal tracking-wide rounded-md hover:bg-neutral-800 transition-colors">
          <User size={14} className="opacity-90 shrink-0" />
          <span className="truncate">{lang === 'fr' ? 'À propos' : lang === 'en' ? 'About' : 'نبذة عني'}</span>
        </a>
        <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="flex-1 flex justify-center items-center gap-1.5 bg-neutral-900 text-white px-2 py-2.5 text-xs font-normal tracking-wide rounded-md hover:bg-neutral-800 transition-colors">
          <Send size={14} className="opacity-90 shrink-0" />
          <span className="truncate">Contact</span>
        </a>
      </div>
    </section>
  );
}
