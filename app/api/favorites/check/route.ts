import { NextRequest, NextResponse } from 'next/server';
import { isTrackFavorite } from '@/lib/userFavorites';

// GET /api/favorites/check - Check if a track is favorited
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const trackId = searchParams.get('trackId');

    if (!userId || !trackId) {
      return NextResponse.json({ error: 'User ID and track ID are required' }, { status: 400 });
    }

    const isFavorite = await isTrackFavorite(userId, parseInt(trackId));
    return NextResponse.json({ isFavorite });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return NextResponse.json({ error: 'Failed to check favorite status' }, { status: 500 });
  }
}
