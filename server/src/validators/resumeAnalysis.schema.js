import { z } from "zod";

const feedbackSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    severity: z.enum([
        "low",
        "medium",
        "high",
    ]),
});

const bulletFeedbackSchema = z.object({
    original: z.string().min(1),

    problem: z.string().min(1),

    suggestion: z.string().min(1),

    improvedExample: z
        .string()
        .nullable(),
});

export const aiResumeAnalysisSchema = z.object({
    summary: z
        .string()
        .min(1),

    strengths: z
        .array(z.string())
        .max(8),

    weaknesses: z
        .array(feedbackSchema)
        .max(10),

    missingSkills: z
        .array(z.string())
        .max(15),

    experienceFeedback: z
        .array(feedbackSchema)
        .max(8),

    projectFeedback: z
        .array(feedbackSchema)
        .max(8),

    bulletFeedback: z
        .array(bulletFeedbackSchema)
        .max(10),

    prioritizedSuggestions: z
        .array(z.string())
        .max(10),
});