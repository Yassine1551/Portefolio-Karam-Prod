'use client';

import React, { useEffect, useState } from 'react';
import { Settings2, X, Instagram, Linkedin, Facebook, Moon, Sun, Globe } from 'lucide-react';
import { useSettings, Language } from './SettingsProvider';
import { useTheme } from 'next-themes';

/**
 * Composes the universal top-level navigation bar rendering administrative routing links,
 * localized toggle states, dark mode preferences, and social integrations.
 */
export function Header() {
  const { lang, setLang, t } = useSettings();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const clickCountRef = React.useRef(0);
  const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleLogoClick = () => {
    clickCountRef.current += 1;
    
    if (clickCountRef.current >= 5) {
      window.dispatchEvent(new Event('openPasswordModal'));
      clickCountRef.current = 0;
    }
    
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1000);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-4 sm:px-6 md:px-12 py-4 flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-900 transition-colors w-full h-[72px]">
      {/* Left side */}
      <div className="flex flex-1 items-center justify-start gap-4 z-10 w-1/3">
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 text-xs font-semibold tracking-widest uppercase items-center">
          <a href="#gallery" onClick={(e) => handleNavClick(e, 'gallery')} className="hover:text-zinc-500 transition-colors text-zinc-900 dark:text-zinc-100">{t('gallery')}</a>
          <a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="hover:text-zinc-500 transition-colors text-zinc-900 dark:text-zinc-100">{lang === 'fr' ? 'À propos' : lang === 'en' ? 'About' : 'نبذة عني'}</a>
          <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="hover:text-zinc-500 transition-colors text-zinc-900 dark:text-zinc-100">{lang === 'fr' ? 'Contact' : lang === 'en' ? 'Contact' : 'اتصل بي'}</a>
        </nav>

        {/* Mobile Left (Theme) */}
        <div className="flex md:hidden items-center">
          {mounted && (
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-900 dark:text-zinc-100">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Center Logo */}
      <div 
        onClick={handleLogoClick}
        className="font-bold text-xl sm:text-2xl md:text-3xl tracking-widest uppercase absolute left-1/2 -translate-x-1/2 cursor-pointer font-sans whitespace-nowrap text-zinc-900 dark:text-white z-10 flex items-center justify-center h-full select-none"
      >
        SAID.
      </div>

      {/* Right side */}
      <div className="flex flex-1 items-center justify-end gap-1 sm:gap-6 z-10 w-1/3">
        {/* Desktop Socials & Icons */}
        <div className="hidden lg:flex items-center gap-4 text-zinc-900 dark:text-zinc-100">
          <a href="https://www.linkedin.com/in/said-bouguarne-826337181?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-500 transition-colors"><Linkedin size={18} /></a>
          <a href="https://www.instagram.com/karamprod.ma?igsh=emVqcWN3OW1kanh1&utm_source=qr" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-500 transition-colors"><Instagram size={18} /></a>
        </div>

        {/* Desktop Lang & Theme */}
        <div className="hidden md:flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-4 rtl:pl-0 rtl:border-l-0 rtl:border-r rtl:pr-4">
          {mounted && (
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-900 dark:text-zinc-100">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
          
          <button onClick={() => setLang(lang === 'ar' ? 'en' : lang === 'en' ? 'fr' : 'ar')} className="p-2 flex items-center gap-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-900 dark:text-zinc-100 text-xs font-bold uppercase">
            <Globe size={18} />
            {lang}
          </button>
        </div>

        {/* Mobile Right (Lang) */}
        <div className="flex md:hidden items-center">
          <button onClick={() => setLang(lang === 'ar' ? 'en' : lang === 'en' ? 'fr' : 'ar')} className="p-2 flex items-center gap-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-900 dark:text-zinc-100 text-xs font-bold uppercase">
            <Globe size={16} />
            <span className="leading-none mt-[2px]">{lang}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
