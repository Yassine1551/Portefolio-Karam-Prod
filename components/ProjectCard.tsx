'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, X } from 'lucide-react';
import { validateMediaUrl, getThumbnail } from '@/utils/media';

interface ProjectCardProps {
  title: string;
  mediaUrl: string;
  customThumbnail?: string;
}

export function ProjectCard({ title, mediaUrl, customThumbnail }: ProjectCardProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const mediaType = validateMediaUrl(mediaUrl);
  const thumbnailUrl = getThumbnail(mediaUrl, customThumbnail);

  if (mediaType === 'invalid') {
    return (
      <div className="w-full aspect-square md:aspect-video flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 text-center shadow-sm">
        <div className="text-2xl font-bold mb-3">⚠️</div>
        <p className="font-tajawal text-sm font-medium">الرابط غير مدعوم</p>
      </div>
    );
  }

  return (
    <>
      <div 
        className="group relative w-full aspect-square md:aspect-video rounded-2xl overflow-hidden cursor-pointer bg-zinc-200 dark:bg-zinc-800 shadow-sm hover:shadow-md transition-shadow"
        onClick={() => {
          if (mediaType === 'video') {
            setIsVideoModalOpen(true);
          }
        }}
      >
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
          {mediaType === 'video' && (
            <div className="mb-4">
              <Play className="fill-white w-12 h-12 text-white opacity-90 drop-shadow-xl" />
            </div>
          )}
          <h3 className="text-xl font-bold text-white font-tajawal drop-shadow-md translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{title}</h3>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && mediaType === 'video' && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-12">
          <div className="w-full max-w-5xl rounded-3xl overflow-hidden relative shadow-2xl bg-black border border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVideoModalOpen(false);
              }}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors border border-white/20"
            >
              <X size={20} />
            </button>
            <div className="w-full aspect-video bg-black flex items-center justify-center">
              <video
                src={mediaUrl}
                controls
                autoPlay
                preload="none"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
