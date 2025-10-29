import { NextRequest, NextResponse } from 'next/server';
import { getUserFavorites, addUserFavorite, removeUserFavorite, isTrackFavorite } from '@/lib/userFavorites';

// GET /api/favorites - Get user's favorites
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const favorites = await getUserFavorites(userId);
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

// POST /api/favorites - Add a favorite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, track } = body;

    if (!userId || !track) {
      return NextResponse.json({ error: 'User ID and track are required' }, { status: 400 });
    }

    const success = await addUserFavorite(userId, track);
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Track added to favorites' });
    } else {
      return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

// DELETE /api/favorites - Remove a favorite
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const trackId = searchParams.get('trackId');

    if (!userId || !trackId) {
      return NextResponse.json({ error: 'User ID and track ID are required' }, { status: 400 });
    }

    const success = await removeUserFavorite(userId, parseInt(trackId));
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Track removed from favorites' });
    } else {
      return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}
