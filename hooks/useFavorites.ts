import { useState, useEffect, useCallback } from 'react';

interface Track {
  id: number;
  title: string;
  artist: string;
  genre: string;
  previewUrl: string;
  artworkUrl: string;
  albumName: string;
  releaseDate: string;
  trackTimeMillis: number;
}

interface UseFavoritesReturn {
  favorites: Track[];
  isLoading: boolean;
  error: string | null;
  addFavorite: (track: Track) => Promise<boolean>;
  removeFavorite: (trackId: number) => Promise<boolean>;
  isFavorite: (trackId: number) => boolean;
  refreshFavorites: () => Promise<void>;
}

export function useFavorites(userId: string): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load favorites on mount
  useEffect(() => {
    if (userId) {
      refreshFavorites();
    }
  }, [userId]);

  const refreshFavorites = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/favorites?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      
      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
      console.error('Error loading favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const addFavorite = useCallback(async (track: Track): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          track,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add favorite');
      }

      // Update local state
      setFavorites(prev => [...prev, track]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add favorite');
      console.error('Error adding favorite:', err);
      return false;
    }
  }, [userId]);

  const removeFavorite = useCallback(async (trackId: number): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const response = await fetch(`/api/favorites?userId=${userId}&trackId=${trackId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }

      // Update local state
      setFavorites(prev => prev.filter(track => track.id !== trackId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove favorite');
      console.error('Error removing favorite:', err);
      return false;
    }
  }, [userId]);

  const isFavorite = useCallback((trackId: number): boolean => {
    return favorites.some(track => track.id === trackId);
  }, [favorites]);

  return {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refreshFavorites,
  };
}
