'use client';

import React from 'react';
import { useSettings } from './SettingsProvider';

/**
 * Presents localized biographical context and semantic profile information.
 */
export function AboutSection() {
  const { lang, t } = useSettings();

  return (
    <section id="about" className="py-24 px-6 md:px-20 bg-white dark:bg-zinc-950 transition-colors border-t border-zinc-100 dark:border-zinc-900">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 font-tajawal tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
          {lang === 'fr' ? 'À propos' : lang === 'en' ? 'About' : 'نبذة عني'}
        </h2>
        <div className="bg-zinc-50 dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative w-full overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <p className="text-lg md:text-2xl font-serif text-zinc-800 dark:text-zinc-200 leading-relaxed max-w-3xl mx-auto">
            <span className="block font-bold text-emerald-600 dark:text-emerald-400 mb-4 tracking-wide text-xl md:text-3xl">
              {lang === 'ar' ? 'مخرج ومنتج سمعي بصري' : lang === 'en' ? 'Audiovisual Director & Producer' : 'Réalisateur & Producteur Audiovisuel'}
            </span>
            <span className="block text-zinc-600 dark:text-zinc-400 font-medium mb-6 text-base md:text-xl">
              {lang === 'ar' ? 'متخصص في السرد القصصي المؤسساتي والتجاري' : lang === 'en' ? 'Specialist in Institutional & Corporate Storytelling' : 'Spécialiste du Storytelling Institutionnel & Corporate'}
            </span>
            <span className="block italic text-zinc-500 dark:text-zinc-500">
              {lang === 'ar' ? 'أساعد الشركات على إبراز صورة علامتها التجارية من خلال فيديوهات عالية الجودة' : lang === 'en' ? 'I help companies magnify their brand image through high-quality videos' : 'J’aide les entreprises à magnifier leur image de marque à travers la vidéo haute facture'}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
