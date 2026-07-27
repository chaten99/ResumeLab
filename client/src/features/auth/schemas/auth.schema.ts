import { z } from "zod";

export const registerSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Name is required")
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name cannot exceed 50 characters"),

        email: z
            .string()
            .trim()
            .min(1, "Email is required")
            .email("Please enter a valid email address"),

        password: z
            .string()
            .min(1, "Password is required")
            .min(8, "Password must be at least 8 characters")
            .max(72, "Password cannot exceed 72 characters")
            .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
            .regex(/[^a-zA-Z0-9]/, "Password must contain at least 1 special character"),

        confirmPassword: z
            .string()
            .min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),

    password: z
        .string()
        .min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
    otp: z
        .string()
        .min(1, "Verification code is required")
        .regex(/^\d{6}$/, "Enter the 6-digit verification code"),
});

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
    .object({
        otp: z
            .string()
            .min(1, "Reset code is required")
            .regex(/^\d{6}$/, "Enter the 6-digit reset code"),

        newPassword: z
            .string()
            .min(1, "Password is required")
            .min(8, "Password must be at least 8 characters")
            .max(72, "Password cannot exceed 72 characters")
            .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
            .regex(/[^a-zA-Z0-9]/, "Password must contain at least 1 special character"),

        confirmPassword: z
            .string()
            .min(1, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;