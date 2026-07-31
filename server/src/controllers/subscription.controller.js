import User from "../models/user.model.js";
import { createCheckoutSession, getUserBillingHistory, fulfillSubscriptionPayment, PLANS } from "../services/payment.service.js";
import { stripeProvider } from "../providers/stripe.provider.js";
import logger from "../config/logger.js";

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
    logger.info({ userId: req.user._id, planId }, "[STRIPE CHECKOUT STEP 1] Initiating Checkout Session Request");

    const { checkoutUrl, sessionId } = await createCheckoutSession(req.user, planId);

    logger.info({ sessionId, checkoutUrl }, "[STRIPE CHECKOUT STEP 2] Real Stripe Checkout Session Created Successfully");

    return res.status(200).json({
        success: true,
        checkoutUrl,
        sessionId,
    });
};

export const handleStripeWebhook = async (req, res) => {
    const signature = req.headers["stripe-signature"];
    let event = null;

    logger.info({ hasSignature: !!signature, path: req.originalUrl }, "[WEBHOOK STEP 1] Webhook HTTP request received at endpoint");

    try {
        if (signature) {
            event = stripeProvider.constructWebhookEvent(req.body, signature);
            logger.info({ eventType: event?.type }, "[WEBHOOK STEP 2] Stripe Signature Verified Successfully");
        } else {
            const rawString = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body);
            event = typeof req.body === "object" && !Buffer.isBuffer(req.body) ? req.body : JSON.parse(rawString);
            logger.warn({ eventType: event?.type }, "[WEBHOOK STEP 2] Webhook processed without signature header (Dev/Test mode)");
        }
    } catch (err) {
        logger.error({ err: err.message }, "[WEBHOOK STEP 2 ERROR] Webhook signature verification or JSON parse failed");
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    logger.info({ eventType: event?.type, eventId: event?.id }, "[WEBHOOK STEP 3] Extracted Webhook Event Type");

    if (event && (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded")) {
        const session = event.data.object;
        const sessionId = session.id || `sess_${Date.now()}`;
        const customerId = session.customer;
        const customerEmail = session.customer_details?.email || session.customer_email;
        const plan = session.metadata?.plan || "PRO";
        const amount = (session.amount_total || session.amount || 0) / 100;
        const metadataUserId = session.client_reference_id || session.metadata?.userId;

        logger.info({
            sessionId,
            customerId,
            customerEmail,
            plan,
            amount,
            metadataUserId,
        }, "[WEBHOOK STEP 4] Extracted Checkout Session Data");

        let targetUser = null;

        if (metadataUserId) {
            targetUser = await User.findById(metadataUserId);
            if (targetUser) {
                logger.info({ userId: targetUser._id }, "[WEBHOOK STEP 5] User identified via Tier 1 (metadata.userId / client_reference_id)");
            }
        }

        if (!targetUser && customerId) {
            targetUser = await User.findOne({ stripeCustomerId: customerId });
            if (targetUser) {
                logger.info({ userId: targetUser._id, customerId }, "[WEBHOOK STEP 5] User identified via Tier 2 (stripeCustomerId)");
            }
        }

        if (!targetUser && customerEmail) {
            targetUser = await User.findOne({ email: customerEmail.toLowerCase() });
            if (targetUser) {
                logger.info({ userId: targetUser._id, email: customerEmail }, "[WEBHOOK STEP 5] User identified via Tier 3 (customerEmail)");
            }
        }

        if (!targetUser) {
            logger.error({ metadataUserId, customerId, customerEmail }, "[WEBHOOK STEP 5 ERROR] Could not find any matching ResumeLab user account for webhook!");
            return res.status(404).json({ error: "User account not found for webhook session" });
        }

        logger.info({
            userId: targetUser._id,
            planBefore: targetUser.plan,
            creditsBefore: targetUser.credits,
            statusBefore: targetUser.subscriptionStatus,
        }, "[WEBHOOK STEP 6] Pre-Update User State Captured");

        const { user: updatedUser, transaction } = await fulfillSubscriptionPayment({
            userId: targetUser._id,
            plan,
            sessionId,
            paymentIntentId: session.payment_intent || null,
            amount: amount > 0 ? amount : undefined,
        });

        logger.info({
            userId: updatedUser._id,
            planAfter: updatedUser.plan,
            creditsAfter: updatedUser.credits,
            statusAfter: updatedUser.subscriptionStatus,
            transactionId: transaction._id,
        }, "[WEBHOOK STEP 7 & 8] Post-Update User State Captured & MongoDB Documents Saved");

        return res.status(200).json({
            received: true,
            fulfilled: true,
            userId: updatedUser._id,
            plan: updatedUser.plan,
            credits: updatedUser.credits,
        });
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
