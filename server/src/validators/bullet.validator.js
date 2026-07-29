import { z } from "zod";

export const improveBulletSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Resume ID is required"),
    }),
    body: z.object({
        originalBullet: z
            .string({ required_error: "Original bullet point is required" })
            .trim()
            .min(10, "Original bullet must be at least 10 characters")
            .max(1000, "Original bullet must not exceed 1000 characters"),
        targetRole: z.string().trim().optional(),
        jobDescription: z.string().trim().optional(),
    }),
});

export const updateBulletStatusSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Resume ID is required"),
        bulletId: z.string().min(1, "Bullet ID is required"),
    }),
    body: z.object({
        status: z.enum(["pending", "accepted", "discarded"], {
            required_error: "Status must be accepted, discarded, or pending",
        }),
        selectedSuggestion: z.string().optional(),
    }),
});
