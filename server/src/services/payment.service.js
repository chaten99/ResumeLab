import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import CreditLedger from "../models/creditLedger.model.js";
import AppError from "../utils/AppError.js";
import { stripeProvider } from "../providers/stripe.provider.js";
import { env } from "../config/env.js";
import logger from "../config/logger.js";
import { emitToUser, emitToAdmin } from "../config/socket.js";

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
        priceId: env.STRIPE_PRICE_PRO || null,
        currency: "INR",
        credits: 250,
        features: ["250 Monthly Credits", "Priority AI Analysis", "ATS Keyword Matcher", "Bullet Improvement Engine"],
    },
    PREMIUM: {
        id: "PREMIUM",
        name: "PREMIUM",
        price: 499,
        priceId: env.STRIPE_PRICE_PREMIUM || null,
        currency: "INR",
        credits: 1000,
        features: ["1000 Monthly Credits", "Everything in Pro", "Unlimited Project Diagnostics", "Priority Support"],
    },
};

export const createCheckoutSession = async (user, planId) => {
    const plan = PLANS[planId];
    if (!plan || planId === "FREE") {
        throw new AppError("Invalid subscription plan selected.", 400);
    }

    // Safely retrieve or create real Stripe Customer ID
    const customerId = await stripeProvider.getOrCreateCustomer(user);

    const clientUrl = env.CLIENT_URL || "http://localhost:5173";
    const session = await stripeProvider.createCheckoutSession({
        customerId,
        plan: planId,
        amount: plan.price,
        priceId: plan.priceId,
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
        throw new AppError("User not found for payment fulfillment.", 404);
    }

    // Webhook & Session Fulfillment Idempotency Check
    let transaction = await Transaction.findOne({ checkoutSessionId: sessionId });
    if (transaction && transaction.status === "completed") {
        logger.info({ sessionId, userId }, "[FULFILLMENT] Webhook session already fulfilled previously (Idempotent execution)");
        return { user, transaction };
    }

    // 1. Update MongoDB User Subscription & Credits
    const oldPlan = user.plan;
    const oldCredits = user.credits;

    user.plan = plan.id;
    user.subscriptionStatus = "active";
    user.subscriptionStart = new Date();
    user.subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    user.credits += plan.credits;
    await user.save();

    logger.info({
        userId: user._id,
        oldPlan,
        newPlan: user.plan,
        oldCredits,
        newCredits: user.credits,
        status: user.subscriptionStatus,
    }, "[FULFILLMENT STEP 1] MongoDB User Document Updated & Saved");

    // 2. Record Transaction Document
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

    logger.info({ transactionId: transaction._id }, "[FULFILLMENT STEP 2] Transaction Record Saved in MongoDB");

    // 3. Record Credit Ledger Document
    const ledgerEntry = await CreditLedger.create({
        userId: user._id,
        amount: plan.credits,
        type: "subscription",
        balanceAfter: user.credits,
        action: "Subscription Purchased",
        reason: `${plan.name} Plan Purchased via Stripe (Session ${sessionId.slice(0, 12)}...)`,
        referenceId: transaction._id.toString(),
    });

    logger.info({ ledgerId: ledgerEntry._id, balanceAfter: ledgerEntry.balanceAfter }, "[FULFILLMENT STEP 3] Credit Ledger Audit Entry Saved in MongoDB");

    // 4. Emit Real-time Socket Events to Private User Room user:{userId}
    emitToUser(userId, "subscription:updated", {
        plan: plan.id,
        credits: user.credits,
        subscriptionStatus: "active",
        subscriptionEnd: user.subscriptionEnd,
    });

    emitToUser(userId, "credits:updated", {
        credits: user.credits,
        change: plan.credits,
        reason: ledgerEntry.reason,
        remainingBalance: user.credits,
    });

    emitToUser(userId, "user:updated", {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        credits: user.credits,
        subscriptionStatus: "active",
    });

    emitToUser(userId, "notification:created", {
        title: "Subscription Upgraded",
        message: `Successfully subscribed to ${plan.name} plan! ${plan.credits} credits added.`,
        type: "success",
    });

    emitToAdmin("admin:telemetry", {
        type: "new_subscription",
        userId,
        amount: transaction.amount,
        plan: plan.id,
    });

    logger.info({ userId: user._id, plan: plan.id, credits: user.credits }, "[FULFILLMENT STEP 4] Real-time Socket Events Emitted to user room");

    return { user, transaction };
};

export const getUserBillingHistory = async (userId) => {
    return await Transaction.find({ userId }).sort({ createdAt: -1 }).lean();
};
