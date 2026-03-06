import mongoose from "mongoose";
const userschema = mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String },
    channelname: { type: String },
    description: { type: String },
    image: { type: String },
    joinedon: { type: Date, default: Date.now },
    isPremium: { type: Boolean, default: false },
    dailyDownloadCount: { type: Number, default: 0 },
    lastDownloadDate: { type: Date },
    premiumActivatedAt: { type: Date },

    // Stripe Subscription Fields
    plan: {
        type: String,
        enum: ["free", "bronze", "silver", "gold"],
        default: "free"
    },
    watchLimit: { type: Number, default: 5 }, // Default watch limit in minutes (free plan)
    stripeCustomerId: String,
    stripeSessionId: String,
    planStartDate: Date,
    paymentId: String,
    billingEmail: String,
    subscriptionStatus: String,

    // Geo & Theme Rules
    phone: { type: String },
    state: { type: String },
    otpHash: { type: String },
    otpExpiry: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    authMethod: { type: String, enum: ["email", "sms"] },
    themePreference: { type: String, enum: ["light", "dark"], default: "dark" }
});

export default mongoose.model("user", userschema);