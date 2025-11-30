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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getTopChartsByGenre(genreName: string, limit: number = 10): Promise<Track[]> {
  try {
    const genreId = GENRE_IDS[genreName];
    if (!genreId) {
      return [];
    }

    const chartLimit = Math.min(100, Math.max(limit * 3, 30));
    const response = await fetch(
      `https://itunes.apple.com/us/rss/topsongs/limit=${chartLimit}/genre=${genreId}/json`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    let entries = data.feed?.entry || [];

    entries = entries.sort(() => Math.random() - 0.5).slice(0, limit);

    const tracks = entries.map((entry: any) => {
      try {
        const trackId = entry.id.attributes['im:id'];
        const previewUrl = entry.link?.find((link: any) => link.attributes?.type === 'audio/x-m4a')?.attributes?.href;

        if (!previewUrl) {
          return null;
        }

        return {
          id: parseInt(trackId),
          title: entry['im:name'].label,
          artist: entry['im:artist'].label,
          genre: genreName,
          previewUrl: previewUrl,
          artworkUrl: entry['im:image']?.[2]?.label?.replace('170x170', '600x600') || entry['im:image']?.[2]?.label || '',
          albumName: entry['im:collection']?.['im:name']?.label || entry['im:name'].label,
          releaseDate: entry['im:releaseDate']?.attributes?.label || '',
          trackTimeMillis: 30000,
        };
      } catch (error) {
        return null;
      }
    });

    return tracks.filter((track: Track | null): track is Track => track !== null);
  } catch (error) {
    return [];
  }
}

export function getTrendingGenres(): string[] {
  return POPULAR_GENRES.sort(() => Math.random() - 0.5).slice(0, 3);
}

export async function getPopularClassics(genreName: string, limit: number = 10, randomize: boolean = true): Promise<Track[]> {
  try {
    const genreId = GENRE_IDS[genreName];
    if (!genreId) {
      return [];
    }

    const popularArtists: Record<string, string[]> = {
      'Pop': ['ariana grande', 'billie eilish', 'dua lipa', 'the weeknd', 'olivia rodrigo', 'taylor swift', 'sabrina carpenter', 'tate mcrae', 'gracie abrams', 'chappell roan', 'reneé rapp', 'madison beer', 'charli xcx', 'troye sivan', 'lana del rey'],
      'Hip-Hop/Rap': ['drake', 'travis scott', 'playboi carti', 'lil uzi vert', 'future', '21 savage', 'metro boomin', 'don toliver', 'yeat', 'destroy lonely', 'central cee', 'dave', 'ken carson', 'baby keem', 'lil tecca', 'skilla baby', 'nardo wick', 'luh tyler'],
      'Electronic': ['calvin harris', 'marshmello', 'david guetta', 'kygo', 'zedd', 'skrillex', 'martin garrix', 'alesso', 'timmy trumpet', 'diplo', 'illenium', 'subtronics'],
      'R&B/Soul': ['sza', 'frank ocean', 'the weeknd', 'summer walker', 'brent faiyaz', 'jhene aiko', 'partynextdoor', 'daniel caesar', 'steve lacy', 'omar apollo', 'kali uchis', 'victoria monet'],
      'Alternative': ['arctic monkeys', 'the 1975', 'tame impala', 'glass animals', 'wallows', 'the neighbourhood', 'boygenius', 'phoebe bridgers', 'cigarettes after sex', 'bad omens', 'sleep token'],
      'Dance': ['disclosure', 'fred again', 'odesza', 'rufus du sol', 'kaytranada', 'flume', 'john summit', 'fisher', 'chris lake', 'eli brown', 'mau p'],
      'Rock': ['foo fighters', 'the killers', 'royal blood', 'nothing but thieves', 'highly suspect', 'greta van fleet'],
      'Country': ['morgan wallen', 'luke combs', 'zach bryan', 'jelly roll', 'hardy', 'parker mccollum'],
      'Latin': ['bad bunny', 'peso pluma', 'karol g', 'feid', 'rauw alejandro', 'myke towers'],
      'Indie': ['the last dinner party', 'wet leg', 'beabadoobee', 'clairo', 'boy pablo', 'rex orange county', 'faye webster', 'mitski', 'girl in red', 'mxmtoon', 'conan gray'],
    };

    const artists = popularArtists[genreName] || [];
    if (artists.length === 0) {
      return [];
    }

    const numArtists = Math.min(Math.ceil(limit / 3), artists.length);
    const tracksPerArtist = Math.ceil(limit / numArtists);

    const shuffledArtists = [...artists].sort(() => Math.random() - 0.5);
    const selectedArtists = shuffledArtists.slice(0, numArtists);

    const allTracks: any[] = [];

    for (const artist of selectedArtists) {
      await delay(50);

      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&media=music&entity=song&limit=50`
      );

      if (!response.ok) {
        continue;
      }

      const data = await response.json();

      const availableTracks = data.results.filter((item: any) => item.previewUrl);

      let selectedTracks;
      if (randomize) {
        selectedTracks = availableTracks
          .sort(() => Math.random() - 0.5)
          .slice(0, tracksPerArtist);
      } else {
        selectedTracks = availableTracks
          .sort((a: any, b: any) => (b.trackViewCount || 0) - (a.trackViewCount || 0))
          .slice(0, tracksPerArtist);
      }

      allTracks.push(...selectedTracks);
    }

    const tracks = allTracks
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
  } catch {
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

export async function getTracksForUserGenres(genres: string[], limit: number = 20): Promise<Track[]> {
  const allTracks: Track[] = [];
  const tracksPerGenre = Math.ceil(limit / genres.length);

  for (const genre of genres) {
    const genreTracks = await getTopChartsByGenre(genre, tracksPerGenre);
    allTracks.push(...genreTracks);
  }

  const seenIds = new Set();
  const uniqueTracks = allTracks.filter(track => {
    if (seenIds.has(track.id)) return false;
    seenIds.add(track.id);
    return true;
  });

  return uniqueTracks.sort(() => Math.random() - 0.5);
}