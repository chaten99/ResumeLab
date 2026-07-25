import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),

    email: z
        .email("Please enter a valid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password cannot exceed 72 characters"),
});

export const loginSchema = z.object({
    email: z
        .email("Please enter a valid email address"),

    password: z
        .string()
        .min(1, "Password is required"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;