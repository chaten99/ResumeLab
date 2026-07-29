import mongoose from "mongoose";

const bulletImprovementSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        resumeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resume",
            required: true,
            index: true,
        },
        originalBullet: {
            type: String,
            required: true,
            trim: true,
        },
        targetRole: {
            type: String,
            required: true,
            trim: true,
        },
        jobDescription: {
            type: String,
            default: "",
            trim: true,
        },
        critique: {
            type: String,
            default: "",
        },
        suggestions: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "discarded"],
            default: "pending",
        },
        selectedSuggestion: {
            type: String,
            default: null,
        },
        history: {
            type: [
                {
                    timestamp: { type: Date, default: Date.now },
                    suggestions: [String],
                },
            ],
            default: [],
        },
    },
    { timestamps: true }
);

bulletImprovementSchema.index({ userId: 1, resumeId: 1, createdAt: -1 });

const BulletImprovement = mongoose.model(
    "BulletImprovement",
    bulletImprovementSchema
);

export default BulletImprovement;
