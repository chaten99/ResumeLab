import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import {
    getSubscriptionStatus,
    startCheckoutSession,
    handleStripeWebhook,
    verifySessionHandler,
    getBillingHistory,
} from "../controllers/subscription.controller.js";

const router = express.Router();

router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

router.get("/status", authenticate, getSubscriptionStatus);
router.post("/checkout", authenticate, startCheckoutSession);
router.post("/verify-session", authenticate, verifySessionHandler);
router.get("/billing-history", authenticate, getBillingHistory);

export default router;
