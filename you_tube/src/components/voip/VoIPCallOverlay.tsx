import React, { useState, useEffect, useRef } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useUser } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Phone, PhoneOff, Video, VideoOff, Mic, MicOff,
    Monitor, Radio, Square, Download, User,
    X, Maximize2, Minimize2
} from 'lucide-react';

interface VoIPCallOverlayProps {
    targetUserId?: string;
    targetUserName?: string;
    onClose: () => void;
}

const VoIPCallOverlay: React.FC<VoIPCallOverlayProps> = ({ targetUserId, targetUserName, onClose }) => {
    const { user } = useUser();
    const [isRecording, setIsRecording] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunks = useRef<Blob[]>([]);

    const {
        localVideoRef,
        remoteVideoRef,
        callStatus,
        callUser,
        answerCall,
        endCall,
        toggleScreenShare,
        toggleMic,
        toggleCamera,
        screenStream,
        localStream,
        remoteStream
    } = useWebRTC(user?._id);

    const [micEnabled, setMicEnabled] = useState(true);
    const [camEnabled, setCamEnabled] = useState(true);

    // Initial Trigger for calling/answering
    useEffect(() => {
        if (targetUserId) {
            if (callStatus === 'idle') {
                callUser(targetUserId, targetUserName || "Unknown User");
            } else if (callStatus === 'incoming') {
                answerCall();
            }
        }
    }, [targetUserId, callStatus]);

    // Handle Call Ending from UI
    const handleEndCall = () => {
        if (isRecording) stopRecording();
        endCall();
        onClose();
    };

    // Recording Logic
    const startRecording = () => {
        if (!remoteStream && !localStream) return;

        setIsRecording(true);
        recordedChunks.current = [];

        // In a real scenario, we'd use a canvas or specialized library to combine streams.
        // For this task, we'll record the remote stream (which is the main view).
        const streamToRecord = remoteStream || localStream;
        if (!streamToRecord) return;

        const recorder = new MediaRecorder(streamToRecord, { mimeType: 'video/webm' });

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) recordedChunks.current.push(event.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `YouTube_Call_Recording_${Date.now()}.webm`;
            a.click();
            URL.revokeObjectURL(url);
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
    };

    const stopRecording = () => {
        setIsRecording(false);
        mediaRecorderRef.current?.stop();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    width: isMinimized ? 300 : '100vw',
                    height: isMinimized ? 200 : '100vh',
                    bottom: isMinimized ? 20 : 0,
                    right: isMinimized ? 20 : 0,
                    position: 'fixed'
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`z-[9999] bg-zinc-950 flex flex-col items-center overflow-hidden border border-white/10 ${isMinimized ? 'rounded-3xl shadow-2xl' : ''}`}
            >
                {/* Header Controls */}
                <div className="absolute top-6 right-6 flex items-center gap-3 z-50">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white transition-all"
                    >
                        {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
                    </button>
                    {!isMinimized && (
                        <button
                            onClick={handleEndCall}
                            className="p-3 bg-red-600/20 hover:bg-red-600 backdrop-blur-md rounded-2xl text-red-500 hover:text-white transition-all border border-red-600/50"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Video Streams Container */}
                <div className="relative w-full h-full flex items-center justify-center bg-zinc-900">
                    {/* Remote Video (Main) */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className={`w-full h-full object-cover transition-all duration-700 ${!remoteStream ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                    />

                    {!remoteStream && callStatus === 'calling' && (
                        <div className="flex flex-col items-center gap-6 animate-pulse">
                            <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center border-2 border-red-600">
                                <User size={48} className="text-red-500" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-white font-black text-xl tracking-tighter uppercase italic">Calling...</h3>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Connecting to {targetUserName}</p>
                            </div>
                        </div>
                    )}

                    {/* Local Video (Floating PIP) */}
                    <motion.div
                        drag
                        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                        className={`absolute bottom-24 right-6 w-48 aspect-video bg-zinc-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-40 ${isMinimized ? 'hidden' : ''}`}
                    >
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded text-[8px] font-black text-white uppercase tracking-widest">
                            You
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Control Bar */}
                {!isMinimized && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute bottom-10 flex items-center gap-4 bg-zinc-900/60 backdrop-blur-2xl px-8 py-6 rounded-[2.5rem] border border-white/10 shadow-2xl"
                    >
                        <button
                            onClick={() => { toggleMic(); setMicEnabled(!micEnabled); }}
                            className={`p-4 rounded-3xl transition-all ${micEnabled ? 'bg-zinc-800 text-white' : 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]'}`}
                        >
                            {micEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                        </button>

                        <button
                            onClick={() => { toggleCamera(); setCamEnabled(!camEnabled); }}
                            className={`p-4 rounded-3xl transition-all ${camEnabled ? 'bg-zinc-800 text-white' : 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]'}`}
                        >
                            {camEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                        </button>

                        <div className="w-[1px] h-10 bg-white/10 mx-2" />

                        <button
                            onClick={toggleScreenShare}
                            className={`p-4 rounded-3xl transition-all ${screenStream ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'bg-zinc-800 text-white'}`}
                        >
                            <Monitor size={24} />
                        </button>

                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`p-4 rounded-3xl transition-all flex items-center gap-2 ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-800 text-white'}`}
                        >
                            {isRecording ? <Square size={24} fill="white" /> : <Radio size={24} />}
                        </button>

                        <button
                            onClick={handleEndCall}
                            className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-3xl shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all ml-4"
                        >
                            <PhoneOff size={28} />
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default VoIPCallOverlay;
