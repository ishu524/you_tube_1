import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@/lib/AuthContext";
import UpgradeModal from "./UpgradeModal";
import { toast } from "sonner";
import { getMediaUrl } from "@/lib/utils";

const Videoplayer = ({ video }: any) => {
    const { user } = useUser();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLimitReached, setIsLimitReached] = useState(false);

    // Default watch limit (Free = 5 mins, Bronze = 7 mins, Silver = 10 mins, Gold = Unlimited)
    const WATCH_LIMITS: Record<string, number> = {
        "free": 5,
        "bronze": 7,
        "silver": 10,
        "gold": 999999, // Practically unlimited
    };

    const userPlan = user?.plan || "free";
    // Priority: Database limit -> Hardcoded fallback
    const userLimitMinutes = user?.watchLimit || (userPlan === "gold" ? 99999 : 5);
    const userLimitSeconds = userLimitMinutes * 60;

    useEffect(() => {
        const handleTimeUpdate = () => {
            if (!videoRef.current) return;

            const currentTime = videoRef.current.currentTime;

            // Check if limit exceeded
            if (currentTime >= userLimitSeconds && userPlan !== "gold") {
                videoRef.current.pause();
                // videoRef.current.currentTime = userLimitSeconds;
                setIsLimitReached(true);

                // Extra security: Enter focus mode on limit
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
            }
        };

        const currentVideo = videoRef.current;
        if (currentVideo) {
            currentVideo.addEventListener("timeupdate", handleTimeUpdate);
        }

        return () => {
            if (currentVideo) {
                currentVideo.removeEventListener("timeupdate", handleTimeUpdate);
            }
        };
    }, [userLimitSeconds, userPlan]);

    return (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
            <video
                ref={videoRef}
                className="w-full h-full"
                controls
                controlsList={isLimitReached ? "nodownload noplaybackrate" : ""}
            >
                <source src={getMediaUrl(video?.filepath)} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Overlay Modal when limit reached */}
            <UpgradeModal isOpen={isLimitReached} />

            {/* Limit Banner Overlay (Optional subtle indicator) */}
            {userPlan === "free" && !isLimitReached && (
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Free Preview: 5 Mins
                </div>
            )}
        </div>
    );
};

export default Videoplayer;
