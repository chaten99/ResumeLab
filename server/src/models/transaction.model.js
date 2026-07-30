import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    plan: {
        type: String,
        enum: ["PRO", "PREMIUM"],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: "inr",
    },
    paymentProvider: {
        type: String,
        default: "stripe",
    },
    checkoutSessionId: {
        type: String,
        unique: true,
        sparse: true,
    },
    paymentIntentId: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
    },
    creditsAdded: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
