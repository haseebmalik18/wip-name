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
