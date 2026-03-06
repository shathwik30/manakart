import { NextRequest } from "next/server";
import { sendEmail } from "@/lib/email";
import { successResponse, errorResponse, isValidEmail } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || name.trim().length < 2) return errorResponse("Name is required", 400);
    if (!email || !isValidEmail(email)) return errorResponse("Valid email is required", 400);
    if (!message || message.trim().length < 10) return errorResponse("Message must be at least 10 characters", 400);

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">New Contact Inquiry</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Name:</td><td style="padding: 8px 0;">${name.trim()}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Email:</td><td style="padding: 8px 0;">${email.trim()}</td></tr>
          ${phone ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Phone:</td><td style="padding: 8px 0;">${phone.trim()}</td></tr>` : ""}
          ${subject ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Subject:</td><td style="padding: 8px 0;">${subject.trim()}</td></tr>` : ""}
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
          <p style="color: #666; font-size: 12px; margin: 0 0 8px;">Message:</p>
          <p style="color: #1a1a1a; margin: 0; white-space: pre-wrap;">${message.trim()}</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: process.env.CONTACT_EMAIL || "support@manakart.com",
      subject: `Contact: ${subject?.trim() || "New Inquiry"} from ${name.trim()}`,
      html,
    });

    return successResponse({ message: "Your inquiry has been submitted successfully" });
  } catch (error) {
    logger.error("Contact form error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
