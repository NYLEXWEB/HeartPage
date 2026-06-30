import { NextRequest, NextResponse } from "next/server";
import { processSuccessfulPayment } from "@/lib/payment/service";
import { z } from "zod";

// Zod schema for verification payload
const verifyPayloadSchema = z.object({
  razorpay_payment_id: z.string().min(1, "razorpay_payment_id is required"),
  razorpay_order_id: z.string().min(1, "razorpay_order_id is required"),
  razorpay_signature: z.string().min(1, "razorpay_signature is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = verifyPayloadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment response details",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = result.data;

    // Get client IP and User Agent for audit logging
    const ipAddress = request.headers.get("x-forwarded-for") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    // Verify signature, mark as Paid, and publish the HeartPage in database (idempotent)
    const { payment, website } = await processSuccessfulPayment({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      signature: razorpay_signature,
      verifiedBy: "client",
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      slug: website.slug,
      paymentId: payment.paymentId,
      status: payment.status,
      message: "Payment verified successfully. Website published.",
    });
  } catch (error: any) {
    console.error("Verification endpoint error:", error);

    // If it's a verification failure, return Unauthorized/Bad Request
    if (error.message === "Invalid payment signature") {
      return NextResponse.json(
        {
          success: false,
          error: "Payment verification failed. Signature is invalid.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process payment verification.",
      },
      { status: 500 }
    );
  }
}
