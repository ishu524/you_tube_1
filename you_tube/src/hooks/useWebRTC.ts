import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export const useWebRTC = (userId: string, onIncomingCall?: (from: string, name: string, signal: any) => void) => {
    const [incomingSignal, setIncomingSignal] = useState<any>(null); // Store signal locally for answering
    const [socket, setSocket] = useState<any>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'incoming' | 'connected'>('idle');
    const [otherUserId, setOtherUserId] = useState<string | null>(null);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const pendingCandidates = useRef<RTCIceCandidate[]>([]);

    // Initialize Socket Connection
    useEffect(() => {
        // Correctly handle signaling URL based on environment
        const signalingUrl = process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:5000';
        
        if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SIGNALING_URL) {
            console.warn('[WEBRTC]: NEXT_PUBLIC_SIGNALING_URL is missing in production. Falling back to localhost.');
        }

        const newSocket = io(signalingUrl);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('[WEBRTC]: Connected to signaling server');
            newSocket.emit('register', userId);
        });

        newSocket.on('incoming-call', ({ from, fromName, signal }) => {
            console.log('[WEBRTC]: Incoming call from', fromName);
            setOtherUserId(from);
            setCallStatus('incoming');
            setIncomingSignal(signal); // Store the signal here
            onIncomingCall?.(from, fromName, signal);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [userId]);

    const initPeerConnection = useCallback(() => {
        if (peerConnectionRef.current) return peerConnectionRef.current;

        const pc = new RTCPeerConnection(STUN_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate && otherUserId && socket) {
                socket.emit('ice-candidate', { to: otherUserId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            console.log('[WEBRTC]: Received remote track');
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    }, [socket, otherUserId]);

    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            console.error('[WEBRTC]: Error accessing media devices', err);
            return null;
        }
    };

    const callUser = async (targetUserId: string, targetUserName: string) => {
        if (!socket) {
            console.error('[WEBRTC]: Signaling socket is not connected yet.');
            return;
        }

        setOtherUserId(targetUserId);
        setCallStatus('calling');

        const stream = await startLocalStream();
        if (!stream) return;

        const pc = initPeerConnection();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('call-user', {
            userToCall: targetUserId,
            signalData: offer,
            from: userId,
            fromName: targetUserName // Pass your own name actually
        });

        socket.on('call-accepted', async (signal: RTCSessionDescriptionInit) => {
            console.log('[WEBRTC]: Call accepted');
            setCallStatus('connected');
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
            // Process any pending candidates
            pendingCandidates.current.forEach(candidate => pc.addIceCandidate(candidate));
            pendingCandidates.current = [];
        });

        socket.on('call-rejected', () => {
            console.log('[WEBRTC]: Call rejected');
            endCall();
        });
    };

    const answerCall = async (signalParam?: RTCSessionDescriptionInit) => {
        if (!socket) {
            console.error('[WEBRTC]: Signaling socket is not connected yet.');
            return;
        }

        const signalToUse = signalParam || incomingSignal;
        if (!signalToUse) return;

        const stream = await startLocalStream();
        if (!stream) return;

        const pc = initPeerConnection();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        await pc.setRemoteDescription(new RTCSessionDescription(signalToUse));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('accept-call', { signal: answer, to: otherUserId });
        setCallStatus('connected');
    };

    const endCall = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            setScreenStream(null);
        }
        socket.emit('end-call', { to: otherUserId });
        setRemoteStream(null);
        setCallStatus('idle');
        setOtherUserId(null);
    };

    const toggleScreenShare = async () => {
        if (screenStream) {
            // Stop sharing
            screenStream.getTracks().forEach(track => track.stop());
            setScreenStream(null);

            // Revert back to camera track
            if (peerConnectionRef.current && localStream) {
                const videoTrack = localStream.getVideoTracks()[0];
                const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
                if (sender) sender.replaceTrack(videoTrack);
            }
        } else {
            // Start sharing
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                setScreenStream(stream);

                if (peerConnectionRef.current) {
                    const screenTrack = stream.getVideoTracks()[0];
                    const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) sender.replaceTrack(screenTrack);

                    screenTrack.onended = () => toggleScreenShare(); // Handle built-in stop button
                }
            } catch (err) {
                console.error('[WEBRTC]: Screen share error', err);
            }
        }
    };

    const toggleMic = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
        }
    };

    const toggleCamera = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
        }
    };

    // Handle incoming ICE candidates
    useEffect(() => {
        if (!socket) return;
        socket.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
            if (peerConnectionRef.current?.remoteDescription) {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
                pendingCandidates.current.push(new RTCIceCandidate(candidate));
            }
        });
        socket.on('call-ended', () => endCall());
    }, [socket]);

    return {
        localStream,
        remoteStream,
        screenStream,
        callStatus,
        otherUserId,
        localVideoRef,
        remoteVideoRef,
        callUser,
        answerCall,
        endCall,
        toggleScreenShare,
        toggleMic,
        toggleCamera
    };
};
