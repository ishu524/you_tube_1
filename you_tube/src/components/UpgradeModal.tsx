import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { AlertCircle, Lock } from "lucide-react";

interface UpgradeModalProps {
    isOpen: boolean;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm text-center space-y-6 mx-4 transform animate-in zoom-in duration-300">
                <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-red-600">
                    <Lock className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">Watch Limit Reached!</h2>
                    <p className="text-gray-600">
                        Your current plan only allows for limited preview. Upgrade to continue watching this video.
                    </p>
                </div>

                <div className="space-y-3 pt-2">
                    <Button asChild className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg font-bold">
                        <Link href="/plans">See Plans & Upgrade</Link>
                    </Button>
                </div>

                <p className="text-xs text-gray-400">
                    Bronze starts at just ₹10
                </p>
            </div>
        </div>
    );
};

export default UpgradeModal;
