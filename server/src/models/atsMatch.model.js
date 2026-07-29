import mongoose from "mongoose";

const skillItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        matched: {
            type: Boolean,
            required: true,
        },
        importanceReason: {
            type: String,
            default: null,
        },
    },
    { _id: false }
);

const categorizedSkillsSchema = new mongoose.Schema(
    {
        technicalSkills: { type: [skillItemSchema], default: [] },
        softSkills: { type: [skillItemSchema], default: [] },
        tools: { type: [skillItemSchema], default: [] },
        frameworks: { type: [skillItemSchema], default: [] },
        databases: { type: [skillItemSchema], default: [] },
        cloud: { type: [skillItemSchema], default: [] },
        programmingLanguages: { type: [skillItemSchema], default: [] },
    },
    { _id: false }
);

const atsMatchSchema = new mongoose.Schema(
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
        coveragePercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        summary: {
            type: String,
            default: "",
        },
        categorizedSkills: {
            type: categorizedSkillsSchema,
            default: () => ({}),
        },
    },
    { timestamps: true }
);

atsMatchSchema.index({ userId: 1, resumeId: 1 }, { unique: true });

const AtsMatch = mongoose.model("AtsMatch", atsMatchSchema);

export default AtsMatch;
