import mongoose from "mongoose";

const creditLedgerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ["subscription", "ai_usage", "refund", "bonus", "admin", "manual"],
        default: "ai_usage",
    },
    balanceAfter: {
        type: Number,
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        default: "",
    },
    referenceId: {
        type: String,
        default: null,
    },
}, { timestamps: true });

const CreditLedger = mongoose.model("CreditLedger", creditLedgerSchema);
export default CreditLedger;
