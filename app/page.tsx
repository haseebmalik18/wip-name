'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import SwipeCard from '@/components/SwipeCard';

const musicData = [
  {
    id: 1,
    title: "Song Name 1",
    artist: "Artist Name",
    genre: "Genre",
    color: "from-indigo-900 via-purple-900 to-violet-800"
  },
  {
    id: 2,
    title: "Song Name 2",
    artist: "Artist Name",
    genre: "Genre",
    color: "from-pink-900 via-fuchsia-800 to-purple-900"
  },
  {
    id: 3,
    title: "Song Name 3",
    artist: "Artist Name",
    genre: "Genre",
    color: "from-slate-900 via-blue-900 to-cyan-900"
  },
  {
    id: 4,
    title: "Song Name 4",
    artist: "Artist Name",
    genre: "Genre",
    color: "from-emerald-900 via-teal-800 to-green-900"
  },
  {
    id: 5,
    title: "Song Name 5",
    artist: "Artist Name",
    genre: "Genre",
    color: "from-rose-900 via-red-900 to-orange-900"
  },
  {
    id: 6,
    title: "Song Name 6",
    artist: "Artist Name",
    genre: "Genre",
    color: "from-gray-900 via-slate-800 to-neutral-900"
  }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedTracks, setSavedTracks] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(true);
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    if (!savedTracks.includes(musicData[currentIndex].id)) {
      setSavedTracks([...savedTracks, musicData[currentIndex].id]);
    }
  };

  const goToNext = useCallback(() => {
    setDirection('down');
    setCurrentIndex((prev) => {
      if (prev < musicData.length - 1) {
        return prev + 1;
      }
      return prev;
    });
    setShowHint(false);
  }, []);

  const goToPrevious = useCallback(() => {
    setDirection('up');
    setCurrentIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
    setShowHint(false);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isScrollingRef.current) return;

      isScrollingRef.current = true;

      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }

      if (e.deltaY > 0) {
        goToNext();
      } else if (e.deltaY < 0) {
        goToPrevious();
      }

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [goToNext, goToPrevious]);

  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndY.current = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY.current;
    const threshold = 50;

    if (Math.abs(deltaY) > threshold && !isScrollingRef.current) {
      isScrollingRef.current = true;

      if (deltaY > 0) {
        goToNext();
      } else {
        goToPrevious();
      }

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  };

  const currentTrack = musicData[currentIndex];

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen bg-black overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50 pointer-events-none z-10" />

      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex items-center justify-between backdrop-blur-sm bg-black/20">
        <h1 className="text-white/90 text-xs font-light tracking-widest uppercase">
          Discover
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            <svg className="w-4 h-4 text-white/60" fill={savedTracks.includes(currentTrack?.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={savedTracks.includes(currentTrack?.id) ? 0 : 2} viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-white/60 text-sm font-light">{savedTracks.length}</span>
          </button>
        </div>
      </div>

      {showHint && currentIndex === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none animate-pulse">
          <div className="text-center space-y-4">
            <svg className="w-10 h-10 text-white/30 mx-auto animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
            <p className="text-xs uppercase tracking-widest text-white/40">Scroll to explore</p>
          </div>
        </div>
      )}

      {currentIndex < musicData.length ? (
        <SwipeCard
          track={currentTrack}
          isSaved={savedTracks.includes(currentTrack.id)}
          direction={direction}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="text-center space-y-8 p-8">
            <div className="inline-block p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
              <svg className="w-16 h-16 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>

            <div>
              <h2 className="text-white text-3xl font-light mb-3 tracking-tight">
                That&apos;s everything
              </h2>
              <p className="text-white/40 text-sm font-light tracking-wide">
                {savedTracks.length} {savedTracks.length === 1 ? 'track' : 'tracks'} saved to your collection
              </p>
            </div>

            <button
              onClick={() => {
                setCurrentIndex(0);
                setSavedTracks([]);
                setShowHint(true);
              }}
              className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-light hover:bg-white/20 transition-all text-sm tracking-wider uppercase"
            >
              Discover More
            </button>
          </div>
        </div>
      )}

      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        {musicData.map((_, index) => (
          <div
            key={index}
            className={`w-1 rounded-full transition-all ${
              index === currentIndex
                ? 'h-8 bg-white/80'
                : index < currentIndex
                ? 'h-2 bg-white/30'
                : 'h-2 bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
