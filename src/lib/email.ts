import nodemailer from "nodemailer";
import { logger } from "@/lib/logger";
import { formatPrice } from "@/lib/utils";
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
    return true;
  } catch (error) {
    logger.error("Email send error", { error: error instanceof Error ? error.message : "Unknown error" });
    return false;
  }
}
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Georgia', serif; background: #faf9f7; padding: 40px; }
        .container { max-width: 500px; margin: 0 auto; background: #fff; padding: 40px; border: 1px solid #e8e6e3; }
        .logo { font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 30px; letter-spacing: 2px; }
        .otp-code { font-size: 36px; font-weight: bold; color: #1a1a1a; letter-spacing: 8px; padding: 20px; background: #faf9f7; text-align: center; margin: 30px 0; }
        .message { color: #666; line-height: 1.8; font-size: 15px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e8e6e3; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Succession</div>
        <p class="message">Your verification code is:</p>
        <div class="otp-code">${otp}</div>
        <p class="message">This code will expire in 5 minutes. Do not share this code with anyone.</p>
        <div class="footer">
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject: "Your Verification Code", html });
}
export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  total: number,
  items: { title: string; size: string; quantity: number; price: number }[]
): Promise<boolean> {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 15px 0; border-bottom: 1px solid #e8e6e3;">${item.title}</td>
        <td style="padding: 15px 0; border-bottom: 1px solid #e8e6e3;">${item.size}</td>
        <td style="padding: 15px 0; border-bottom: 1px solid #e8e6e3;">${item.quantity}</td>
        <td style="padding: 15px 0; border-bottom: 1px solid #e8e6e3; text-align: right;">${formatPrice(item.price)}</td>
      </tr>
    `
    )
    .join("");
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Georgia', serif; background: #faf9f7; padding: 40px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; border: 1px solid #e8e6e3; }
        .logo { font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 30px; letter-spacing: 2px; }
        .order-number { font-size: 14px; color: #666; margin-bottom: 30px; }
        .message { color: #1a1a1a; line-height: 1.8; font-size: 16px; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 15px 0; border-bottom: 2px solid #1a1a1a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .total { font-size: 20px; font-weight: bold; text-align: right; padding-top: 20px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e8e6e3; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Succession</div>
        <div class="order-number">Order ${orderNumber}</div>
        <p class="message">Thank you for your order. We're preparing your items with care.</p>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Size</th>
              <th>Qty</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="total">Total: ${formatPrice(total)}</div>
        <div class="footer">
          <p>Questions about your order? Contact us at support@yourbrand.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject: `Order Confirmed - ${orderNumber}`, html });
}
