import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const uploadResumeSchema = z.object({
  file: z
    .custom<File>((val) => val instanceof File, {
      message: "Please select a resume file",
    })
    .refine((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"), {
      message: "Only PDF files are allowed",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "Resume PDF cannot exceed 5 MB",
    }),

  targetRole: z
    .string()
    .trim()
    .min(1, "Target role is required")
    .min(2, "Target role must be at least 2 characters")
    .max(100, "Target role cannot exceed 100 characters"),

  jobDescription: z
    .string()
    .trim()
    .max(10000, "Job description cannot exceed 10,000 characters")
    .optional()
    .default(""),
});

export type UploadResumeFormData = z.infer<typeof uploadResumeSchema>;
