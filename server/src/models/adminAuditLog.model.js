import mongoose from "mongoose";

const adminAuditLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    action: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    targetEmail: {
        type: String,
        default: null,
    },
    oldValue: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    newValue: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    ip: {
        type: String,
        default: "",
    },
}, { timestamps: true });

const AdminAuditLog = mongoose.model("AdminAuditLog", adminAuditLogSchema);
export default AdminAuditLog;
