"use server";

import { cookies, headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Admin } from "@/models/Admin";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Zod Login validation
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Simple in-memory rate limiter
const failedAttempts = new Map<string, { count: number; lockUntil: number }>();

function rateLimitCheck(key: string): { allowed: boolean; waitTimeMinutes?: number } {
  const record = failedAttempts.get(key);
  const now = Date.now();

  if (record && record.lockUntil > now) {
    const waitTime = Math.ceil((record.lockUntil - now) / 60000);
    return { allowed: false, waitTimeMinutes: waitTime };
  }

  return { allowed: true };
}

function registerFailedAttempt(key: string) {
  const record = failedAttempts.get(key) || { count: 0, lockUntil: 0 };
  record.count += 1;
  
  if (record.count >= 5) {
    // Lock for 15 minutes
    record.lockUntil = Date.now() + 15 * 60 * 1000;
  }
  
  failedAttempts.set(key, record);
}

function resetFailedAttempts(key: string) {
  failedAttempts.delete(key);
}

// Artificial delay helper for security
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function loginAdmin(data: LoginInput) {
  try {
    // 1. Connect to Database
    await connectToDatabase();

    // 2. Validate using Zod
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid username or password format." };
    }

    const { username, password } = parsed.data;
    const lowerUsername = username.toLowerCase();

    // 3. Brute force protection check
    const headerStore = await headers();
    const ip = headerStore.get("x-forwarded-for") || "unknown-ip";
    const limitKey = `${ip}:${lowerUsername}`;

    const limit = rateLimitCheck(limitKey);
    if (!limit.allowed) {
      return { 
        success: false, 
        error: `Too many failed login attempts. Try again in ${limit.waitTimeMinutes} minutes.` 
      };
    }

    // 4. Seed default admin if none exist in the collection
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const hashedDefaultPassword = await bcrypt.hash("payment", 10);
      const newAdmin = new Admin({
        username: "njanadmin",
        passwordHash: hashedDefaultPassword,
      });
      await newAdmin.save();
      console.log("Seeded default admin user (njanadmin).");
    }

    // 5. Look up admin in database
    const admin = await Admin.findOne({ username: lowerUsername });

    if (!admin) {
      // Artificial delay to prevent timing attacks & brute force scanning
      await delay(1500);
      registerFailedAttempt(limitKey);
      return { success: false, error: "Invalid credentials." };
    }

    // 6. Compare password
    const isMatch = await bcrypt.compare(password, admin.passwordHash);

    if (!isMatch) {
      await delay(1500);
      registerFailedAttempt(limitKey);
      return { success: false, error: "Invalid credentials." };
    }

    // 7. Successful login - clear rate limits and issue JWT token
    resetFailedAttempts(limitKey);
    const token = await signToken({ username: admin.username });

    // 8. Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 6 * 60 * 60, // 6 hours
      sameSite: "strict",
    });

    return { success: true };
  } catch (error: any) {
    console.error("Admin login error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

export async function logoutAdmin() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_token");
    return { success: true };
  } catch (error) {
    console.error("Admin logout error:", error);
    return { success: false, error: "Failed to log out." };
  }
}
