import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
        // Create a user-friendly display name
        let displayName = file
          // Remove extension
          .substring(0, file.lastIndexOf("."))
          // Replace underscores, dashes, and extra spaces with spaces
          .replace(/[_-]+/g, " ")
          // Trim extra spaces
          .trim();
        
        // Shorten long names (e.g. YouTube shorts titles)
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
