import React from 'react';
import { PortfolioProvider } from '@/components/PortfolioContext';
import { Header } from '@/components/Header';
import { HeroIntro } from '@/components/HeroIntro';
import { HeroSlider } from '@/components/HeroSlider';
import { PortfolioSection } from '@/components/PortfolioSection';
import { AboutSection } from '@/components/AboutSection';
import { Contact } from '@/components/Contact';
import { FloatingButtons } from '@/components/FloatingButtons';

/**
 * Serves as the primary mounting anchor for the application hierarchy,
 * initializing context providers and sequential semantic section blocks.
 */
export default function Home() {
  return (
    <PortfolioProvider>
      <main className="min-h-screen bg-white text-zinc-900 overflow-x-hidden">
        <Header />
        <HeroIntro />
        <HeroSlider />
        <PortfolioSection />
        <AboutSection />
        <Contact />
        <FloatingButtons />
      </main>
    </PortfolioProvider>
  );
}
