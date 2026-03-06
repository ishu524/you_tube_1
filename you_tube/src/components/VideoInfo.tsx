import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
    Clock,
    Download,
    MoreHorizontal,
    Share,
    ThumbsDown,
    ThumbsUp,
    Video,
} from "lucide-react";
import VoIPCallOverlay from "./voip/VoIPCallOverlay";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";




const VideoInfo = ({ video }: any) => {
    const [likes, setlikes] = useState(video.Like || 0);
    const [dislikes, setDislikes] = useState(video.Dislike || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const { user, setUser } = useUser();
    const [isWatchLater, setIsWatchLater] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showCall, setShowCall] = useState(false);



    // const user: any = {
    //   id: "1",
    //   name: "John Doe",
    //   email: "john@example.com",
    //   image: "https://github.com/shadcn.png?height=32&width=32",
    // };
    useEffect(() => {
        setlikes(video.Like || 0);
        setDislikes(video.Dislike || 0);
        setIsLiked(false);
        setIsDisliked(false);
    }, [video]);

    useEffect(() => {
        const handleviews = async () => {
            if (user) {
                try {
                    return await axiosInstance.post(`/history/${video._id}`, {
                        userId: user?._id,
                    });
                } catch (error) {
                    return console.log(error);
                }
            } else {
                return await axiosInstance.post(`/history/views/${video?._id}`);
            }
        };
        handleviews();
    }, [user]);
    const handleLike = async () => {
        if (!user) return;
        try {
            const res = await axiosInstance.post(`/like/${video._id}`, {
                userId: user?._id,
            });
            if (res.data.liked) {
                if (isLiked) {
                    setlikes((prev: any) => prev - 1);
                    setIsLiked(false);
                } else {
                    setlikes((prev: any) => prev + 1);
                    setIsLiked(true);
                    if (isDisliked) {
                        setDislikes((prev: any) => prev - 1);
                        setIsDisliked(false);
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };
    const handleWatchLater = async () => {
        try {
            const res = await axiosInstance.post(`/watch/${video._id}`, {
                userId: user?._id,
            });
            if (res.data.watchlater) {
                setIsWatchLater(!isWatchLater);
            } else {
                setIsWatchLater(false);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const handleDislike = async () => {
        if (!user) return;
        try {
            const res = await axiosInstance.post(`/like/${video._id}`, {
                userId: user?._id,
            });
            if (!res.data.liked) {
                if (isDisliked) {
                    setDislikes((prev: any) => prev - 1);
                    setIsDisliked(false);
                } else {
                    setDislikes((prev: any) => prev + 1);
                    setIsDisliked(true);
                    if (isLiked) {
                        setlikes((prev: any) => prev - 1);
                        setIsLiked(false);
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    // DOWNLOAD LOGIC
    const handleDownload = async () => {
        if (!user) {
            return toast.error("Please login to download this video.");
        }

        setIsDownloading(true);
        try {
            const res = await axiosInstance.post(`/download/${video._id}`, { userId: user._id });

            if (res.data.success) {
                toast.success("Download Approved! Preparing video...");

                // Simulate actual file download trigger
                const link = document.createElement('a');
                // The filePath needs to be correctly hosted/configured. For testing, assuming abstract URL.
                link.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${res.data.filePath}`;
                link.download = res.data.fileName || "video.mp4";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error: any) {
            if (error.response && error.response.status === 403) {
                toast.error(error.response.data.message || "Download limit reached!");
            } else {
                toast.error("Failed to download video. Please try again.");
                console.error(error);
            }
        } finally {
            setIsDownloading(false);
        }
    };

    const [isPremiumLoading, setIsPremiumLoading] = useState(false);

    // PREMIUM STRIPE PAYMENT LOGIC
    const handleUpgradePremium = () => {
        if (!user) return toast.error("Please login to see plans.");
        window.location.href = "/plans";
    };


    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold">{video.videotitle}</h1>

            <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-6">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Avatar and Channel Info */}
                    <div className="flex items-center gap-3">
                        <Link href={`/channel/${video.uploader}`}>
                            <Avatar className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity">
                                <AvatarFallback>{video.videochanel[0]}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div>
                            <Link href={`/channel/${video.uploader}`}>
                                <h3 className="font-medium text-[var(--foreground)] leading-tight cursor-pointer hover:text-red-600 transition-colors">{video.videochanel}</h3>
                            </Link>
                            <p className="text-xs text-gray-500">1.2M subscribers</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-5 font-bold">
                            Subscribe
                        </Button>

                        {/* Unique VoIP Call Button */}
                        {user && user._id !== video.uploader && video.callCreator && (
                            <Button
                                variant="outline"
                                className="rounded-full border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-all font-bold group px-4"
                                onClick={() => setShowCall(true)}
                            >
                                <Video className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                                Call Creator
                            </Button>
                        )}
                    </div>
                </div>

                {showCall && (
                    <VoIPCallOverlay
                        targetUserId={video.uploader}
                        targetUserName={video.videochanel}
                        onClose={() => setShowCall(false)}
                    />
                )}
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 rounded-full">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-l-full"
                            onClick={handleLike}
                        >
                            <ThumbsUp
                                className={`w-5 h-5 mr-2 ${isLiked ? "fill-black text-black" : ""
                                    }`}
                            />
                            {likes.toLocaleString()}
                        </Button>
                        <div className="w-px h-6 bg-gray-300" />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-r-full"
                            onClick={handleDislike}
                        >
                            <ThumbsDown
                                className={`w-5 h-5 mr-2 ${isDisliked ? "fill-black text-black" : ""
                                    }`}
                            />
                            {dislikes.toLocaleString()}
                        </Button>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`bg-gray-100 rounded-full ${isWatchLater ? "text-primary" : ""
                            }`}
                        onClick={handleWatchLater}
                    >
                        <Clock className="w-5 h-5 mr-2" />
                        {isWatchLater ? "Saved" : "Watch Later"}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="bg-gray-100 rounded-full"
                    >
                        <Share className="w-5 h-5 mr-2" />
                        Share
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="bg-gray-100 rounded-full"
                        onClick={handleDownload}
                        disabled={isDownloading}
                    >
                        <Download className="w-5 h-5 mr-2" />
                        {isDownloading ? "Downloading..." : "Download"}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-gray-100 rounded-full"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </Button>
                </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex gap-4 text-sm font-medium mb-2 items-center justify-between">
                    <div>
                        <span>{video.views.toLocaleString()} views</span>
                        <span className="ml-4">{formatDistanceToNow(new Date(video.createdAt))} ago</span>
                    </div>
                    {user && !user.isPremium ? (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleUpgradePremium}
                            disabled={isPremiumLoading}
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black border-0"
                        >
                            {isPremiumLoading ? "Initializing..." : "⭐ Upgrade to Premium"}
                        </Button>
                    ) : user && user.isPremium ? (
                        <span className="text-yellow-600 font-bold text-xs bg-yellow-100 px-3 py-1 rounded-full border border-yellow-300">
                            ⭐ Premium Member
                        </span>
                    ) : null}
                </div>
                <div className={`text-sm mt-3 ${showFullDescription ? "" : "line-clamp-3"}`}>
                    <p>
                        Sample video description. This would contain the actual video
                        description from the database.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 p-0 h-auto font-medium"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                >
                    {showFullDescription ? "Show less" : "Show more"}
                </Button>
            </div>
        </div>
    );
};

export default VideoInfo;