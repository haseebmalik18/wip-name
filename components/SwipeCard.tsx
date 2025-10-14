'use client';

import { useEffect, useState } from 'react';

interface Track {
  id: number;
  title: string;
  artist: string;
  genre: string;
  color: string;
}

interface SwipeCardProps {
  track: Track;
  isSaved: boolean;
  direction: 'up' | 'down';
}

export default function SwipeCard({ track, isSaved }: SwipeCardProps) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [track.id]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        key={key}
        className="relative w-full h-full select-none animate-slideIn"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 z-0" />

        <div className={`relative w-full h-full bg-gradient-to-br ${track.color} overflow-hidden`}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${track.color} blur-3xl opacity-40 scale-150`} />

              <div className="relative w-64 h-64 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-105">
                <svg
                  className="w-24 h-24 text-white/20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
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

          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/50 to-transparent backdrop-blur-sm">
            <div className="text-center space-y-4">
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/70 text-xs font-medium tracking-wider uppercase">
                {track.genre}
              </div>

              <h2 className="text-white text-4xl font-bold tracking-tight drop-shadow-lg">
                {track.title}
              </h2>

              <p className="text-white/60 text-xl font-light">
                {track.artist}
              </p>

              <div className="flex items-center justify-center gap-4 mt-6">
                <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110">
                  <svg
                    className="w-5 h-5 ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>

                <div className="flex-1 max-w-xs">
                  <div className="h-1 rounded-full bg-white/10 backdrop-blur-sm">
                    <div className="h-full w-1/3 rounded-full bg-white/40 transition-all"></div>
                  </div>
                </div>

                <span className="text-white/40 text-sm font-mono">0:30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
