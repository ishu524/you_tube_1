import Stripe from "stripe";
import User from "../Models/Auth.js";
import dotenv from "dotenv";
import { sendInvoiceEmail } from "../utils/emailService.js";
import mongoose from "mongoose";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
    free: { price: 0, limit: 5, name: "Free" },
    bronze: { price: 50, limit: 7, name: "Bronze" }, // Forced min for Stripe ($0.50)
    silver: { price: 100, limit: 10, name: "Silver" },
    gold: { price: 150, limit: 9999, name: "Gold" },
};

export const createCheckoutSession = async (req, res) => {
    try {
        const { userId, planType } = req.body;
        console.log("Creating session for:", { userId, planType });

        if (!userId || !planType || !PLANS[planType]) {
            return res.status(400).json({ success: false, message: "Invalid user or plan type" });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid User ID format" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const plan = PLANS[planType];

        // Robust Frontend URL construction
        const baseUrl = process.env.FRONTEND_URL || req.headers.origin || "http://localhost:3000";
        if (!process.env.FRONTEND_URL) {
            console.warn(`[PAYMENT]: FRONTEND_URL is not set. Using request origin: ${baseUrl}`);
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: `${plan.name} Subscription Upgrade`,
                        description: `Upgrade your account to ${plan.name} for ${plan.limit === 9999 ? 'Unlimited' : plan.limit + ' min'} watch time.`,
                    },
                    unit_amount: Math.round(plan.price * 100), // INR in paise
                },
                quantity: 1,
            }],
            mode: "payment",
            success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&userId=${userId}`,
            cancel_url: `${baseUrl}/payment-failed`,
            metadata: {
                userId: String(userId),
                planType: String(planType),
                limit: String(plan.limit)
            },
        });

        res.status(200).json({ success: true, url: session.url, sessionId: session.id });
    } catch (error) {
        console.error("Stripe Session Error Details:", error);
        res.status(500).json({
            success: false,
            message: "Stripe Payment Error",
            error: error.message
        });
    }
};

// STRIPE WEBHOOK: Auto-upgrade on success
export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        // Construct event using RAW body for security
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log("Webhook Verified Event:", event.type);
    } catch (err) {
        console.error("Webhook Signature Verification Failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { userId, planType, limit } = session.metadata;
        const billingEmail = session.customer_details.email; // Exact email user filled in Stripe

        try {
            const upgradedUser = await User.findByIdAndUpdate(userId, {
                plan: planType,
                watchLimit: parseInt(limit),
                isPremium: true,
                paymentId: session.payment_intent,
                billingEmail: billingEmail, // Store the email used during checkout
                subscriptionStatus: "active",
                planStartDate: new Date()
            }, { new: true });

            if (upgradedUser) {
                const targetEmail = billingEmail || upgradedUser.email;
                console.log(`Plan Upgraded: User ${userId} (${targetEmail}) -> ${planType}`);

                // Send Email Invoice to User's Email
                await sendInvoiceEmail(upgradedUser, {
                    planName: PLANS[planType].name,
                    amount: session.amount_total / 100,
                    paymentId: session.payment_intent,
                    recipientEmail: targetEmail // Pass explicit recipient
                });
            } else {
                console.warn(`User ${userId} not found during Webhook upgrade.`);
            }

        } catch (dbErr) {
            console.error("Manual Database Update Failed during Webhook:", dbErr);
        }
    }

    res.json({ received: true });
};

// Manual verification fallback (used if webhook fails or for testing)
export const verifyPayment = async (req, res) => {
    try {
        const { session_id, userId } = req.body;
        console.log(`[PAYMENT]: Verifying session ${session_id} for user ${userId}`);

        if (!session_id || !userId) {
            return res.status(400).json({ success: false, message: "Missing session_id or userId" });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === "paid") {
            const { planType, limit } = session.metadata;
            const billingEmail = session.customer_details.email;

            const updatedUser = await User.findByIdAndUpdate(userId, {
                plan: planType,
                watchLimit: parseInt(limit),
                isPremium: true,
                paymentId: session.payment_intent,
                billingEmail: billingEmail,
                subscriptionStatus: "active",
            }, { new: true });

            if (updatedUser) {
                const targetEmail = billingEmail || updatedUser.email;
                console.log(`[PAYMENT]: Manual Upgrade Success for user ${userId} (${targetEmail})`);

                // Send Email Invoice immediately
                await sendInvoiceEmail(updatedUser, {
                    planName: PLANS[planType].name,
                    amount: session.amount_total / 100,
                    paymentId: session.payment_intent,
                    recipientEmail: targetEmail
                });

                res.status(200).json({ success: true, message: "Upgraded Successfully!", user: updatedUser });
            } else {
                console.error(`[PAYMENT]: User ${userId} not found during verification`);
                res.status(404).json({ success: false, message: "User not found. Try logging in again." });
            }
        } else {
            res.status(400).json({ success: false, message: `Payment not completed (Status: ${session.payment_status})` });
        }
    } catch (error) {
        console.error("[PAYMENT]: Verification Error:", error);
        res.status(500).json({ success: false, message: "Server encountered an error during verification", error: error.message });
    }
};
