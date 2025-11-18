'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import SwipeCard from '@/components/SwipeCard';
import { searchTracks, getRandomGenres, type Track } from '@/lib/itunes';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const userId = user?.id || '';
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // MongoDB-backed favorites
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites(userId);

  const {
    isPlaying,
    currentTime,
    duration,
    loadTrack,
    togglePlayPause,
    seek,
    analyser,
    pause
  } = useAudioPlayer();

  useEffect(() => {
    async function fetchMusic() {
      setIsLoading(true);
      const genres = getRandomGenres();
      const allTracks: Track[] = [];

      for (const genre of genres) {
        const genreTracks = await searchTracks(genre, 10);
        allTracks.push(...genreTracks);
      }

      const shuffled = allTracks.sort(() => Math.random() - 0.5);
      setTracks(shuffled.slice(0, 30));
      setIsLoading(false);
    }

    fetchMusic();
  }, []);

  useEffect(() => {
    if (tracks.length > 0 && tracks[currentIndex]) {
      pause();
      loadTrack(tracks[currentIndex].previewUrl);
    }
  }, [currentIndex, tracks, loadTrack, pause]);

  const handleSave = async () => {
    const currentTrack = tracks[currentIndex];
    if (!currentTrack) return;

    if (isFavorite(currentTrack.id)) {
      // Remove from favorites
      await removeFavorite(currentTrack.id);
    } else {
      // Add to favorites
      await addFavorite(currentTrack);
    }
  };

  const goToNext = useCallback(() => {
    setDirection('down');
    setCurrentIndex((prev) => {
      if (prev < tracks.length - 1) {
        return prev + 1;
      }
      return prev;
    });
    setShowHint(false);
  }, [tracks.length]);

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const currentTrack = tracks[currentIndex];

  if (authLoading || isLoading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/60 text-sm tracking-wider uppercase">
            {authLoading ? 'Loading...' : 'Loading music...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen bg-black overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50 pointer-events-none z-10" />

      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex items-center justify-between backdrop-blur-sm bg-black/20">
        <div className="flex items-center gap-4">
          <h1 className="text-white/90 text-xs font-light tracking-widest uppercase">
            Discover
          </h1>
          <span className="text-white/40 text-xs">
            {user.fullName}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Favorites Button */}
          <Link
            href="/favorites"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-white/60 text-sm font-light">{favorites.length}</span>
          </Link>

          {/* Save Current Track Button */}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            <svg className="w-4 h-4 text-white/60" fill={isFavorite(currentTrack?.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isFavorite(currentTrack?.id) ? 0 : 2} viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-white/60 text-sm font-light">
              {isFavorite(currentTrack?.id) ? 'Saved' : 'Save'}
            </span>
          </button>

          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/60 hover:bg-white/20 hover:text-white transition-all text-sm font-light"
          >
            Logout
          </button>
        </div>
      </div>

      {showHint && currentIndex === 0 && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-pulse">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-widest text-white/50">Scroll to explore</p>
            <svg className="w-8 h-8 text-white/40 mx-auto animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )}

      {currentIndex < tracks.length && currentTrack ? (
        <SwipeCard
          track={currentTrack}
          isSaved={isFavorite(currentTrack.id)}
          direction={direction}
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          currentTime={currentTime}
          duration={duration}
          onSeek={seek}
          analyser={analyser}
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
                {favorites.length} {favorites.length === 1 ? 'track' : 'tracks'} saved to your collection
              </p>
            </div>

            <button
              onClick={() => {
                setCurrentIndex(0);
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
        {tracks.map((_, index) => (
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
