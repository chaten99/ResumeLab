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
    const { checkoutUrl, sessionId } = await createCheckoutSession(req.user, planId);
    return res.status(200).json({
        success: true,
        checkoutUrl,
        sessionId,
    });
};

export const handleStripeWebhook = async (req, res) => {
    const signature = req.headers["stripe-signature"];
    let event = null;

    try {
        if (signature) {
            event = stripeProvider.constructWebhookEvent(req.body, signature);
        } else {
            event = req.body;
        }
    } catch (err) {
        logger.error({ err }, "Webhook signature verification failed");
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event && (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded")) {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        const plan = session.metadata?.plan || "PRO";

        if (userId) {
            await fulfillSubscriptionPayment({
                userId,
                plan,
                sessionId: session.id || `sess_${Date.now()}`,
                paymentIntentId: session.payment_intent || null,
                amount: (session.amount_total || 0) / 100,
            });
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
