import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        name: z
            .string()
            .trim()
            .min(2, "Name must be at least 2 characters long")
            .max(50, "Name cannot exceed 50 characters"),

        email: z
            .string()
            .trim()
            .email("Invalid email address")
            .toLowerCase(),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .max(72, "Password cannot exceed 72 characters")
            .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
            .regex(/[^a-zA-Z0-9]/, "Password must contain at least 1 special character"),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z
            .string()
            .trim()
            .email("Invalid email address")
            .toLowerCase(),
        password: z
            .string()
            .min(1, "Password is required"),
    }),
});

export const verifyEmailSchema = z.object({
    body: z.object({
        email: z
            .string()
            .trim()
            .email("Invalid email address")
            .toLowerCase(),

        otp: z
            .string()
            .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
    }),
});

export const resendVerificationSchema = z.object({
    body: z.object({
        email: z
            .string()
            .trim()
            .email("Invalid email address")
            .toLowerCase(),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z
            .string()
            .trim()
            .email("Invalid email address")
            .toLowerCase(),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        email: z
            .string()
            .trim()
            .email("Invalid email address")
            .toLowerCase(),

        otp: z
            .string()
            .regex(
                /^\d{6}$/,
                "OTP must be exactly 6 digits"
            ),

        newPassword: z
            .string()
            .min(
                8,
                "Password must be at least 8 characters long"
            )
            .max(
                72,
                "Password cannot exceed 72 characters"
            )
            .regex(
                /[A-Z]/,
                "Password must contain at least 1 uppercase letter"
            )
            .regex(
                /[^a-zA-Z0-9]/,
                "Password must contain at least 1 special character"
            ),
    }),
});