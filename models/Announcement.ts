import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      required: false,
      default: "",
    },
    buttonLink: {
      type: String,
      required: false,
      default: "",
    },
    backgroundColor: {
      type: String,
      required: true,
      default: "#f43f5e", // default rose-500
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);
