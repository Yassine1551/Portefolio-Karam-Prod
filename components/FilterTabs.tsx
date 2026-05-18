'use client';

import React from 'react';
import { CategoryType } from './PortfolioContext';
import { useSettings } from './SettingsProvider';

export type FilterCategory = 'all' | CategoryType;

interface FilterTabsProps {
  currentFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
}

/**
 * Presents navigational categorization controls allowing visitors to dynamically intersect
 * and bound rendered collections of portfolio artifacts by semantic grouping identifiers.
 * 
 * @param {FilterCategory} currentFilter - Specifies the actively targeted classification bounds.
 * @param {Function} onFilterChange - External delegator mutating contextual filtering constraints.
 */
export function FilterTabs({ currentFilter, onFilterChange }: FilterTabsProps) {
  const { lang } = useSettings();

  const tabs: { id: FilterCategory; fr: string; ar: string; en: string }[] = [
    { id: 'all', fr: 'TOUT', ar: 'الكل', en: 'ALL' },
    { id: 'video', fr: 'VIDEOS', ar: 'فيديوهات', en: 'VIDEOS' },
    { id: 'photo', fr: 'IMAGES', ar: 'صور', en: 'IMAGES' },
    { id: 'design', fr: 'LES AFFICHES', ar: 'ملصقات', en: 'DESIGNS' },
    { id: 'workshop', fr: 'FORMATIONS', ar: 'ورشات', en: 'WORKSHOPS' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-12 w-full px-4 sm:px-0">
      {tabs.map((tab) => {
        const label = lang === 'ar' ? tab.ar : lang === 'en' ? tab.en : tab.fr;
        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`
              flex items-center justify-center text-center
              px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-[11px] sm:text-xs md:text-sm font-medium tracking-wider transition-all duration-300 border-2
              ${
                currentFilter === tab.id
                  ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-900 shadow-md'
                  : 'bg-transparent border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 dark:hover:border-white dark:hover:text-white'
              }
            `}
          >
            <span className="truncate max-w-full">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
