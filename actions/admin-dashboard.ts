"use server";

import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Website } from "@/models/Website";
import { Settings, ISettings } from "@/models/Settings";
import { Announcement, IAnnouncement } from "@/models/Announcement";
import { Payment } from "@/models/Payment";
import { Pricing } from "@/models/Pricing";
import mongoose from "mongoose";

// Helper to check authentication
async function verifyAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return !!payload;
}

// ----------------------------------------------------
// MODULE 1: Dashboard Stats
// ----------------------------------------------------

export async function getDashboardStats() {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    throw new Error("Unauthorized access. Admin authentication required.");
  }

  try {
    await connectToDatabase();
    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - 7);

    // Queries
    const totalWebsites = await Website.countDocuments();
    const activeWebsites = await Website.countDocuments({ expiresAt: { $gt: now } });
    const expiredWebsites = await Website.countDocuments({ expiresAt: { $lte: now } });
    const createdToday = await Website.countDocuments({ createdAt: { $gte: startOfToday } });
    const createdThisWeek = await Website.countDocuments({ createdAt: { $gte: startOfWeek } });

    // Financial queries
    const paymentStatsRaw = await Payment.aggregate([
      {
        $facet: {
          totalRevenue: [
            { $match: { status: "Paid" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ],
          todayRevenue: [
            { $match: { status: "Paid", createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ],
          successfulPayments: [{ $match: { status: "Paid" } }, { $count: "count" }],
          pendingPayments: [{ $match: { status: "Pending" } }, { $count: "count" }],
          failedPayments: [{ $match: { status: "Failed" } }, { $count: "count" }]
        }
      }
    ]);

    const statsGroup = paymentStatsRaw[0];
    const totalRevenue = statsGroup.totalRevenue[0]?.total || 0;
    const todayRevenue = statsGroup.todayRevenue[0]?.total || 0;
    const successfulPayments = statsGroup.successfulPayments[0]?.count || 0;
    const pendingPayments = statsGroup.pendingPayments[0]?.count || 0;
    const failedPayments = statsGroup.failedPayments[0]?.count || 0;

    // Get current publish price
    const currentPriceDoc = await Pricing.findOne().sort({ updatedAt: -1 }).lean();
    const currentPublishPrice = currentPriceDoc ? currentPriceDoc.currentPrice : 1.00;

    // Category Distribution
    const categoriesRaw = await Website.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const categories = { couples: 0, friends: 0, breakup: 0, crush: 0, birthday: 0, wedding: 0 };
    categoriesRaw.forEach((c) => {
      if (c._id in categories) {
        categories[c._id as keyof typeof categories] = c.count;
      }
    });

    // Theme Distribution
    const themesRaw = await Website.aggregate([
      { $group: { _id: "$theme", count: { $sum: 1 } } }
    ]);
    const themes = { light: 0, dark: 0 };
    themesRaw.forEach((t) => {
      if (t._id in themes) {
        themes[t._id as keyof typeof themes] = t.count;
      }
    });

    // Most Selected Template (Category)
    let mostSelectedTemplate = "None";
    let maxCount = -1;
    Object.entries(categories).forEach(([key, val]) => {
      if (val > maxCount) {
        maxCount = val;
        mostSelectedTemplate = key.charAt(0).toUpperCase() + key.slice(1);
      }
    });

    // Recent Website Creations
    const recentWebsites = await Website.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("slug category theme yourName partnerName createdAt expiresAt");

    // Storage estimation (Atlas Free tier is 512MB, we calculate text bytes size)
    const allWebsitesForStorage = await Website.find().select("message yourName partnerName slug");
    let totalBytes = 0;
    allWebsitesForStorage.forEach((web) => {
      totalBytes += (web.message?.length || 0) + (web.yourName?.length || 0) + (web.partnerName?.length || 0) + (web.slug?.length || 0);
    });
    // Add base schema overhead (approx 200 bytes per document)
    totalBytes += totalWebsites * 200;
    const storageUsageMB = parseFloat((totalBytes / (1024 * 1024)).toFixed(4));

    return {
      success: true,
      stats: {
        totalWebsites,
        activeWebsites,
        expiredWebsites,
        createdToday,
        createdThisWeek,
        categories,
        themes,
        mostSelectedTemplate,
        storageUsageMB,
        recentWebsites: JSON.parse(JSON.stringify(recentWebsites)),
        totalRevenue,
        todayRevenue,
        successfulPayments,
        pendingPayments,
        failedPayments,
        currentPublishPrice,
      }
    };
  } catch (error: any) {
    console.error("Failed to get dashboard stats:", error);
    return { success: false, error: error.message || "Failed to load dashboard statistics." };
  }
}

// ----------------------------------------------------
// MODULE 2: Website Management (Pagination, filters)
// ----------------------------------------------------

interface GetWebsitesParams {
  page: number;
  limit: number;
  search: string;
  category: string;
  status: string;
}

export async function getWebsites({ page = 1, limit = 10, search = "", category = "all", status = "all" }: GetWebsitesParams) {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    throw new Error("Unauthorized access.");
  }

  try {
    await connectToDatabase();
    const now = new Date();

    // Query builder
    const query: any = {};

    // Search query
    if (search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { slug: searchRegex },
        { yourName: searchRegex },
        { partnerName: searchRegex }
      ];
    }

    // Category filter
    if (category !== "all") {
      query.category = category;
    }

    // Status filter
    if (status !== "all") {
      if (status === "active") {
        query.expiresAt = { $gt: now };
      } else if (status === "expired") {
        query.expiresAt = { $lte: now };
      }
    }

    const totalCount = await Website.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    const websites = await Website.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(websites)),
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      }
    };
  } catch (error: any) {
    console.error("Failed to fetch websites:", error);
    return { success: false, error: error.message || "Failed to query websites." };
  }
}

