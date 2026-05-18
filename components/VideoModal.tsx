'use client';

import React from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  url: string;
  onClose: () => void;
}

/**
 * Orchestrates a full-screen cinematic overlay mechanism capable of resolving 
 * and embedding recognized remote video payloads via standard iframe containment.
 * 
 * @param {string} url - Target valid external or internal media transport identifier.
 * @param {Function} onClose - Egress callback triggering overlay dismount.
 */
export function VideoModal({ url, onClose }: VideoModalProps) {
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return match ? match[1] : null;
  };

  const ytId = getYouTubeId(url);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-[60] text-white"
        aria-label="Close"
      >
        <X size={24} />
      </button>
      <div className="w-full max-w-6xl aspect-video rounded-2xl overflow-hidden relative shadow-2xl bg-zinc-900 border border-white/10">
        {ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
            title="YouTube video player"
            className="w-full h-full object-contain"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        ) : (
          <video
            src={url}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        )}
      </div>
    </div>
  );
}
