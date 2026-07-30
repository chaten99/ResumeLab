import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import CreditLedger from "../models/creditLedger.model.js";
import AppError from "../utils/AppError.js";
import { stripeProvider } from "../providers/stripe.provider.js";
import { env } from "../config/env.js";
import logger from "../config/logger.js";

export const PLANS = {
    FREE: {
        id: "FREE",
        name: "FREE",
        price: 0,
        currency: "INR",
        credits: 10,
        features: ["10 Credits included", "Resume Upload & Parsing", "Basic Dashboard"],
    },
    PRO: {
        id: "PRO",
        name: "PRO",
        price: 199,
        currency: "INR",
        credits: 250,
        features: ["250 Monthly Credits", "Priority AI Analysis", "ATS Keyword Matcher", "Bullet Improvement Engine"],
    },
    PREMIUM: {
        id: "PREMIUM",
        name: "PREMIUM",
        price: 499,
        currency: "INR",
        credits: 1000,
        features: ["1000 Monthly Credits", "Everything in Pro", "Unlimited Project Diagnostics", "Priority Support"],
    },
};

export const createCheckoutSession = async (user, planId) => {
    const plan = PLANS[planId];
    if (!plan || planId === "FREE") {
        throw new AppError("Invalid subscription plan", 400);
    }

    if (!user.stripeCustomerId) {
        const customerId = await stripeProvider.createCustomer({
            email: user.email,
            name: user.name,
            userId: user._id,
        });
        user.stripeCustomerId = customerId;
        await user.save();
    }

    const clientUrl = env.CLIENT_URL || "http://localhost:5173";
    const session = await stripeProvider.createCheckoutSession({
        customerId: user.stripeCustomerId,
        plan: planId,
        amount: plan.price,
        userId: user._id,
        successUrl: `${clientUrl}/subscription`,
        cancelUrl: `${clientUrl}/subscription`,
    });

    await Transaction.create({
        userId: user._id,
        plan: planId,
        amount: plan.price,
        currency: "inr",
        paymentProvider: "stripe",
        checkoutSessionId: session.id,
        status: "pending",
        creditsAdded: plan.credits,
    });

    return { checkoutUrl: session.url, sessionId: session.id };
};

export const fulfillSubscriptionPayment = async ({ userId, plan: planId, sessionId, paymentIntentId, amount }) => {
    const plan = PLANS[planId] || PLANS.PRO;
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError("User not found for payment fulfillment", 404);
    }

    // Webhook Idempotency Check
    let transaction = await Transaction.findOne({ checkoutSessionId: sessionId });
    if (transaction && transaction.status === "completed") {
        logger.info({ sessionId, userId }, "Duplicate webhook or session verification skipped");
        return { user, transaction };
    }

    user.plan = plan.id;
    user.subscriptionStatus = "active";
    user.subscriptionStart = new Date();
    user.subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    user.credits += plan.credits;
    await user.save();

    if (!transaction) {
        transaction = await Transaction.create({
            userId: user._id,
            plan: plan.id,
            amount: amount || plan.price,
            currency: "inr",
            paymentProvider: "stripe",
            checkoutSessionId: sessionId,
            paymentIntentId,
            status: "completed",
            creditsAdded: plan.credits,
        });
    } else {
        transaction.status = "completed";
        transaction.paymentIntentId = paymentIntentId || transaction.paymentIntentId;
        await transaction.save();
    }

    await CreditLedger.create({
        userId: user._id,
        amount: plan.credits,
        type: "subscription",
        balanceAfter: user.credits,
        action: "Subscription Purchased",
        reason: `${plan.name} Plan Purchased (Stripe Session ${sessionId.slice(0, 12)}...)`,
        referenceId: transaction._id.toString(),
    });

    logger.info({ userId: user._id, plan: plan.id, credits: user.credits }, "Subscription payment fulfilled successfully");

    return { user, transaction };
};

export const getUserBillingHistory = async (userId) => {
    return await Transaction.find({ userId }).sort({ createdAt: -1 }).lean();
};
