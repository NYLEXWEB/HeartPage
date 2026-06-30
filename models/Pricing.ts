import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPricing extends Document {
  currentPrice: number;
  currency: string;
  updatedBy: string;
  updatedAt: Date;
}

const PricingSchema: Schema = new Schema(
  {
    currentPrice: {
      type: Number,
      required: true,
      min: [0.01, "Price must be greater than zero"],
      default: 1.00,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    updatedBy: {
      type: String,
      required: true,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

export const Pricing: Model<IPricing> =
  mongoose.models.Pricing || mongoose.model<IPricing>("Pricing", PricingSchema);
