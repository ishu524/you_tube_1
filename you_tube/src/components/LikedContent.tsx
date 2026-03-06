import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button';
import { Clock, MoreVertical, Play, ThumbsUp, X, } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { DropdownMenuTrigger } from './ui/dropdown-menu';
import { useUser } from '@/lib/AuthContext';
import axiosInstance from '@/lib/axiosinstance';
import { getMediaUrl } from '@/lib/utils';

interface LikedItem {
    _id: string;
    videoid: any;
    viewer: string;
    watchedon: string;
    video: {
        _id: string;
        videotitle: string;
        videochanel: string;
        views: number;
        createdAt: string;
        filepath?: string;
    };
}
const LikedContent = () => {
    const { user } = useUser();
    const [Like, setLike] = useState<LikedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadLikedVideos();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadLikedVideos = async () => {
        if (!user) return;
        try {
            const res = await axiosInstance.get(`/like/${user?._id}`);
            // Check if the response matches the expected structure
            setLike(res.data);
        } catch (error) {
            console.error("Failed to load liked videos:", error);
        } finally {
            setLoading(false);
        }
    };
    const handleunlikevideo = async (likeId: string) => {
        try {
            console.log("Removing history item with ID:", likeId);
            setLike(Like.filter((item) => item._id !== likeId)
            );
        } catch (error) {
            console.error("Error removing history item:", error);
        }
    };

    if (!user) {
        return (
            <div className='text-center py-12'>
                <Clock className="w-6 h-6 mx-auto text-gray-400 mb-4" />
                <h2 className='text-xl font-semibold mb-2'>Keep track of viedos you like</h2>
                <p className='text-gray-600'>Sign in to see your liked videos.</p>
            </div>
        );
    }

    if (loading) {
        return <div>Loading Liked Videos...</div>;
    }

    if (Like.length === 0) {
        return (
            <div text-center py-12>
                <ThumbsUp className='w-16 h-16 mx-auto text-gray-400 mb-4' />
                <h2 className='text-xl font-semibold mb-2'>No Liked Videos yet</h2>
                <p className='text-gray-600'>Videos you watch will appear here</p>
            </div>
        );
    }




    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">{Like.length} videos</p>
                <Button className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Play all
                </Button>
            </div>

            <div className="space-y-4">
                {Like.map((item) => (
                    <div key={item._id} className="flex gap-4 group">
                        <Link href={`/watch/${item.video._id}`} className="`flex-shrink-0`">
                            <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden">
                                <video
                                    src={getMediaUrl(item.video?.filepath)}
                                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                                    preload="metadata"
                                />
                            </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                            <Link href={`/watch/${item.video._id}`}>
                                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 mb-1">
                                    {item.video.videotitle}
                                </h3>
                            </Link>

                            <p className="text-sm text-gray-600">
                                {item.video.videochanel}
                            </p>

                            <p className="text-sm text-gray-600">
                                {item.video.views.toLocaleString()} views •{" "}
                                {formatDistanceToNow(new Date(item.video.createdAt))} ago
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                                Liked {formatDistanceToNow(new Date(item.watchedon))} ago
                            </p>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => handleunlikevideo(item._id)}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Remove from liked videos
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}

            </div>
        </div>
    );
};

export default LikedContent