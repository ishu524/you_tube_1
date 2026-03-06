import React, { useEffect, useState } from "react";

import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import axiosInstance from "@/lib/axiosinstance";
import { getMediaUrl } from "@/lib/utils";

interface Video {
    _id: string;
    videotitle: string;
    filename: string;
    filetype: string;
    filepath: string;
    filesize: string;
    videochanel: string;
    Like: number;
    views: number;
    uploader: string;
    createdAt: string;
}

const SearchResult = ({ query }: { query: string }) => {
    if (!query.trim()) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">
                    Enter a search term to find videos and channels.
                </p>
            </div>
        );
    }
    const [loading, setLoading] = useState(false);
    const [videoResults, setVideoResults] = useState<Video[] | null>(null);

    const fetchVideos = async () => {
        if (!query) return;
        setLoading(true);
        try {
            // Since there is no search API, we fetch all and filter client side
            const response = await axiosInstance.get("/video/get");
            const allVideos = response.data;
            let results = allVideos.filter(
                (vid: Video) =>
                    vid.videotitle?.toLowerCase().includes(query.toLowerCase()) ||
                    vid.videochanel?.toLowerCase().includes(query.toLowerCase())
            );
            setVideoResults(results);
        } catch (error) {
            console.error("Search Error:", error);
            setVideoResults([]);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchVideos();
    }, [query]);

    if (loading) return <div className="text-center py-12">Searching...</div>;
    if (!videoResults) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">No results found</h2>
                <p className="text-gray-600">
                    Try different keywords or remove search filters
                </p>
            </div>
        );
    }
    const hasResults = videoResults ? videoResults.length > 0 : true;
    if (!hasResults) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">No results found</h2>
                <p className="text-gray-600">
                    Try different keywords or remove search filters
                </p>
            </div>
        );
    }
    const vids = "/video/vdo.mp4";
    return (
        <div className="space-y-6">
            {/* Video Results */}
            {videoResults.length > 0 && (
                <div className="space-y-4">
                    {videoResults.map((item) => (
                        <div key={item._id} className="flex gap-4 group">
                            <Link href={`/watch/${item._id}`} className="flex-shrink-0">
                                <div className="relative w-80 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                    <video
                                        src={getMediaUrl(item.filepath)}
                                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                                        preload="metadata"
                                    />
                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
                                        10:24
                                    </div>
                                </div>
                            </Link>

                            <div className="flex-1 min-w-0 py-1">
                                <Link href={`/watch/${item._id}`}>
                                    <h3 className="font-medium text-lg line-clamp-2 group-hover:text-blue-600 mb-2">
                                        {item.videotitle}
                                    </h3>
                                </Link>

                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <span>{item.views.toLocaleString()} views</span>
                                    <span>•</span>
                                    <span>
                                        {formatDistanceToNow(new Date(item.createdAt))} ago
                                    </span>
                                </div>

                                <Link
                                    href={`/channel/${item.uploader}`}
                                    className="flex items-center gap-2 mb-2 hover:text-blue-600"
                                >
                                    <Avatar className="w-6 h-6">
                                        <AvatarFallback className="text-xs">
                                            {item.videochanel[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-gray-600">
                                        {item.videochanel}
                                    </span>
                                </Link>

                                <p className="text-sm text-gray-700 line-clamp-2">
                                    Sample video description that would show search-relevant
                                    content and help users understand what the video is about
                                    before clicking.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Load More Results */}
            {hasResults && (
                <div className="text-center py-8">
                    <p className="text-gray-600">
                        Showing {videoResults.length} results for "{query}"
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchResult;