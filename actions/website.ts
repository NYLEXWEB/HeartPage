"use server";

import { connectToDatabase } from "@/lib/db";
import { Website } from "@/models/Website";
import { websiteFormSchema, WebsiteInput } from "@/lib/validation";

// Helper to generate a unique slug
async function generateUniqueSlug(): Promise<string> {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const length = 8;
  let attempts = 0;

  while (attempts < 10) {
    let slug = "";
    for (let i = 0; i < length; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if slug exists in DB
    const exists = await Website.findOne({ slug }).select("_id").lean();
    if (!exists) {
      return slug;
    }
    attempts++;
  }

  // Fallback with timestamp if somehow collisions happen repeatedly
  return Math.random().toString(36).substring(2, 10);
}

export type ActionResponse =
  | { success: true; slug: string }
  | { success: false; error: string };

export async function createWebsite(data: WebsiteInput): Promise<ActionResponse> {
  try {
    // 1. Connect to Database
    await connectToDatabase();

    // 2. Validate input
    const parsed = websiteFormSchema.safeParse(data);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((issue) => issue.message).join(", ");
      return { success: false, error: `Validation failed: ${errorMsg}` };
    }

    const validatedData = parsed.data;

    // 3. Generate unique slug
    const slug = await generateUniqueSlug();

    // 4. Calculate expiration date (7 days from now)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 5. Create new website
    const newWebsite = new Website({
      slug,
      category: validatedData.category,
      theme: validatedData.theme,
      yourName: validatedData.yourName,
      partnerName: validatedData.partnerName,
      relationshipDate: validatedData.relationshipDate,
      message: validatedData.message,
      images: validatedData.images,
      expiresAt,
    });

    await newWebsite.save();

    return { success: true, slug };
  } catch (error: any) {
    console.error("Error creating website:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred. Please try again.",
    };
  }
}

export async function getWebsiteBySlug(slug: string) {
  try {
    await connectToDatabase();
    
    // Find website by slug, ensuring it hasn't expired (though TTL handles this, it is safe to check here too)
    const website = await Website.findOne({
      slug,
      expiresAt: { $gt: new Date() }
    }).lean();

    if (!website) {
      return null;
    }

    // Convert MongoDB BSON properties to plain serializable JS objects for Next.js Server Components
    return {
      id: (website as any)._id.toString(),
      slug: website.slug,
      category: website.category,
      theme: website.theme,
      yourName: website.yourName,
      partnerName: website.partnerName,
      relationshipDate: website.relationshipDate || "",
      message: website.message,
      images: website.images || [],
      createdAt: website.createdAt.toISOString(),
      expiresAt: website.expiresAt.toISOString(),
    };
  } catch (error) {
    console.error(`Error loading website by slug ${slug}:`, error);
    return null;
  }
}
