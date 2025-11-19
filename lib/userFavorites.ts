import { getDatabase } from './mongodb';

export interface UserFavorite {
  trackId: number;
  title: string;
  artist: string;
  genre: string;
  previewUrl: string;
  artworkUrl: string;
  albumName: string;
  releaseDate: string;
  trackTimeMillis: number;
  addedAt: Date;
}

export interface User {
  _id?: string;
  userId: string; // Cognito user ID
  favorites: UserFavorite[];
  preferences: {
    favoriteGenres: string[];
    discoveryMode: 'random' | 'recommended';
  };
  createdAt: Date;
  updatedAt: Date;
}

export async function getUserFavorites(userId: string): Promise<UserFavorite[]> {
  try {
    const db = await getDatabase();
    const user = await db.collection<User>('users').findOne({ userId });
    return user?.favorites || [];
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }
}

export async function addUserFavorite(userId: string, track: Omit<UserFavorite, 'addedAt'>): Promise<boolean> {
  try {
    const db = await getDatabase();
    
    // Check if track is already favorited
    const existingUser = await db.collection<User>('users').findOne({
      userId,
      'favorites.trackId': track.trackId
    });
    
    if (existingUser) {
      console.log('Track already favorited, skipping...');
      return true; // Already exists, consider it successful
    }
    
    const favorite: UserFavorite = {
      ...track,
      addedAt: new Date(),
    };

    const result = await db.collection<User>('users').updateOne(
      { userId },
      { 
        $push: { favorites: favorite },
        $setOnInsert: { 
          userId, 
          preferences: { favoriteGenres: [], discoveryMode: 'random' },
          createdAt: new Date(),
        },
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    );

    return result.acknowledged;
  } catch (error) {
    console.error('Error adding user favorite:', error);
    return false;
  }
}

export async function removeUserFavorite(userId: string, trackId: number): Promise<boolean> {
  try {
    const db = await getDatabase();
    const result = await db.collection<User>('users').updateOne(
      { userId },
      { 
        $pull: { favorites: { trackId } },
        $set: { updatedAt: new Date() }
      }
    );

    return result.acknowledged;
  } catch (error) {
    console.error('Error removing user favorite:', error);
    return false;
  }
}

export async function isTrackFavorite(userId: string, trackId: number): Promise<boolean> {
  try {
    const db = await getDatabase();
    const user = await db.collection<User>('users').findOne({
      userId,
      'favorites.trackId': trackId
    });
    return !!user;
  } catch (error) {
    console.error('Error checking if track is favorite:', error);
    return false;
  }
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<User['preferences']>
): Promise<boolean> {
  try {
    const db = await getDatabase();

    // Build the $set object with only the provided preference fields
    const updateFields: any = {
      updatedAt: new Date()
    };

    if (preferences.favoriteGenres !== undefined) {
      updateFields['preferences.favoriteGenres'] = preferences.favoriteGenres;
    }

    if (preferences.discoveryMode !== undefined) {
      updateFields['preferences.discoveryMode'] = preferences.discoveryMode;
    }

    const result = await db.collection<User>('users').updateOne(
      { userId },
      {
        $set: updateFields,
        $setOnInsert: {
          userId,
          favorites: [],
          preferences: { favoriteGenres: [], discoveryMode: 'random' },
          createdAt: new Date(),
        }
      },
      { upsert: true }
    );

    return result.acknowledged;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return false;
  }
}