export async function deleteWebsite(id: string) {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    await connectToDatabase();
    const result = await Website.findByIdAndDelete(id);
    if (!result) {
      return { success: false, error: "Website not found." };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete website." };
  }
}

export async function extendExpiry(id: string, days: number) {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    await connectToDatabase();
    const website = await Website.findById(id);
    if (!website) {
      return { success: false, error: "Website not found." };
    }

    const currentExpiry = new Date(website.expiresAt);
    const now = new Date();
    
    // If it's already expired, extend from now. Otherwise, extend from current expiresAt
    const baseDate = currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

    website.expiresAt = newExpiry;
    await website.save();

    return { success: true, newExpiry: newExpiry.toISOString() };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to extend website expiration." };
  }
}

// ----------------------------------------------------
// MODULE 6: Settings Management
// ----------------------------------------------------

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
      });
      await settings.save();
    }
    
    return { success: true, settings: JSON.parse(JSON.stringify(settings)) };
  } catch (error: any) {
    console.error("Failed to load settings:", error);
    return { success: false, error: error.message || "Failed to load global preferences." };
  }
}

export async function updateSettings(data: any) {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    await connectToDatabase();
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings(data);
    } else {
      settings.siteName = data.siteName;
      settings.logo = data.logo;
      settings.contactEmail = data.contactEmail;
      settings.socialLinks = data.socialLinks;
      settings.defaultExpiryDays = Number(data.defaultExpiryDays);
      settings.maintenanceMode = data.maintenanceMode;
      settings.paymentEnabled = data.paymentEnabled;
      settings.footerText = data.footerText;
    }

    await settings.save();
    return { success: true, settings: JSON.parse(JSON.stringify(settings)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save global configurations." };
  }
}

// ----------------------------------------------------
// MODULE 8: Announcement Management
// ----------------------------------------------------

export async function getAnnouncements() {
  try {
    await connectToDatabase();
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    return { success: true, announcements: JSON.parse(JSON.stringify(announcements)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load announcements." };
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

export async function createAnnouncement(data: any) {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    await connectToDatabase();

    // If new announcement is set to active, deactivate others
    if (data.isActive) {
      await Announcement.updateMany({}, { isActive: false });
    }

    const announcement = new Announcement({
      title: data.title,
      description: data.description,
      buttonText: data.buttonText || "",
      buttonLink: data.buttonLink || "",
      backgroundColor: data.backgroundColor || "#f43f5e",
      isActive: data.isActive || false,
    });

    await announcement.save();
    return { success: true, announcement: JSON.parse(JSON.stringify(announcement)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create announcement." };
  }
}

export async function updateAnnouncement(id: string, data: any) {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    await connectToDatabase();

    if (data.isActive) {
      await Announcement.updateMany({ _id: { $ne: id } }, { isActive: false });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return { success: false, error: "Announcement not found." };
    }

    announcement.title = data.title;
    announcement.description = data.description;
    announcement.buttonText = data.buttonText || "";
    announcement.buttonLink = data.buttonLink || "";
    announcement.backgroundColor = data.backgroundColor;
    announcement.isActive = data.isActive;

    await announcement.save();
    return { success: true, announcement: JSON.parse(JSON.stringify(announcement)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update announcement." };
  }
}

export async function deleteAnnouncement(id: string) {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    await connectToDatabase();
    const result = await Announcement.findByIdAndDelete(id);
    if (!result) {
      return { success: false, error: "Announcement not found." };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete announcement." };
  }
}

export async function toggleAnnouncementActive(id: string, isActive: boolean) {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    await connectToDatabase();

    if (isActive) {
      // deactivate all other announcements first
      await Announcement.updateMany({ _id: { $ne: id } }, { isActive: false });
    }

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!announcement) {
      return { success: false, error: "Announcement not found." };
    }

    return { success: true, announcement: JSON.parse(JSON.stringify(announcement)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle status." };
  }
}
