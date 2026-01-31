import { z } from "zod";
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  ADMIN_SECRET_KEY: z.string().min(16),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
});
type Env = z.infer<typeof envSchema>;
let _env: Env | undefined;
export function validateEnv() {
  if (_env) return _env;
  try {
    _env = envSchema.parse(process.env);
    return _env;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err) => `  - ${err.path.join(".")}: ${err.message}`);
      console.error("\nEnvironment Validation Failed:\n" + missingVars.join("\n"));
      throw new Error("Environment validation failed");
    }
    throw error;
  }
}
export const env = typeof window === "undefined" ? validateEnv() : ({} as Env);
