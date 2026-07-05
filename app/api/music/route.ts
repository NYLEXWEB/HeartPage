import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MUSIC_NAME_MAP: Record<string, string> = {
  "Besties.mp3": "Acoustic Friends Theme 🎸",
  "Breakup.mp3": "Melancholic Piano Theme 🎹",
  "Couple.mp3": "Cinematic Love Story 🎻",
  "Crush.mp3": "Romantic Ambient Theme 💖",
  "This_song🥹❤️...#love_#lovestatus_#malayalammovie_#malayalamsongs_#trendingshorts(128k).m4a": "Malayalam Love Song (Emotional) 🥹❤️",
  "Thoominnal✨_#haricharan_#viralsong_#malayalam_#lyrics_#shorts_#trending(128k).m4a": "Thoominnal (Acoustic Cover) ✨",
  "VID_20260705_054855_758.mp3": "Romantic Instrumental BGM 🎵",
  "VID_20260705_183442_527.mp3": "Sweet Guitar Ambient BGM 🎸",
  "VID_20260705_183444_947.mp3": "Violin Love Theme BGM 🎻",
  "VID_20260705_183447_419.mp3": "Heartfelt Soft Instrumental BGM 🎶",
  "Wedding and Birthday .mp3": "Wedding & Celebration Waltz 🥂",
  "rain_day_❤️(128k).m4a": "Rainy Day Mood (Lo-fi Beats) 🌧️❤️",
};

export async function GET() {
  try {
    const musicDirectory = path.join(process.cwd(), "public", "Website Music");
    
    if (!fs.existsSync(musicDirectory)) {
      return NextResponse.json({ success: true, files: [] });
    }

    const files = await fs.promises.readdir(musicDirectory);
    
    // Filter for audio formats (mp3, m4a, wav, ogg)
    const audioExtensions = [".mp3", ".m4a", ".wav", ".ogg", ".aac"];
    const audioFiles = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return audioExtensions.includes(ext);
      })
      .map((file) => {
        // If we have a premium predefined title, use it
        if (MUSIC_NAME_MAP[file]) {
          return {
            filename: file,
            displayName: MUSIC_NAME_MAP[file],
          };
        }

        // Fallback: Create a user-friendly, highly-cleaned display name
        let nameWithoutExt = file.substring(0, file.lastIndexOf("."));
        
        // Remove hashtags and anything after them (e.g. #haricharan...)
        const hashIdx = nameWithoutExt.indexOf("#");
        if (hashIdx !== -1) {
          nameWithoutExt = nameWithoutExt.substring(0, hashIdx);
        }
        
        // Remove parentheses and anything inside them (e.g. (128k))
        nameWithoutExt = nameWithoutExt.replace(/\([^)]*\)/g, "");

        // Remove square brackets and anything inside them
        nameWithoutExt = nameWithoutExt.replace(/\[[^\]]*\]/g, "");
        
        // Replace underscores, dashes, and extra spaces with spaces
        let displayName = nameWithoutExt
          .replace(/[_-]+/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        // Capitalize words nicely
        displayName = displayName
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        
        // If blank after cleaning, fallback to filename
        if (!displayName) {
          displayName = file;
        }

        // Shorten extremely long names
        if (displayName.length > 40) {
          displayName = displayName.substring(0, 37) + "...";
        }

        return {
          filename: file,
          displayName: displayName,
        };
      });

    return NextResponse.json({ success: true, files: audioFiles });
  } catch (error: any) {
    console.error("Error reading music directory:", error);
    return NextResponse.json(
      { success: false, error: "Failed to read music directory" },
      { status: 500 }
    );
  }
}
