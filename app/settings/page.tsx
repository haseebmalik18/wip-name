"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const GENRES = [
  "Pop", "Hip-Hop/Rap", "Rock", "Electronic", "R&B/Soul",
  "Alternative", "Dance", "Indie", "Latin", "Country",
];

const THEMES = [
  { id: "default", name: "Purple Haze", from: "from-purple-900/20", to: "to-pink-900/20" },
  { id: "ocean", name: "Ocean Blue", from: "from-blue-900/20", to: "to-cyan-900/20" },
  { id: "sunset", name: "Sunset", from: "from-orange-900/20", to: "to-red-900/20" },
  { id: "forest", name: "Forest", from: "from-green-900/20", to: "to-emerald-900/20" },
  { id: "midnight", name: "Midnight", from: "from-slate-900/20", to: "to-indigo-900/20" },
  { id: "abyss", name: "Abyss", from: "from-neutral-950/30", to: "to-stone-950/30" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, updateSettings } = useAuth();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectAny, setSelectAny] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      // If user has all genres OR no genres (new user), show "Any Genre - Surprise me!"
      if (user.favoriteGenres?.length === GENRES.length || user.favoriteGenres?.length === 0) {
        setSelectAny(true);
        setSelectedGenres([]);
      } else {
        setSelectedGenres(user.favoriteGenres || []);
        setSelectAny(false);
      }
      setSelectedTheme(user.theme || "default");
    }
  }, [user, loading, router]);

  const toggleGenre = (genre: string) => {
    if (selectAny) return;
    
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
    setSaved(false);
  };

  const toggleAny = () => {
    setSelectAny((prev) => !prev);
    if (!selectAny) {
      setSelectedGenres([]);
    }
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const genresToSave = selectAny ? GENRES : selectedGenres;
      await updateSettings({ genres: genresToSave, theme: selectedTheme });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const currentTheme = THEMES.find(t => t.id === selectedTheme) || THEMES[0];
  const canSave = selectAny || selectedGenres.length > 0 || selectedTheme;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.from} via-black ${currentTheme.to}`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
          
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className={`px-5 py-2 rounded-full font-medium transition-all ${
              saved
                ? "bg-green-500 text-white"
                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        <div className="max-w-2xl mx-auto p-6 space-y-10">
          {/* Genres Section */}
          <section>
            <h2 className="text-lg font-semibold mb-2">Music Preferences</h2>
            <p className="text-white/50 text-sm mb-6">
              Choose the genres you want to discover music from.
            </p>

            {/* Any Option */}
            <button
              onClick={toggleAny}
              className={`w-full mb-4 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                selectAny
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white"
                  : "bg-white/5 border-white/10 text-white/80 hover:border-purple-500/50 hover:bg-white/10"
              }`}
            >
              🎵 Any Genre — Surprise me!
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    disabled={selectAny}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      selectAny
                        ? "bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
                        : isSelected
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white"
                        : "bg-white/5 border-white/10 text-white/80 hover:border-purple-500/50 hover:bg-white/10"
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Theme Section */}
          <section>
            <h2 className="text-lg font-semibold mb-2">Theme</h2>
            <p className="text-white/50 text-sm mb-6">
              Customize the look of your app.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setSelectedTheme(theme.id);
                    setSaved(false);
                  }}
                  className={`relative px-4 py-4 rounded-xl border text-sm font-medium transition-all overflow-hidden ${
                    selectedTheme === theme.id
                      ? "border-purple-500 ring-2 ring-purple-500/50"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  {/* Theme preview gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme.from} via-black/80 ${theme.to}`} />
                  <span className="relative z-10">{theme.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Account Section */}
          <section>
            <h2 className="text-lg font-semibold mb-2">Account</h2>
            <p className="text-white/50 text-sm mb-6">
              Manage your account settings.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-sm text-white/50">{user.email}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}