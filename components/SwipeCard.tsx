'use client';

import { useEffect, useState } from 'react';
import AudioVisualizer from './AudioVisualizer';
import Image from 'next/image';

const THEMES: Record<string, { from: string; via: string; to: string }> = {
  default: { from: "from-purple-900", via: "via-indigo-900", to: "to-black" },
  ocean: { from: "from-blue-900", via: "via-cyan-900", to: "to-black" },
  sunset: { from: "from-orange-900", via: "via-red-900", to: "to-black" },
  forest: { from: "from-green-900", via: "via-emerald-900", to: "to-black" },
  midnight: { from: "from-slate-900", via: "via-indigo-900", to: "to-black" },
};

interface Track {
  id: number;
  title: string;
  artist: string;
  genre: string;
  previewUrl: string;
  artworkUrl: string;
  albumName: string;
}

interface SwipeCardProps {
  track: Track;
  isSaved: boolean;
  direction: 'up' | 'down';
  isPlaying: boolean;
  onPlayPause: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  analyser: AnalyserNode | null;
  theme?: string;
}

export default function SwipeCard({
  track,
  isSaved,
  isPlaying,
  onPlayPause,
  currentTime,
  duration,
  onSeek,
  analyser,
  theme = 'default'
}: SwipeCardProps) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [track.id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        key={key}
        className="relative w-full h-full select-none animate-slideIn"
      >
<div className={`relative w-full h-full bg-gradient-to-br ${THEMES[theme].from} ${THEMES[theme].via} ${THEMES[theme].to} overflow-hidden`}>          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

          <AudioVisualizer analyser={analyser} isPlaying={isPlaying} theme={theme} />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-violet-500 blur-3xl opacity-40 scale-150" />

              <div className="relative w-64 h-64 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 hover:scale-105">
                <Image
                  src={track.artworkUrl}
                  alt={track.title}
                  fill
                  className="object-cover"
                  sizes="256px"
                  priority
                />
              </div>

              {isSaved && (
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg animate-bounce">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-8 py-4 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm">
            <div className="text-center space-y-2">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/70 text-xs font-medium tracking-wider uppercase">
                {track.genre}
              </div>

              <h2 className="text-white text-3xl font-bold tracking-tight drop-shadow-lg line-clamp-1">
                {track.title}
              </h2>

              <p className="text-white/60 text-lg font-light">
                {track.artist}
              </p>

              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={onPlayPause}
                  className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110 pointer-events-auto"
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 max-w-xs">
                  <div
                    className="h-1 rounded-full bg-white/10 backdrop-blur-sm cursor-pointer pointer-events-auto"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = x / rect.width;
                      onSeek(percentage * duration);
                    }}
                  >
                    <div
                      className="h-full rounded-full bg-white/60 transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <span className="text-white/40 text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
