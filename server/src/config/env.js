import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().positive().default(5000),
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
    CLIENT_URL: z.string().url().min(1, "CLIENT_URL is required"),
    REDIS_URL: z.string().url().min(1, "REDIS_URL is required"),
    JWT_ACCESS_SECRET: z.string().min(16),
    JWT_REFRESH_SECRET: z.string().min(16),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    MAIL_HOST: z.string().default("localhost"),
    MAIL_PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(1025),
    MAIL_USER: z.string().optional(),
    MAIL_PASSWORD: z.string().optional(),
    MAIL_FROM: z.string().default("Resume Lab <no-reply@resumelab.local>"),
    OTP_SECRET: z
        .string()
        .min(32, "OTP_SECRET must be at least 32 characters"),
    OTP_EXPIRES_IN: z.string().default("10m"),
    GEMINI_API_KEY: z
        .string()
        .min(1, "GEMINI_API_KEY is required"),
    GEMINI_MODEL: z
        .string()
        .default("gemini-2.5-flash"),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
    console.error("Invalid environment variables:", result.error.format());
    process.exit(1);
}
export const env = result.data;