import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().positive().default(5000),
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
    CLIENT_URL: z.string().url().min(1, "CLIENT_URL is required"),
    JWT_SECRET: z.string().min(20, "JWT_SECRET must be at least 20 characters long"),
})

const result = envSchema.safeParse(process.env);
if(!result.success) {
    console.error("Invalid environment variables:");
    console.error(z.prettifyError(result.error.format()));
    process.exit(1);
}
export const env = result.data;