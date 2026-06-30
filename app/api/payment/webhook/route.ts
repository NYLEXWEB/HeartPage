import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import {
  processSuccessfulPayment,
  processFailedPayment,
  processOrderPaid,
} from "@/lib/payment/service";

export async function POST(request: NextRequest) {
  try {
    // 1. Get raw request body (essential for HMAC signature verification)
    const rawBody = await request.text();

    // 2. Get the signature header
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      console.warn("Webhook warning: Missing x-razorpay-signature header");
      return NextResponse.json(
        { success: false, error: "Missing signature" },
        { status: 400 }
      );
    }

    // 3. Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.error("Webhook verification failed: Invalid signature");
      return NextResponse.json(
        { success: false, error: "Invalid signature verification" },
        { status: 401 }
      );
    }

    // 4. Parse payload
    const payload = JSON.parse(rawBody);
    const event = payload.event;

    console.log(`Webhook received: Event type: ${event}`);

    // 5. Process events idempotently
    switch (event) {
      case "payment.captured": {
        const paymentEntity = payload.payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;
        const razorpayPaymentId = paymentEntity.id;

        console.log(`Processing payment.captured for Order ${razorpayOrderId}`);

        await processSuccessfulPayment({
          razorpayOrderId,
          razorpayPaymentId,
          signature: "webhook_verified",
          verifiedBy: "webhook",
          ipAddress: request.headers.get("x-forwarded-for") || undefined,
          userAgent: request.headers.get("user-agent") || undefined,
        });
        break;
      }

      case "order.paid": {
        const orderEntity = payload.payload.order.entity;
        const razorpayOrderId = orderEntity.id;
        
        console.log(`Processing order.paid for Order ${razorpayOrderId}`);
        await processOrderPaid({
          razorpayOrderId,
        });
        break;
      }

      case "payment.failed": {
        const paymentEntity = payload.payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;
        const razorpayPaymentId = paymentEntity.id;
        const reason = paymentEntity.error_description || "Payment failed at checkout";

        console.log(`Processing payment.failed for Order ${razorpayOrderId}`);
        await processFailedPayment({
          razorpayOrderId,
          razorpayPaymentId,
          reason,
        });
        break;
      }

      default:
        console.log(`Ignoring unsupported webhook event: ${event}`);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    // Return 200/500 depending on nature of error.
    // Razorpay recommends returning 200 for known events even if processing fails, to prevent retries,
    // unless it is a server error where we want a retry. Let's return a 500 for server errors.
    return NextResponse.json(
      { success: false, error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
