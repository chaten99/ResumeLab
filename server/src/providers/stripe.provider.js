import Stripe from "stripe";
import { env } from "../config/env.js";
import logger from "../config/logger.js";

class StripeProvider {
    constructor() {
        this.stripe = env.STRIPE_SECRET_KEY
            ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
            : null;
    }

    isConfigured() {
        return !!this.stripe;
    }

    async createCustomer({ email, name, userId }) {
        if (!this.stripe) {
            return `cus_mock_${userId}`;
        }
        try {
            const customer = await this.stripe.customers.create({
                email,
                name,
                metadata: { userId: userId.toString() },
            });
            return customer.id;
        } catch (err) {
            logger.error({ err }, "Stripe createCustomer error");
            return `cus_mock_${userId}`;
        }
    }

    async createCheckoutSession({ customerId, plan, amount, userId, successUrl, cancelUrl }) {
        if (!this.stripe) {
            const mockSessionId = `cs_test_${Date.now()}`;
            return {
                id: mockSessionId,
                url: `${successUrl}?success=true&session_id=${mockSessionId}`,
            };
        }

        const session = await this.stripe.checkout.sessions.create({
            customer: customerId.startsWith("cus_mock_") ? undefined : customerId,
            customer_email: customerId.startsWith("cus_mock_") ? undefined : undefined,
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: `ResumeLab ${plan} Subscription`,
                            description: plan === "PRO" ? "250 Monthly Credits & Priority AI Engine" : "1000 Monthly Credits & Unlimited Diagnostics",
                        },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${successUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${cancelUrl}?canceled=true`,
            client_reference_id: userId.toString(),
            metadata: {
                userId: userId.toString(),
                plan,
            },
        });

        return { id: session.id, url: session.url };
    }

    constructWebhookEvent(rawBody, signature) {
        if (!this.stripe || !env.STRIPE_WEBHOOK_SECRET) {
            return null;
        }
        return this.stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    }
}

export const stripeProvider = new StripeProvider();
