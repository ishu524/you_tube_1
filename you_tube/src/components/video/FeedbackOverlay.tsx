import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Rewind, FastForward, SkipForward, XCircle, MessageSquare } from 'lucide-react';

interface FeedbackOverlayProps {
    type: 'play' | 'pause' | 'rewind' | 'forward' | 'next' | 'close' | 'comments' | null;
}

const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ type }) => {
    if (!type) return null;

    const isSideAction = type === 'rewind' || type === 'forward';

    const renderContent = () => {
        switch (type) {
            case 'play': return <Play className="w-8 h-8 fill-current" />;
            case 'pause': return <Pause className="w-8 h-8 fill-current" />;
            case 'rewind': return <Rewind className="w-10 h-10" />;
            case 'forward': return <FastForward className="w-10 h-10" />;
            case 'next': return <SkipForward className="w-8 h-8" />;
            case 'close': return <XCircle className="w-8 h-8" />;
            case 'comments': return <MessageSquare className="w-8 h-8" />;
            default: return null;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: isSideAction ? 0 : 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                key={type}
                className={`absolute inset-0 flex items-center pointer-events-none z-50 text-white ${type === 'rewind' ? 'justify-start pl-[15%]' :
                        type === 'forward' ? 'justify-end pr-[15%]' :
                            'justify-center'
                    }`}
            >
                <div className="flex flex-col items-center gap-2">
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                        {renderContent()}
                    </div>
                    {isSideAction && (
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 drop-shadow-md">
                            {type === 'rewind' ? '-10 SEC' : '+10 SEC'}
                        </span>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FeedbackOverlay;
