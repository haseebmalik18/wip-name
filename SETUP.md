# Music Swipe App - Team Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/haseebmalik18/wip-name.git
cd wip-name
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb+srv://haider24nasar:Haider1234!@cluster0.hdzdrai.mongodb.net/music-swipe?retryWrites=true&w=majority
MONGODB_DB=music-swipe
```

### 4. Run the Development Server
```bash
npm run dev
```

### 5. Open the App
Visit `http://localhost:3000` in your browser

## 🎵 Features

### Current Functionality
- **Music Discovery**: Swipe through real tracks from iTunes API
- **Audio Previews**: Play 30-second track previews
- **Favorites System**: Save tracks to MongoDB Atlas
- **Favorites Page**: View and manage saved tracks
- **Real-time Sync**: Favorites update immediately
- **Audio Visualizer**: Visual feedback during playback

### Navigation
- **Main App** (`/`): Discover and save music
- **Favorites** (`/favorites`): View saved tracks

## 🗄️ Database

### MongoDB Atlas
- **Database**: `music-swipe`
- **Collection**: `users`
- **Current User**: `demo-user-123` (shared for all team members)

### Data Structure
```json
{
  "userId": "demo-user-123",
  "favorites": [
    {
      "id": 123456,
      "title": "Song Title",
      "artist": "Artist Name",
      "genre": "pop",
      "previewUrl": "https://...",
      "artworkUrl": "https://...",
      "albumName": "Album Name",
      "releaseDate": "2024-01-01",
      "trackTimeMillis": 180000,
      "addedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "preferences": {
    "favoriteGenres": [],
    "discoveryMode": "random"
  }
}
```

## 🔧 Development

### Project Structure
```
wip-name/
├── app/
│   ├── api/favorites/     # Favorites API endpoints
│   ├── favorites/         # Favorites page
│   └── page.tsx           # Main discovery page
├── components/
│   └── SwipeCard.tsx      # Track display component
├── hooks/
│   ├── useAudioPlayer.ts  # Audio playback hook
│   └── useFavorites.ts    # Favorites management hook
├── lib/
│   ├── itunes.ts          # iTunes API integration
│   ├── mongodb.ts         # Database connection
│   └── userFavorites.ts   # Favorites database functions
└── .env.local             # Environment variables
```

### API Endpoints
- `GET /api/favorites?userId=demo-user-123` - Get user favorites
- `POST /api/favorites` - Add a favorite
- `DELETE /api/favorites?userId=demo-user-123&trackId=123` - Remove favorite
- `GET /api/favorites/check?userId=demo-user-123&trackId=123` - Check if favorited

## 🎯 Current Status

### ✅ Completed
- Real music data from iTunes API
- Audio playback with visualizer
- MongoDB Atlas integration
- Favorites system with persistence
- Duplicate prevention
- Real-time UI updates

### 🔄 Next Steps
- User authentication (Cognito/Firebase/Supabase)
- Individual user accounts
- User preferences and settings
- Enhanced mobile experience

## 🐛 Troubleshooting

### Common Issues
1. **MongoDB Connection Error**: Check `.env.local` file exists
2. **Audio Not Playing**: Check browser autoplay policies
3. **Favorites Not Loading**: Verify MongoDB Atlas connection

### Getting Help
- Check the terminal for error messages
- Verify all dependencies are installed
- Ensure `.env.local` file is in the root directory

## 📝 Notes

- All team members currently share the same user account (`demo-user-123`)
- Favorites are stored in MongoDB Atlas cloud database
- No local database setup required
- App works offline for discovery, needs internet for favorites sync

## 🚀 Ready to Code!

Your team can now:
1. Clone the repo
2. Install dependencies
3. Add the `.env.local` file
4. Run `npm run dev`
5. Start developing!

Happy coding! 🎵✨
