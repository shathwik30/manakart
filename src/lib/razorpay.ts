import Razorpay from "razorpay";
import crypto from "crypto";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
export interface CreateOrderOptions {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}
export async function createRazorpayOrder(options: CreateOrderOptions) {
  return razorpay.orders.create({
    amount: options.amount,
    currency: options.currency || "INR",
    receipt: options.receipt,
    notes: options.notes || {},
  });
}
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}
export default razorpay;
