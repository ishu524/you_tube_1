import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PaymentFailed() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center p-4">
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                <XCircle className="w-20 h-20 text-red-500 mx-auto" />
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Payment Failed</h1>
                    <p className="text-gray-600 max-w-md">
                        We couldn't process your payment. Please try again or contact support if the issue persists.
                    </p>
                </div>
                <div className="flex gap-4 justify-center">
                    <Button asChild className="bg-red-600 hover:bg-red-700">
                        <Link href="/">Back to Home</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
