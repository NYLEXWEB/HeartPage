import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWebsite extends Document {
  slug: string;
  category: "couples" | "friends" | "breakup";
  theme: "light" | "dark";
  yourName: string;
  partnerName: string;
  names: string[];
  relationshipDate?: string;
  message: string;
  images: string[]; // Base64 data URLs
  createdAt: Date;
  expiresAt: Date;
}

const WebsiteSchema: Schema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["couples", "friends", "breakup"],
    },
    theme: {
      type: String,
      required: true,
      enum: ["light", "dark"],
    },
    yourName: {
      type: String,
      required: true,
      trim: true,
    },
    partnerName: {
      type: String,
      required: true,
      trim: true,
    },
    names: {
      type: [String],
      required: true,
      default: [],
    },
    relationshipDate: {
      type: String,
      required: false,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 0, // This creates the TTL index: document will expire when current time > expiresAt
    },
  },
  {
    timestamps: true,
  }
);

// Prevent compiling model multiple times in Next.js hot reloading
export const Website: Model<IWebsite> =
  mongoose.models.Website || mongoose.model<IWebsite>("Website", WebsiteSchema);
