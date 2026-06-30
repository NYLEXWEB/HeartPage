import { connectToDatabase } from "@/lib/db";
import { Payment, IPayment } from "@/models/Payment";
import { Website, IWebsite } from "@/models/Website";
import { razorpay, verifyPaymentSignature } from "@/lib/razorpay";
import crypto from "crypto";

interface CreatePendingParams {
  slug: string;
  category: string;
  theme: string;
  customerName: string;
  yourName: string;
  partnerName: string;
  relationshipDate?: string;
  message: string;
  images: string[];
  amount: number;
  razorpayOrderId: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Creates a payment log in the MongoDB database in Pending status.
 */
export async function createPendingPayment(params: CreatePendingParams): Promise<IPayment> {
  await connectToDatabase();

  const paymentId = `HP_PAY_${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

  const payment = new Payment({
    paymentId,
    razorpayOrderId: params.razorpayOrderId,
    amount: params.amount,
    currency: "INR",
    status: "Pending",
    verificationStatus: "Unverified",
    webhookStatus: "NotReceived",
    websiteSlug: params.slug,
    category: params.category,
    theme: params.theme,
    customerName: params.customerName,
    websiteData: {
      yourName: params.yourName,
      partnerName: params.partnerName,
      relationshipDate: params.relationshipDate,
      message: params.message,
      images: params.images,
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  await payment.save();
  console.log(`Payment created: ID ${paymentId}, Order ${params.razorpayOrderId}, status: Pending`);
  return payment;
}

interface ProcessSuccessfulParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
  verifiedBy: "client" | "webhook";
  paymentMethod?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Verifies the payment signature and transitions payment to Paid, publishing the website.
 * This function is fully idempotent.
 */
export async function processSuccessfulPayment(params: ProcessSuccessfulParams): Promise<{
  success: boolean;
  payment: IPayment;
  website: IWebsite;
}> {
  await connectToDatabase();

  // Find payment document
  const payment = await Payment.findOne({ razorpayOrderId: params.razorpayOrderId });
  if (!payment) {
    throw new Error(`Payment order not found: ${params.razorpayOrderId}`);
  }

  // If already paid, idempotently retrieve or publish the website
  if (payment.status === "Paid") {
    const website = await publishWebsiteFromPayment(payment);
    return { success: true, payment, website };
  }

  // Verify Razorpay payment signature (only if verified by client)
  let isSignatureValid = true;
  if (params.verifiedBy === "client") {
    isSignatureValid = verifyPaymentSignature(
      params.razorpayOrderId,
      params.razorpayPaymentId,
      params.signature
    );
  }

  if (!isSignatureValid) {
    payment.status = "Failed";
    payment.verificationStatus = "Failed";
    payment.verificationResult = `Failed verification via ${params.verifiedBy}`;
    if (params.ipAddress) payment.ipAddress = params.ipAddress;
    if (params.userAgent) payment.userAgent = params.userAgent;
    await payment.save();
    throw new Error("Invalid payment signature");
  }

  // Fetch payment method details from Razorpay if not provided
  let paymentMethod = params.paymentMethod;
  if (!paymentMethod && params.razorpayPaymentId && params.razorpayPaymentId !== "webhook_verified") {
    try {
      const details = await razorpay.payments.fetch(params.razorpayPaymentId);
      if (details && details.method) {
        paymentMethod = details.method;
      }
    } catch (err) {
      console.error("Failed to fetch payment method from Razorpay:", err);
    }
  }

  // Update payment status to Paid atomically
  payment.status = "Paid";
  payment.verificationStatus = "Verified";
  payment.webhookStatus = params.verifiedBy === "webhook" ? "Processed" : payment.webhookStatus;
  
  if (params.razorpayPaymentId && params.razorpayPaymentId !== "webhook_verified") {
    payment.razorpayPaymentId = params.razorpayPaymentId;
  }
  if (params.signature && params.signature !== "webhook_verified") {
    payment.signature = params.signature;
  }
  if (paymentMethod) {
    payment.paymentMethod = paymentMethod;
  }
  payment.verificationResult = `Verified via ${params.verifiedBy}`;
  if (params.ipAddress) payment.ipAddress = params.ipAddress;
  if (params.userAgent) payment.userAgent = params.userAgent;
  await payment.save();

  console.log(`Payment marked Paid: Order ${params.razorpayOrderId}, Payment ID ${params.razorpayPaymentId}`);

  // Publish website
  const website = await publishWebsiteFromPayment(payment);

  return { success: true, payment, website };
}

/**
 * Handles the order.paid webhook event by updating payment to Paid and publishing the website.
 */
export async function processOrderPaid(params: {
  razorpayOrderId: string;
}): Promise<{
  success: boolean;
  payment: IPayment;
  website: IWebsite;
}> {
  await connectToDatabase();

  const payment = await Payment.findOne({ razorpayOrderId: params.razorpayOrderId });
  if (!payment) {
    throw new Error(`Payment order not found: ${params.razorpayOrderId}`);
  }

  if (payment.status === "Paid") {
    const website = await publishWebsiteFromPayment(payment);
    return { success: true, payment, website };
  }

  payment.status = "Paid";
  payment.verificationStatus = "Verified";
  payment.webhookStatus = "Processed";
  payment.verificationResult = "Verified via webhook order.paid";
  await payment.save();

  console.log(`Payment marked Paid via order.paid: Order ${params.razorpayOrderId}`);

  const website = await publishWebsiteFromPayment(payment);
  return { success: true, payment, website };
}

/**
 * Marks a pending payment as Failed (called when checkout fails or webhook notifies failure)
 */
export async function processFailedPayment(params: {
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  reason?: string;
}): Promise<IPayment | null> {
  await connectToDatabase();

  const payment = await Payment.findOne({ razorpayOrderId: params.razorpayOrderId });
  if (!payment) {
    return null;
  }

  if (payment.status === "Pending" || payment.status === "Failed") {
    payment.status = "Failed";
    payment.verificationStatus = "Failed";
    payment.webhookStatus = "Processed";
    payment.verificationResult = params.reason || "Payment failed event received";
    if (params.razorpayPaymentId) {
      payment.razorpayPaymentId = params.razorpayPaymentId;
    }
    await payment.save();
    console.log(`Payment marked Failed: Order ${params.razorpayOrderId}`);
  }

  return payment;
}

/**
 * Idempotently publishes the Website page based on the Payment document details.
 */
async function publishWebsiteFromPayment(payment: IPayment): Promise<IWebsite> {
  const existingWebsite = await Website.findOne({ slug: payment.websiteSlug });
  if (existingWebsite) {
    return existingWebsite;
  }

  const { yourName, partnerName, relationshipDate, message, images } = payment.websiteData;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days expiry

  const website = new Website({
    slug: payment.websiteSlug,
    category: payment.category,
    theme: payment.theme,
    yourName,
    partnerName,
    names: [yourName, partnerName],
    relationshipDate,
    message,
    images,
    expiresAt,
  });

  await website.save();
  console.log(`Successfully published website for slug: ${payment.websiteSlug}`);
  return website;
}
