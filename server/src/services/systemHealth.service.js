import mongoose from "mongoose";
import { env } from "../config/env.js";
import redis from "../config/redis.js";

export const checkSystemHealth = async () => {
    const mongoStatus = mongoose.connection.readyState === 1 ? "operational" : "degraded";

    let redisStatus = "degraded";
    try {
        if (redis && redis.status === "ready") {
            await redis.ping();
            redisStatus = "operational";
        } else {
            redisStatus = "degraded";
        }
    } catch {
        redisStatus = "degraded";
    }

    const stripeStatus = env.STRIPE_SECRET_KEY ? "operational" : "degraded";
    const resendStatus = env.RESEND_API_KEY ? "operational" : "degraded";
    const geminiStatus = env.GEMINI_API_KEY ? "operational" : "degraded";

    return {
        timestamp: new Date().toISOString(),
        overall: [mongoStatus, redisStatus, stripeStatus, resendStatus, geminiStatus].every(s => s === "operational")
            ? "operational"
            : "degraded",
        services: {
            mongoDB: { status: mongoStatus, label: "MongoDB Replica Cluster" },
            redis: { status: redisStatus, label: "Redis Session Cache" },
            stripe: { status: stripeStatus, label: "Stripe Billing Infrastructure" },
            resend: { status: resendStatus, label: "Resend Email Dispatch" },
            gemini: { status: geminiStatus, label: "Google Gemini 2.5 AI Engine" },
        },
    };
};
