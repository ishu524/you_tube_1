import React, { useState } from "react";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";
import { Check, Loader2, Sparkles, Rocket, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS = [
    {
        id: "free",
        name: "Free",
        price: 0,
        limit: "5 Minutes",
        icon: User,
        color: "bg-gray-50",
        borderColor: "border-gray-200",
        btnColor: "hidden",
        features: ["5 Min watch time per video", "Limited downloads", "Standard support"]
    },
    {
        id: "bronze",
        name: "Bronze",
        price: 50,
        limit: "7 Minutes",
        icon: Shield,
        color: "bg-orange-50",
        borderColor: "border-orange-200",
        btnColor: "bg-orange-600 hover:bg-orange-700",
        features: ["7 Min watch time per video", "1 Download per day", "Standard preview"]
    },
    {
        id: "silver",
        name: "Silver",
        price: 100,
        limit: "10 Minutes",
        icon: Sparkles,
        color: "bg-blue-50",
        borderColor: "border-blue-200",
        btnColor: "bg-blue-600 hover:bg-blue-700",
        features: ["10 Min watch time per video", "5 Downloads per day", "High quality preview"]
    },
    {
        id: "gold",
        name: "Gold",
        price: 150,
        limit: "Unlimited",
        icon: Rocket,
        color: "bg-yellow-50",
        borderColor: "border-yellow-200",
        btnColor: "bg-yellow-600 hover:bg-yellow-700",
        features: ["No watch limits (Unlimited)", "Unlimited downloads", "Early access to videos", "Priority streaming"]
    }
];

export default function PlansPage() {
    const { user } = useUser();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleUpgrade = async (planType: string) => {
        if (!user) return toast.error("Please login to upgrade.");

        setLoadingPlan(planType);
        try {
            console.log("Initiating upgrade for user:", user._id, "Plan:", planType);
            const res = await axiosInstance.post("/api/payment/create-checkout-session", {
                userId: user._id,
                planType: planType
            });

            if (res.data.success && res.data.url) {
                console.log("Redirecting to Stripe:", res.data.url);
                window.location.href = res.data.url;
            } else {
                const errorMsg = res.data.message || "Failed to initiate payment. Please try again later.";
                toast.error(errorMsg);
                console.error("Session creation error:", res.data);
            }
        } catch (error: any) {
            console.error("Upgrade Connection Error:", error);
            const errMsg = error.response?.data?.message || "Could not connect to the payment gateway. Check your internet or try again.";
            toast.error(errMsg);
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-20 min-h-screen">
            <div className="text-center space-y-4 mb-20 animate-in fade-in slide-in-from-top-1/2 duration-700">
                <h1 className="text-5xl font-black text-gray-900 tracking-tight">Choice your Plan</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Choose a plan that fits your viewing habits and unlock full entertainment.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {PLANS.map((plan, idx) => {
                    const PlanIcon = plan.icon;
                    const isCurrentPlan = user?.plan === plan.id;
                    const isFree = plan.id === "free";

                    return (
                        <div
                            key={plan.id}
                            className={`relative p-6 rounded-3xl border ${plan.borderColor} ${plan.color} flex flex-col space-y-6 shadow-sm hover:shadow-xl hover:translate-y-[-8px] transition-all duration-300 animate-in fade-in zoom-in group`}
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            {isCurrentPlan && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-lg whitespace-nowrap">
                                    CURRENT PLAN
                                </div>
                            )}

                            <div className="flex justify-between items-start">
                                <div className={`p-3 rounded-2xl bg-white shadow-md text-${plan.id === 'bronze' ? 'orange' : plan.id === 'silver' ? 'blue' : plan.id === 'gold' ? 'yellow' : 'gray'}-600 group-hover:scale-110 transition-transform`}>
                                    <PlanIcon className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black">₹{plan.price}</span>
                                    <span className="text-gray-500 text-xs">/total</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-gray-900">{plan.name}</h3>
                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{plan.limit} Watch Time</p>
                            </div>

                            <ul className="space-y-3 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex gap-2 text-xs text-gray-700 font-medium leading-tight">
                                        <div className="bg-white rounded-full p-0.5 shadow-sm h-fit shrink-0">
                                            <Check className="w-3 h-3 text-green-500" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {!isFree && (
                                <Button
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={loadingPlan === plan.id || isCurrentPlan}
                                    className={`w-full py-6 text-base font-black rounded-2xl shadow-lg transition-all ${plan.btnColor} ${isCurrentPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loadingPlan === plan.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : isCurrentPlan ? (
                                        "ACTIVE"
                                    ) : (
                                        "Upgrade"
                                    )}
                                </Button>
                            )}

                            {isFree && (
                                <div className="w-full py-3 text-center text-xs font-bold text-gray-400 bg-gray-100/50 rounded-xl">
                                    Default Plan
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-20 text-center text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
                * All plan upgrades are one-time payments for permanent account tier access. <br />
                Terms and Conditions apply to all subscriptions.
            </div>
        </div>
    );
}
