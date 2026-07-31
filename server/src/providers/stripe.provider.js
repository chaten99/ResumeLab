import Stripe from "stripe";
import { env } from "../config/env.js";
import logger from "../config/logger.js";
import AppError from "../utils/AppError.js";

class StripeProvider {
    constructor() {
        this.stripe = env.STRIPE_SECRET_KEY
            ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
            : null;
    }

    getStripeInstance() {
        if (!this.stripe) {
            throw new AppError(
                "Stripe is not configured. Please add a valid STRIPE_SECRET_KEY to your server .env file.",
                500
            );
        }
        return this.stripe;
    }

    async createCustomer({ email, name, userId }) {
        const stripe = this.getStripeInstance();
        try {
            const customer = await stripe.customers.create({
                email,
                name,
                metadata: { userId: userId.toString() },
            });
            return customer.id;
        } catch (err) {
            logger.error({ err }, "Stripe createCustomer error");
            throw new AppError(`Failed to create Stripe customer: ${err.message}`, 500);
        }
    }

    async createCheckoutSession({ customerId, plan, amount, priceId, userId, successUrl, cancelUrl }) {
        const stripe = this.getStripeInstance();

        logger.info({ userId, plan, amount, priceId }, "Creating Stripe Checkout Session");

        const lineItem = priceId
            ? { price: priceId, quantity: 1 }
            : {
                  price_data: {
                      currency: "inr",
                      product_data: {
                          name: `ResumeLab ${plan} Subscription`,
                          description:
                              plan === "PRO"
                                  ? "250 Monthly Credits & Priority AI Engine"
                                  : "1000 Monthly Credits & Unlimited Diagnostics",
                      },
                      unit_amount: amount * 100,
                  },
                  quantity: 1,
              };

        const session = await stripe.checkout.sessions.create({
            customer: customerId || undefined,
            payment_method_types: ["card"],
            line_items: [lineItem],
            mode: priceId ? "subscription" : "payment",
            success_url: `${successUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${cancelUrl}?canceled=true`,
            client_reference_id: userId.toString(),
            metadata: {
                userId: userId.toString(),
                plan,
            },
        });

        logger.info({ sessionId: session.id, url: session.url }, "Stripe Checkout Session Created Successfully");

        return { id: session.id, url: session.url };
    }

    constructWebhookEvent(rawBody, signature) {
        const stripe = this.getStripeInstance();
        if (!env.STRIPE_WEBHOOK_SECRET) {
            throw new AppError("STRIPE_WEBHOOK_SECRET is missing in environment variables.", 500);
        }
        return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    }
}

export const stripeProvider = new StripeProvider();
