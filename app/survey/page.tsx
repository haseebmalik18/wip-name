"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const GENRES = [
  "Pop", "Hip-Hop/Rap", "Rock", "Electronic", "R&B/Soul",
  "Alternative", "Dance", "Indie", "Latin", "Country",
];

const SAMPLE_ARTWORK = [
  "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/a2/2b/aa/a22baa0a-84cd-d7b7-7baf-b9a24c0c64ed/196872371178.jpg/600x600bb.jpg",
  "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/62/5d/f7/625df7f9-9528-9cd8-37a0-6b1fb7775634/24UMGIM96738.rgb.jpg/600x600bb.jpg",
  "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4f/91/1a/4f911a31-f3c1-ee38-f05c-3987a0cf5fca/196872372380.jpg/600x600bb.jpg",
  "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b088/886449990061.jpg/600x600bb.jpg",
  "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/cc/75/36/cc753690-28f0-35b1-f-c1f-ae56af0479d3/075679961761.jpg/600x600bb.jpg",
  "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/46/b7/0b/46b70b09-297a-8860-86e5-f3a451021fc9/196872459692.jpg/600x600bb.jpg",
];

export default function SurveyPage() {
  const router = useRouter();
  const { user, loading, completeSurvey } = useAuth();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectAny, setSelectAny] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user?.surveyCompleted) {
      router.push('/');
    }
  }, [user, loading, router]);

  const toggleGenre = (genre: string) => {
    if (selectAny) return;
    
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleAny = () => {
    setSelectAny((prev) => !prev);
    if (!selectAny) {
      setSelectedGenres([]);
    }
  };

  const handleContinue = async () => {
    setSaving(true);
    try {
      const genresToSave = selectAny ? GENRES : selectedGenres;
      await completeSurvey(genresToSave);
      router.push("/");
    } catch (error) {
      console.error("Failed to save survey:", error);
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

  const canContinue = selectAny || selectedGenres.length > 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background album art grid */}
      <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 opacity-30 blur-sm scale-110">
        {[...SAMPLE_ARTWORK, ...SAMPLE_ARTWORK, ...SAMPLE_ARTWORK, ...SAMPLE_ARTWORK].map((url, i) => (
          <div key={i} className="aspect-square">
            <img 
              src={url} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black/50 to-pink-900/40" />

      {/* Survey content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
              Choose your genres
            </h1>
            <p className="text-white/60 text-base">
              Select the genres you love, or choose "Any" for everything.
            </p>
          </div>

          {/* Any Option */}
          <button
            onClick={toggleAny}
            className={`w-full mb-4 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all backdrop-blur-sm ${
              selectAny
                ? "bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white"
                : "bg-white/10 border-white/20 text-white/80 hover:border-purple-500/50 hover:bg-white/20"
            }`}
          >
            🎵 Any Genre — Surprise me!
          </button>

          <div className="grid grid-cols-2 gap-3">
            {GENRES.map((genre) => {
              const isSelected = selectedGenres.includes(genre);
              return (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  disabled={selectAny}
                  className={`px-4 py-3.5 rounded-xl border text-sm font-medium transition-all backdrop-blur-sm ${
                    selectAny
                      ? "bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
                      : isSelected
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white"
                      : "bg-white/10 border-white/20 text-white/80 hover:border-purple-500/50 hover:bg-white/20"
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleContinue}
            disabled={!canContinue || saving}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3.5 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-10"
          >
            {saving ? "Saving..." : "Continue"}
          </button>

          {canContinue && (
            <p className="mt-4 text-center text-white/50 text-sm">
              {selectAny 
                ? "All genres selected" 
                : `${selectedGenres.length} genre${selectedGenres.length !== 1 ? "s" : ""} selected`
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
}