import mongoose from "mongoose";
const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    originalName: {
        type: String,
        required: true,
        trim: true,
    },
    targetRole: {
        type: String,
        required: true,
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
    status: {
        type: String,
        enum: [
            "parsed",
            "analyzing",
            "completed",
            "failed"
        ],
        default: "parsed",
    },
    pageCount: {
        type: Number,
        min: 1,
    },
}, { timestamps: true });

resumeSchema.index({ userId: 1, createdAt: -1 });
const Resume = mongoose.model("Resume", resumeSchema);
export default Resume;