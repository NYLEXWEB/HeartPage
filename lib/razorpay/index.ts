import Razorpay from "razorpay";
import crypto from "crypto";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be defined in environment variables");
}

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

/**
 * Verify Razorpay payment signature (HMAC hex)
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  try {
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret!)
      .update(text)
      .digest("hex");

    return generatedSignature === signature;
  } catch (error) {
    console.error("Payment signature verification failed:", error);
    return false;
  }
}

/**
 * Verify Razorpay webhook signature using RAZORPAY_KEY_SECRET
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  try {
    const generatedSignature = crypto
      .createHmac("sha256", keySecret!)
      .update(payload)
      .digest("hex");

    return generatedSignature === signature;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return false;
  }
}
