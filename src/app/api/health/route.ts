import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  const healthCheck = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    checks: { database: "unknown" },
  };
  try {
    await db.execute(sql`SELECT 1`);
    healthCheck.checks.database = "ok";
  } catch (error) {
    healthCheck.status = "error";
    healthCheck.checks.database = "error";
    console.error("Health check failed:", error);
    return NextResponse.json(healthCheck, { status: 503 });
  }
  return NextResponse.json(healthCheck, { status: 200 });
}

export async function HEAD() {
  try {
    await db.execute(sql`SELECT 1`);
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
