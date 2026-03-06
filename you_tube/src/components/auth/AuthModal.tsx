"use client";

import React, { useState } from "react";
import { Mail, Loader2, ShieldCheck, Chrome } from "lucide-react";
import { useUser } from "@/lib/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { initiateLogin, handlegooglesignin, loading } = useUser();
    const [email, setEmail] = useState("");
    const [view, setView] = useState<"choice" | "email">("choice");

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        await initiateLogin({ email });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] rounded-3xl p-6 border-none shadow-2xl bg-white dark:bg-zinc-900">
                <DialogHeader className="space-y-4 items-center text-center">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                        <DialogTitle className="text-2xl font-black">Sign In to YouTube</DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium">
                            Join our premium community today.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="mt-6 space-y-4">
                    {view === "choice" ? (
                        <>
                            <Button
                                onClick={handlegooglesignin}
                                variant="outline"
                                className="w-full py-6 rounded-2xl border-2 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-3 text-base font-bold transition-all"
                            >
                                <Chrome className="w-5 h-5 text-blue-500" />
                                Continue with Google
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-100 dark:border-zinc-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-zinc-900 px-4 text-gray-400 font-bold">Or</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => setView("email")}
                                className="w-full py-6 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-base hover:opacity-90 transition-all"
                            >
                                <Mail className="w-5 h-5 mr-3" />
                                Sign in with Email
                            </Button>
                        </>
                    ) : (
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-12 py-7 rounded-2xl border-2 focus:border-red-500 transition-all bg-gray-50 dark:bg-zinc-800 border-transparent text-base font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full py-7 text-lg font-black rounded-2xl shadow-lg bg-red-600 hover:bg-red-700 transition-all text-white"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Send Verification Code"}
                            </Button>

                            <button
                                type="button"
                                onClick={() => setView("choice")}
                                className="w-full text-center text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Go Back
                            </button>
                        </form>
                    )}
                </div>

                <p className="mt-8 text-center text-[10px] text-gray-400 font-medium px-4">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
