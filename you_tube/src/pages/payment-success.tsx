import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PaymentSuccess() {
    const router = useRouter();
    const { session_id, userId } = router.query;
    const { user, login } = useUser();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        // Wait for router to be ready to ensure query params are available
        if (router.isReady && session_id && userId) {
            verifyPayment();
        }
    }, [router.isReady, session_id, userId]);

    const verifyPayment = async () => {
        try {
            console.log("Verifying payment for session:", session_id);
            const res = await axiosInstance.post("/api/payment/verify", {
                session_id,
                userId,
            });

            if (res.data.success && res.data.user) {
                toast.success("Welcome to Premium!");
                // Use login to persist updated user data (isPremium, plan, etc.) to localStorage
                login(res.data.user);
            } else {
                toast.error(res.data.message || "Verification failed. Please contact support.");
            }
        } catch (error: any) {
            console.error("Verification Error:", error);
            const errMsg = error.response?.data?.message || "An error occurred during verification.";
            toast.error(errMsg);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center p-4">
            {verifying ? (
                <div className="space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <h2 className="text-xl font-semibold">Verifying your payment...</h2>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                    <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">Payment Successful!</h1>
                        <p className="text-gray-600 max-w-md">
                            Thank you for upgrading to Premium. You now have unlimited downloads and all premium features unlocked.
                        </p>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <Button asChild className="bg-red-600 hover:bg-red-700">
                            <Link href="/">Go to Home</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/profile/downloads">View Downloads</Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
