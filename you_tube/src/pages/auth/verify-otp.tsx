import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, Mail, MessageSquare } from "lucide-react";

export default function VerifyOTP() {
    const router = useRouter();
    const { userId, method, mockOTP } = router.query;
    const { verifyOTP, loading } = useUser();
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(300); // 5 minutes

    useEffect(() => {
        if (!userId) {
            // router.push("/");
        }
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [userId]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) return;
        await verifyOTP(userId as string, otp);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Verify Your Identity</h1>
                        <p className="text-gray-500 text-sm">
                            We've sent a 6-digit code to your {method === "email" ? "Email" : "Mobile Phone"}.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                            Enter OTP Code
                        </label>
                        <Input
                            type="text"
                            maxLength={6}
                            placeholder="· · · · · ·"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="text-center text-3xl font-black tracking-[1rem] py-8 rounded-2xl border-2 focus:border-red-500 transition-all bg-gray-50 dark:bg-zinc-800 border-transparent"
                        />
                    </div>

                    <div className="flex justify-between items-center px-1">
                        <span className={`text-sm font-bold ${timer < 60 ? "text-red-500 animate-pulse" : "text-gray-400"}`}>
                            Expires in: {formatTime(timer)}
                        </span>
                        <button type="button" className="text-sm font-bold text-red-600 hover:underline">
                            Resend Code
                        </button>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || otp.length !== 6 || timer === 0}
                        className="w-full py-7 text-lg font-black rounded-2xl shadow-lg bg-red-600 hover:bg-red-700 transition-all text-white"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify & Login"}
                    </Button>
                </form>

                {mockOTP && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
                        <div className="flex gap-3 text-yellow-800 dark:text-yellow-400">
                            <div className="text-xs font-medium">
                                <strong>DEV MODE:</strong> Your test OTP is <code className="bg-yellow-200 dark:bg-yellow-800 px-2 py-0.5 rounded font-black">{mockOTP}</code>
                            </div>
                        </div>
                    </div>
                )}

                <p className="text-center text-xs text-gray-400 font-medium">
                    By verifying, you agree to our Terms and Conditions.
                </p>
            </div>
        </div>
    );
}
