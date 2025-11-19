export interface Track {
  id: number;
  title: string;
  artist: string;
  genre: string;
  previewUrl: string;
  artworkUrl: string;
  albumName: string;
  releaseDate: string;
  trackTimeMillis: number;
  addedAt?: string;
}

const GENRE_IDS: Record<string, number> = {
  'Pop': 14,
  'Hip-Hop/Rap': 18,
  'Rock': 21,
  'Electronic': 7,
  'R&B/Soul': 15,
  'Alternative': 20,
  'Country': 6,
  'Dance': 17,
  'Indie': 1122,
  'Latin': 12,
};

const POPULAR_GENRES = ['Pop', 'Hip-Hop/Rap', 'Electronic', 'R&B/Soul', 'Alternative', 'Dance'];

export async function getTopChartsByGenre(genreName: string, limit: number = 10): Promise<Track[]> {
  try {
    const genreId = GENRE_IDS[genreName];
    if (!genreId) {
      return [];
    }

    const response = await fetch(
      `https://itunes.apple.com/us/rss/topsongs/limit=${limit}/genre=${genreId}/json`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch top charts for ${genreName}`);
    }

    const data = await response.json();
    const entries = data.feed?.entry || [];

    const tracksWithDetails = await Promise.all(
      entries.map(async (entry: any) => {
        try {
          const trackId = entry.id.attributes['im:id'];
          const detailResponse = await fetch(
            `https://itunes.apple.com/lookup?id=${trackId}`
          );
          const detailData = await detailResponse.json();
          const detail = detailData.results?.[0];

          if (!detail?.previewUrl) {
            return null;
          }

          return {
            id: parseInt(trackId),
            title: entry['im:name'].label,
            artist: entry['im:artist'].label,
            genre: genreName,
            previewUrl: detail.previewUrl,
            artworkUrl: entry['im:image']?.[2]?.label?.replace('170x170', '600x600') || entry['im:image']?.[2]?.label || '',
            albumName: entry['im:collection']?.['im:name']?.label || entry['im:name'].label,
            releaseDate: entry['im:releaseDate']?.attributes?.label || '',
            trackTimeMillis: detail.trackTimeMillis || 0,
          };
        } catch (error) {
          console.error('Error fetching track details:', error);
          return null;
        }
      })
    );

    return tracksWithDetails.filter((track): track is Track => track !== null);
  } catch (error) {
    console.error(`Error fetching top charts for ${genreName}:`, error);
    return [];
  }
}

export function getTrendingGenres(): string[] {
  return POPULAR_GENRES.sort(() => Math.random() - 0.5).slice(0, 3);
}

export async function getPopularClassics(genreName: string, limit: number = 10): Promise<Track[]> {
  try {
    const genreId = GENRE_IDS[genreName];
    if (!genreId) {
      return [];
    }

    const popularArtists: Record<string, string[]> = {
      'Pop': ['ariana grande', 'billie eilish', 'dua lipa', 'the weeknd', 'ed sheeran'],
      'Hip-Hop/Rap': ['drake', 'kendrick lamar', 'travis scott', 'post malone', 'kanye west'],
      'Electronic': ['calvin harris', 'marshmello', 'david guetta', 'kygo', 'zedd'],
      'R&B/Soul': ['sza', 'frank ocean', 'the weeknd', 'summer walker', 'jhene aiko'],
      'Alternative': ['imagine dragons', 'twenty one pilots', 'arctic monkeys', 'tame impala', 'glass animals'],
      'Dance': ['daft punk', 'disclosure', 'deadmau5', 'swedish house mafia', 'eric prydz'],
    };

    const artists = popularArtists[genreName] || [];
    if (artists.length === 0) {
      return [];
    }

    const randomArtist = artists[Math.floor(Math.random() * artists.length)];
    
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(randomArtist)}&media=music&entity=song&limit=${limit * 2}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    const tracks = data.results
      .filter((item: any) => item.previewUrl)
      .sort((a: any, b: any) => (b.trackViewCount || 0) - (a.trackViewCount || 0))
      .slice(0, limit)
      .map((item: any) => ({
        id: item.trackId,
        title: item.trackName,
        artist: item.artistName,
        genre: genreName,
        previewUrl: item.previewUrl,
        artworkUrl: item.artworkUrl100.replace('100x100', '600x600'),
        albumName: item.collectionName,
        releaseDate: item.releaseDate,
        trackTimeMillis: item.trackTimeMillis,
      }));

    return tracks;
  } catch (error) {
    console.error(`Error fetching classics for ${genreName}:`, error);
    return [];
  }
}

export async function searchTracks(term: string = 'pop', limit: number = 30): Promise<Track[]> {
  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch tracks');
    }

    const data = await response.json();

    return data.results
      .filter((item: any) => item.previewUrl)
      .map((item: any) => ({
        id: item.trackId,
        title: item.trackName,
        artist: item.artistName,
        genre: item.primaryGenreName,
        previewUrl: item.previewUrl,
        artworkUrl: item.artworkUrl100.replace('100x100', '600x600'),
        albumName: item.collectionName,
        releaseDate: item.releaseDate,
        trackTimeMillis: item.trackTimeMillis,
      }));
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return [];
  }
}

export function getRandomGenres(): string[] {
  const genres = [
    'pop', 'rock', 'hip hop', 'electronic', 'indie', 'r&b',
    'jazz', 'classical', 'country', 'alternative', 'soul',
    'funk', 'reggae', 'blues', 'metal', 'folk', 'latin'
  ];
  return genres.sort(() => Math.random() - 0.5).slice(0, 3);
}
