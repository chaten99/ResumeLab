import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ["email_verification", "password_reset"],
        required: true,
    },
    codeHash: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: {
            expireAfterSeconds: 0,
        },
    },
    attempts: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });


verificationSchema.index({
    userId: 1,
    type: 1,
}, {unique: true});

const Verification = mongoose.model("Verification", verificationSchema);
export default Verification;