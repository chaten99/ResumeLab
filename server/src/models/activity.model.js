import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                "resume_uploaded",
                "resume_deleted",
                "resume_analyzed",
                "bullet_improved",
                "ats_matched",
                "subscription_purchased",
                "credits_added",
                "credits_deducted",
                "credits_refunded",
                "password_changed",
                "profile_updated",
                "admin_action",
            ],
        },
        description: {
            type: String,
            required: true,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
