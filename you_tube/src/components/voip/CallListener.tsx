import React, { useState, useEffect } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useUser } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X } from 'lucide-react';
import VoIPCallOverlay from './VoIPCallOverlay';

const CallListener: React.FC = () => {
    const { user } = useUser();
    const [incomingCallData, setIncomingCallData] = useState<{ from: string; name: string } | null>(null);
    const [showCallUI, setShowCallUI] = useState(false);

    // This hook will handle the socket registration and incoming call events
    const { callStatus, answerCall, endCall } = useWebRTC(user?._id, (from, name) => {
        setIncomingCallData({ from, name });
    });

    const handleAccept = () => {
        setShowCallUI(true);
        setIncomingCallData(null);
        // answerCall logic is handled inside VoIPCallOverlay when it mounts with a targetUserId
    };

    const handleReject = () => {
        endCall();
        setIncomingCallData(null);
    };

    if (!user) return null;

    return (
        <>
            <AnimatePresence>
                {incomingCallData && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] bg-zinc-900 border border-white/10 p-6 rounded-[2rem] shadow-2xl flex items-center gap-8 backdrop-blur-2xl"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center animate-bounce">
                                <Phone size={28} className="text-white fill-current" />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-sm uppercase tracking-tighter italic">Incoming Call</h4>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{incomingCallData.name} is calling you...</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleReject}
                                className="p-4 bg-zinc-800 hover:bg-zinc-700 text-gray-400 rounded-2xl transition-all"
                            >
                                <X size={20} />
                            </button>
                            <button
                                onClick={handleAccept}
                                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all uppercase text-xs tracking-widest"
                            >
                                Accept
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showCallUI && (
                <VoIPCallOverlay
                    targetUserId={incomingCallData?.from} // This will be passed and the overlay will handle the rest
                    targetUserName={incomingCallData?.name}
                    onClose={() => setShowCallUI(false)}
                />
            )}
        </>
    );
};

export default CallListener;
