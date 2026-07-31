import User from "../models/user.model.js";
import { createCheckoutSession, getUserBillingHistory, fulfillSubscriptionPayment, PLANS } from "../services/payment.service.js";
import { stripeProvider } from "../providers/stripe.provider.js";
import logger from "../config/logger.js";
import AppError from "../utils/AppError.js";

export const getSubscriptionStatus = async (req, res) => {
    const user = await User.findById(req.user._id).select("plan credits subscriptionStatus subscriptionStart subscriptionEnd");
    return res.status(200).json({
        success: true,
        subscription: {
            plan: user.plan,
            credits: user.credits,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionStart: user.subscriptionStart,
            subscriptionEnd: user.subscriptionEnd,
        },
        plans: Object.values(PLANS),
    });
};

export const startCheckoutSession = async (req, res) => {
    const { planId } = req.body;
    logger.info({ userId: req.user._id, planId }, "[STRIPE AUDIT] 1. Initiating Checkout Session Request");

    const { checkoutUrl, sessionId } = await createCheckoutSession(req.user, planId);

    logger.info({ sessionId, checkoutUrl }, "[STRIPE AUDIT] 2. Checkout Session Created Successfully");

    return res.status(200).json({
        success: true,
        checkoutUrl,
        sessionId,
    });
};

export const handleStripeWebhook = async (req, res) => {
    const signature = req.headers["stripe-signature"];
    let event = null;

    logger.info({ hasSignature: !!signature }, "[STRIPE AUDIT] 3. Incoming Stripe Webhook Received");

    try {
        if (signature) {
            event = stripeProvider.constructWebhookEvent(req.body, signature);
            logger.info({ eventType: event?.type }, "[STRIPE AUDIT] 4. Webhook Signature Verified Successfully");
        } else {
            event = req.body;
            logger.warn({ eventType: event?.type }, "[STRIPE AUDIT] Webhook payload processed without signature header");
        }
    } catch (err) {
        logger.error({ err: err.message }, "[STRIPE AUDIT ERROR] Webhook signature verification failed");
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event && event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        const plan = session.metadata?.plan || "PRO";

        logger.info({ sessionId: session.id, userId, plan }, "[STRIPE AUDIT] 5. Processing checkout.session.completed event");

        if (userId) {
            await fulfillSubscriptionPayment({
                userId,
                plan,
                sessionId: session.id,
                paymentIntentId: session.payment_intent || null,
                amount: (session.amount_total || 0) / 100,
            });
            logger.info({ userId, plan }, "[STRIPE AUDIT] 6. User Subscription & Credits Updated Successfully");
        }
    }

    return res.status(200).json({ received: true });
};

export const getBillingHistory = async (req, res) => {
    const transactions = await getUserBillingHistory(req.user._id);
    return res.status(200).json({
        success: true,
        transactions,
    });
};
