import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { createPendingPayment, createFreePaymentAndPublish } from "@/lib/payment/service";
import { websiteFormSchema } from "@/lib/validation";
import { connectToDatabase } from "@/lib/db";
import { Website } from "@/models/Website";
import { Pricing } from "@/models/Pricing";
import { Settings } from "@/models/Settings";
import { z } from "zod";

// Zod validation for order creation request
const createOrderRequestSchema = z.object({
  formData: websiteFormSchema,
  images: z.array(z.string()).optional(),
});

// Helper to retrieve current configured price from MongoDB
async function getCurrentPrice(): Promise<number> {
  await connectToDatabase();
  const pricing = await Pricing.findOne().sort({ updatedAt: -1 }).lean();
  return pricing ? pricing.currentPrice : 1.00; // fallback to 1.00 INR
}

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
  return Math.random().toString(36).substring(2, 10);
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Parse and validate request payload
    const body = await request.json();
    const result = createOrderRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { formData, images = [] } = result.data;

    // Fetch global preferences from DB to check if payment is enabled
    const settings = await Settings.findOne().lean();
    const paymentEnabled = settings ? settings.paymentEnabled : true;

    // Get IP and User Agent for audit logging
    const ipAddress = request.headers.get("x-forwarded-for") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    // Generate slug for the website
    const slug = await generateUniqueSlug();

    if (!paymentEnabled) {
      // Bypassed/Free link generation
      const { payment } = await createFreePaymentAndPublish({
        slug,
        category: formData.category,
        theme: formData.theme,
        customerName: formData.yourName,
        yourName: formData.yourName,
        partnerName: formData.partnerName,
        relationshipDate: formData.relationshipDate,
        message: formData.message,
        images,
        customFields: formData.customFields || [],
        groomPhoto: (formData as any).groomPhoto,
        bridePhoto: (formData as any).bridePhoto,
        amount: 0,
        ipAddress,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        paymentEnabled: false,
        slug,
        paymentId: payment.paymentId,
      });
    }

    // Fetch dynamic pricing from DB
    const currentPrice = await getCurrentPrice();
    const FIXED_AMOUNT_PAISE = Math.round(currentPrice * 100);

    // Create Razorpay Order
    const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const options = {
      amount: FIXED_AMOUNT_PAISE,
      currency: "INR",
      receipt: receiptId,
    };

    const order = await razorpay.orders.create(options);

    // Save pending payment record in DB
    await createPendingPayment({
      slug,
      category: formData.category,
      theme: formData.theme,
      customerName: formData.yourName,
      yourName: formData.yourName,
      partnerName: formData.partnerName,
      relationshipDate: formData.relationshipDate,
      message: formData.message,
      images,
      customFields: formData.customFields || [],
      groomPhoto: (formData as any).groomPhoto,
      bridePhoto: (formData as any).bridePhoto,
      amount: currentPrice,
      razorpayOrderId: order.id,
      ipAddress,
      userAgent,
    });

    // Return only safe checkout details (Never expose secret key to frontend)
    return NextResponse.json({
      success: true,
      paymentEnabled: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      slug,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to create secure payment order.",
      },
      { status: 500 }
    );
  }
}
