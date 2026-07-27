import { z } from "zod";

export const uploadResumeSchema = z.object({
    body: z.object({
        targetRole: z
            .string()
            .trim()
            .min(2, "Target role must be at least 2 characters long")
            .max(100, "Target role must be at most 100 characters long"),
        jobDescription: z
            .string()
            .trim()
            .max(10000, "Job description cannot exceed 10000 characters")
            .optional()
            .default(""),

    })
})

export const resumeIdSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid resume ID"),
    })
})