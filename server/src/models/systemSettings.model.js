import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema({
    maintenanceMode: {
        type: Boolean,
        default: false,
    },
    platformName: {
        type: String,
        default: "ResumeLab",
    },
    defaultFreePlanCredits: {
        type: Number,
        default: 10,
    },
    registrationOpen: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const SystemSettings = mongoose.model("SystemSettings", systemSettingsSchema);
export default SystemSettings;
