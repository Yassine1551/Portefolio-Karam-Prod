'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolio, PortfolioItem } from './PortfolioContext';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { getYouTubeId } from '@/lib/youtube';

/**
 * Presents a rotating presentation of premium portfolio configurations at the hero dimension layer.
 * Includes autonomous timer rotation and interactive layout pagination markers.
 */
export function HeroSlider() {
  const { items } = usePortfolio();
  
  const sliderItems = items.filter(item => {
    const itemCategory = item.category || (
      item.type === 'youtube' || item.type === 'video' ? 'video' : 
      item.type === 'workshop' ? 'workshop' : 'photo'
    );
    return itemCategory === 'photo' || itemCategory === 'workshop' || itemCategory === 'design';
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Mount automated progression cycle for carousel transitions
  useEffect(() => {
    if (sliderItems.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [sliderItems.length]);

  if (sliderItems.length === 0) return null;

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % sliderItems.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + sliderItems.length) % sliderItems.length);

  const currentItem = sliderItems[currentIndex];
  if (!currentItem) return null;

  // Standardize external YouTube thumbnail resolutions or default placeholders
  const getThumbnail = (item: PortfolioItem) => {
    if (item.type === 'youtube') {
      const id = getYouTubeId(item.url);
      return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : 'https://picsum.photos/1200/800';
    }
    return item.url;
  };

  return (
    <section id="home" className="relative w-full h-[60vh] md:h-[75vh] lg:h-[85vh] overflow-hidden bg-zinc-100 flex items-center justify-center">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {currentItem.type === 'video' ? (
            <video
              src={currentItem.url}
              className="object-cover w-full h-full"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : currentItem.type === 'image' || currentItem.type === 'youtube' || currentItem.type === 'workshop' ? (
            <Image
              src={getThumbnail(currentItem)}
              alt={currentItem.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority={true}
              referrerPolicy="no-referrer"
            />
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-y-0 right-4 md:right-12 z-20 flex items-center">
        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-full bg-white/80 border border-black/5 flex items-center justify-center hover:bg-white text-zinc-900 shadow-sm transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="absolute inset-y-0 left-4 md:left-12 z-20 flex items-center">
        <button
          onClick={handlePrev}
          className="w-12 h-12 rounded-full bg-white/80 border border-black/5 flex items-center justify-center hover:bg-white text-zinc-900 shadow-sm transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
    </section>
  );
}
