import { NextRequest } from "next/server";
import { db } from "@/db";
import { homepageSections } from "@/db/schema";
import { asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const sections = await db.query.homepageSections.findMany({ orderBy: [asc(homepageSections.position)] });
    return successResponse({ sections });
  } catch (error) {
    logger.error("Admin get homepage sections error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const { title, type, config, position = 0, isActive = true } = body;

    if (!title || title.trim().length < 2) return errorResponse("Valid title is required (min 2 characters)", 400);
    if (!type || type.trim().length === 0) return errorResponse("Section type is required", 400);

    const [section] = await db.insert(homepageSections).values({
      title: title.trim(), type: type.trim(), config: config || null, position, isActive,
    }).returning();

    return successResponse({ section });
  } catch (error) {
    logger.error("Admin create homepage section error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
