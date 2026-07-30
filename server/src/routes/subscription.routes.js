import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import {
    getSubscriptionStatus,
    startCheckoutSession,
    handleStripeWebhook,
    getBillingHistory,
} from "../controllers/subscription.controller.js";

const router = express.Router();

// Webhook endpoint (Raw body parser before json body parser)
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

// Protected routes
router.get("/status", authenticate, getSubscriptionStatus);
router.post("/checkout", authenticate, startCheckoutSession);
router.get("/billing-history", authenticate, getBillingHistory);

export default router;
