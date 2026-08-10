import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recordType: {
      type: String,
      enum: ["RESUME", "BUILDER_DRAFT"],
      default: "RESUME",
      index: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    targetRole: {
      type: String,
      default: "Full Stack Engineer",
      trim: true,
      maxlength: 100,
    },
    jobDescription: {
      type: String,
      trim: true,
      maxlength: 10000,
      default: "",
    },
    extractedText: {
      type: String,
      default: "",
    },
    structuredResume: {
      type: Object,
      default: null,
    },
    status: {
      type: String,
      enum: ["parsed", "analyzing", "completed", "failed"],
      default: "parsed",
    },
    pageCount: {
      type: Number,
      min: 1,
    },
    currentStep: {
      type: Number,
      default: 1,
    },
    step1Status: {
      type: String,
      enum: ["DRAFT", "PROCESSING", "READY", "CONFIRMED", "FAILED"],
      default: "DRAFT",
    },
    step1ConfirmedAt: {
      type: Date,
      default: null,
    },
    selectedTemplate: {
      type: String,
      enum: ["minimal", "modern", "professional", "ats", "creative", "executive"],
      default: "modern",
    },
    selectedColor: {
      type: String,
      enum: ["indigo", "emerald", "crimson", "amber", "slate", "violet"],
      default: "indigo",
    },
    version: {
      type: Number,
      default: 1,
    },
    generatedFiles: {
      pdf: {
        status: {
          type: String,
          enum: ["PENDING", "GENERATING", "COMPLETED", "FAILED", "STALE"],
          default: "PENDING",
        },
        key: { type: String, default: null },
        url: { type: String, default: null },
        failureReason: { type: String, default: null },
        generatedAt: { type: Date, default: null },
        version: { type: Number, default: 1 },
      },
      docx: {
        status: {
          type: String,
          enum: ["PENDING", "GENERATING", "COMPLETED", "FAILED", "STALE"],
          default: "PENDING",
        },
        key: { type: String, default: null },
        url: { type: String, default: null },
        failureReason: { type: String, default: null },
        generatedAt: { type: Date, default: null },
        version: { type: Number, default: 1 },
      },
    },
    extractionPromptVersion: {
      type: String,
      default: "v1.1",
    },
    uploadStatus: {
      type: String,
      enum: ["QUEUED", "UPLOADING", "COMPLETED", "FAILED"],
      default: "QUEUED",
    },
    processingStatus: {
      type: String,
      enum: ["QUEUED", "UPLOADING", "COMPLETED", "FAILED"],
      default: "QUEUED",
    },
    jobId: {
      type: String,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
    media: {
      type: { type: String, enum: ["video", "audio"], default: "video" },
      originalName: { type: String, default: "" },
      mimeType: { type: String, default: "" },
      size: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
      bucket: { type: String, default: "" },
      objectKey: { type: String, default: "" },
      url: { type: String, default: "" },
      etag: { type: String, default: "" },
      status: { type: String, default: "QUEUED" },
      uploadedAt: { type: Date, default: null },
    },
    transcript: {
      status: {
        type: String,
        enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
        default: "PENDING",
      },
      text: { type: String, default: "" },
      language: { type: String, default: "en" },
      duration: { type: Number, default: 0 },
      provider: { type: String, default: "gemini" },
      jobId: { type: String, default: null },
      failureReason: { type: String, default: null },
      completedAt: { type: Date, default: null },
    },
    summary: { type: String, default: "" },
    projects: { type: Array, default: [] },
    skills: { type: Array, default: [] },
    education: { type: Array, default: [] },
    experience: { type: Array, default: [] },
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1, recordType: 1, createdAt: -1 });
const Resume = mongoose.model("Resume", resumeSchema);
export default Resume;