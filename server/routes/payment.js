import express from "express";
import { createCheckoutSession, verifyPayment, stripeWebhook } from "../controllers/payment.js";

const routes = express.Router();

// WEBHOOK HANDLER: Handle incoming Stripe success events
routes.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

routes.post("/create-checkout-session", createCheckoutSession); // Aligned with user request
routes.post("/verify", verifyPayment);

export default routes;
