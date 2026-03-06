import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useGestureControls } from '@/hooks/useGestureControls';
import FeedbackOverlay from './FeedbackOverlay';
import { Play, Pause, Volume2, Maximize, Settings, SkipForward, SkipBack } from 'lucide-react';
import { getMediaUrl } from '@/lib/utils';

interface GestureVideoPlayerProps {
    video: any;
}

const GestureVideoPlayer: React.FC<GestureVideoPlayerProps> = ({ video }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [feedbackType, setFeedbackType] = useState<any>(null);

    // Gestures Handler Logics
    const triggerFeedback = (type: string) => {
        setFeedbackType(type);
        setTimeout(() => setFeedbackType(null), 1000);
    };

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            triggerFeedback('pause');
        } else {
            videoRef.current.play();
            triggerFeedback('play');
        }
        setIsPlaying(!isPlaying);
    };

    const forward = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime += 10;
        triggerFeedback('forward');
    };

    const rewind = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime -= 10;
        triggerFeedback('rewind');
    };

    const nextVideo = () => {
        // Mock navigation to next video
        triggerFeedback('next');
        setTimeout(() => {
            router.push('/'); // Fallback to list
        }, 800);
    };

    const closeWebsite = () => {
        triggerFeedback('close');
        setTimeout(() => {
            window.location.href = '/';
        }, 800);
    };

    const openComments = () => {
        triggerFeedback('comments');
        document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Use Custom Hook for gestured logic
    const { handleGesture } = useGestureControls({
        onSingleTapCenter: togglePlay,
        onDoubleTapLeft: rewind,
        onDoubleTapRight: forward,
        onTripleTapCenter: nextVideo,
        onTripleTapLeft: openComments,
        onTripleTapRight: closeWebsite,
    });

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        handleGesture(clientX - rect.left, rect.width);
    };

    // Video events sync
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => setCurrentTime(video.currentTime);
        const updateDuration = () => setDuration(video.duration);

        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('loadedmetadata', updateDuration);

        return () => {
            video.removeEventListener('timeupdate', updateProgress);
            video.removeEventListener('loadedmetadata', updateDuration);
        };
    }, []);

    // Desktop Key listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input or textarea
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }

            if (e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying]);

    return (
        <div
            ref={containerRef}
            className="group relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-100/10"
            onClick={handleInteraction}
            onTouchStart={handleInteraction}
        >
            <video
                ref={videoRef}
                className="w-full h-full object-contain pointer-events-none"
                preload="metadata"
            >
                <source src={getMediaUrl(video?.filepath)} type="video/mp4" />
            </video>

            {/* Animation Overlays */}
            <FeedbackOverlay type={feedbackType} />

            {/* Top Info Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <h2 className="text-white text-lg font-black tracking-tight drop-shadow-md">
                    {video?.videotitle}
                </h2>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{video?.videochanel}</span>
            </div>

            {/* Bottom Controls (Touch Sensitive Zone) */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity space-y-4">

                {/* Progress Bar */}
                <div className="relative h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer group/bar">
                    <div
                        className="absolute h-full bg-red-600 transition-all"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                </div>

                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-6">
                        <button onClick={togglePlay} className="hover:scale-110 transition-transform">
                            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                        </button>
                        <div className="flex items-center gap-4">
                            <SkipBack className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                            <SkipForward className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                        </div>
                        <div className="text-xs font-black tracking-tighter">
                            {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} /
                            {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <Volume2 className="w-6 h-6 text-gray-300" />
                        <Settings className="w-6 h-6 text-gray-300" />
                        <Maximize className="w-6 h-6 text-gray-300" />
                    </div>
                </div>
            </div>

            {/* Zone Map Labels (Optional, helpful for onboarding) */}
            {/* 
            <div className="absolute inset-0 flex pointer-events-none opacity-10 font-bold text-white text-[8px] uppercase tracking-widest">
                <div className="w-[30%] border-r border-white/5 flex items-center justify-center">Rewind Zone</div>
                <div className="w-[40%] flex items-center justify-center">Play / Control Zone</div>
                <div className="w-[30%] border-l border-white/5 flex items-center justify-center">Forward Zone</div>
            </div> 
            */}
        </div>
    );
};

export default GestureVideoPlayer;
