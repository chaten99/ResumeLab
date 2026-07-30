import mongoose from "mongoose";
import User from "../models/user.model.js";
import { env } from "../config/env.js";

const createAdmin = async () => {
    try {
        console.log("Connecting to MongoDB for admin seeding...");
        await mongoose.connect(env.MONGODB_URI);

        const adminEmail = "resume-lab@admin.in";
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`Admin already exists. (${adminEmail})`);
            process.exit(0);
        }

        const admin = new User({
            name: "Super Admin",
            email: adminEmail,
            password: "Admin@123",
            role: "admin",
            isEmailVerified: true,
            plan: "PREMIUM",
            credits: 999999,
        });

        await admin.save();
        console.log("Super Admin seeded successfully!");
        console.log(`Email: ${adminEmail}`);
        console.log("Password: Admin@123");
        process.exit(0);
    } catch (err) {
        console.error("Failed to seed admin:", err);
        process.exit(1);
    }
};

createAdmin();
