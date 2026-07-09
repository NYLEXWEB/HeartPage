"use server";

import { connectToDatabase } from "@/lib/db";
import { Settings } from "@/models/Settings";
import { Announcement } from "@/models/Announcement";

export async function getSettings() {
  try {
    await connectToDatabase();
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Seed default settings
      settings = new Settings({
        siteName: "HeartPage",
        logo: "",
        contactEmail: "hello@heartpage.com",
        socialLinks: {
          instagram: "https://instagram.com/heartpage",
          twitter: "https://twitter.com/heartpage",
          facebook: "https://facebook.com/heartpage",
        },
        defaultExpiryDays: 5,
        maintenanceMode: false,
        paymentEnabled: true,
        footerText: "© 2026 HeartPage. All rights reserved.",
        platformVisits: 0,
      });
      await settings.save();
    }
    
    return { success: true, settings: JSON.parse(JSON.stringify(settings)) };
  } catch (error: any) {
    console.error("Failed to load settings:", error);
    return { success: false, error: error.message || "Failed to load global preferences." };
  }
}

export async function getActiveAnnouncement() {
  try {
    await connectToDatabase();
    const announcement = await Announcement.findOne({ isActive: true });
    return { success: true, announcement: announcement ? JSON.parse(JSON.stringify(announcement)) : null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function incrementPlatformVisits() {
  try {
    await connectToDatabase();
    await Settings.findOneAndUpdate(
      {},
      { $inc: { platformVisits: 1 } },
      { upsert: true, new: true }
    );
    return { success: true };
  } catch (error: any) {
    console.error("Failed to increment platform visits:", error);
    return { success: false, error: error.message };
  }
}
