import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  siteName: string;
  logo?: string; // base64 or URL
  contactEmail: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  defaultExpiryDays: number;
  maintenanceMode: boolean;
  footerText: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    siteName: {
      type: String,
      required: true,
      default: "HeartPage",
    },
    logo: {
      type: String,
      required: false,
    },
    contactEmail: {
      type: String,
      required: true,
      default: "support@heartpage.com",
    },
    socialLinks: {
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      facebook: { type: String, default: "" },
    },
    defaultExpiryDays: {
      type: Number,
      required: true,
      default: 7,
    },
    maintenanceMode: {
      type: Boolean,
      required: true,
      default: false,
    },
    footerText: {
      type: String,
      required: true,
      default: "© 2026 HeartPage. All rights reserved.",
    },
  },
  {
    timestamps: true,
  }
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
