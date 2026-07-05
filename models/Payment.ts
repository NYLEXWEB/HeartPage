import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  paymentId: string; // Internal unique payment tracking ID
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  signature?: string;
  amount: number; // stored in rupees (e.g. 1.00 or 49.00)
  currency: string;
  paymentMethod?: string; // card, upi, wallet, netbanking etc.
  status: "Pending" | "Paid" | "Failed" | "Refunded";
  verificationStatus: "Unverified" | "Verified" | "Failed";
  webhookStatus: "NotReceived" | "Received" | "Processed" | "Failed";
  customerName: string;
  websiteSlug: string;
  category: string;
  theme: string;
  websiteData: {
    yourName: string;
    partnerName: string;
    relationshipDate?: string;
    message: string;
    images: string[];
    customFields?: { label: string; value: string }[];
    groomPhoto?: string;
    bridePhoto?: string;
    musicEnabled?: boolean;
    selectedMusic?: string;
  };
  ipAddress?: string;
  userAgent?: string;
  verificationResult?: string;
  // Refund Support (Future Ready)
  refundStatus?: "NotRefunded" | "Pending" | "Refunded" | "Failed";
  refundDate?: Date;
  refundAmount?: number;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      required: false,
    },
    signature: {
      type: String,
      required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    paymentMethod: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    verificationStatus: {
      type: String,
      required: true,
      enum: ["Unverified", "Verified", "Failed"],
      default: "Unverified",
    },
    webhookStatus: {
      type: String,
      required: true,
      enum: ["NotReceived", "Received", "Processed", "Failed"],
      default: "NotReceived",
    },
    websiteSlug: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    websiteData: {
      yourName: { type: String, required: true },
      partnerName: { type: String, required: true },
      relationshipDate: { type: String, required: false },
      message: { type: String, required: true },
      images: { type: [String], default: [] },
      customFields: {
        type: [
          {
            label: { type: String, required: true },
            value: { type: String, required: true },
          },
        ],
        default: [],
        required: false,
      },
      groomPhoto: {
        type: String,
        required: false,
      },
      bridePhoto: {
        type: String,
        required: false,
      },
      musicEnabled: {
        type: Boolean,
        required: false,
        default: true,
      },
      selectedMusic: {
        type: String,
        required: false,
      },
    },
    ipAddress: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
    verificationResult: {
      type: String,
      required: false,
    },
    // Refund Support (Future Ready)
    refundStatus: {
      type: String,
      enum: ["NotRefunded", "Pending", "Refunded", "Failed"],
      default: "NotRefunded",
    },
    refundDate: {
      type: Date,
      required: false,
    },
    refundAmount: {
      type: Number,
      required: false,
    },
    refundReason: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
