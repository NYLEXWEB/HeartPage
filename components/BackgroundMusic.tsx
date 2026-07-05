"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface BackgroundMusicProps {
  category: "couples" | "friends" | "breakup" | "crush" | "birthday" | "wedding";
  enabled: boolean;
  selectedMusic?: string;
}

const MUSIC_MAP = {
  couples: "/Website Music/Couple.mp3",
  friends: "/Website Music/Besties.mp3",
  breakup: "/Website Music/Breakup.mp3",
  crush: "/Website Music/Crush.mp3",
  wedding: "/Website Music/Wedding and Birthday .mp3",
  birthday: "/Website Music/Wedding and Birthday .mp3",
};

export default function BackgroundMusic({ category, enabled, selectedMusic }: BackgroundMusicProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const src = selectedMusic ? `/Website Music/${selectedMusic}` : MUSIC_MAP[category];

  useEffect(() => {
    if (!enabled) return;

    const audio = new Audio(src);
    audio.loop = true;
    audioRef.current = audio;

    // Autoplay attempt when user clicks anywhere on the page
    const handleInteraction = () => {
      if (!hasInteracted && audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch((err) => {
            console.log("Autoplay blocked by browser policy:", err);
          });
      }
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    window.addEventListener("scroll", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [enabled, src, hasInteracted]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        })
        .catch((err) => console.error("Play failed:", err));
    }
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      <button
        onClick={togglePlay}
        className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md border border-white/10 transition-all duration-300 hover:scale-110 active:scale-95 group relative"
        aria-label="Toggle Background Music"
      >
        {isPlaying ? (
          <div className="relative w-5 h-5 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-rose-300" />
            <div className="absolute -inset-1 rounded-full border border-rose-400/20 animate-ping pointer-events-none"></div>
          </div>
        ) : (
          <VolumeX className="w-5 h-5 opacity-80" />
        )}

        {/* Elegant tooltip */}
        <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-zinc-950/80 backdrop-blur-md text-white text-[9px] font-mono tracking-widest uppercase py-1 px-3 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border border-white/5">
          {isPlaying ? "Pause Music" : "Play Music"}
        </span>
      </button>
    </div>
  );
}
