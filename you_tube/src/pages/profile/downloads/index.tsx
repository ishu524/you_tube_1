import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import Header from "@/components/ui/Header";
import { Download, MonitorPlay } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/router";

export default function Downloads() {
    const { user } = useUser();
    const [downloads, setDownloads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            // Give context auth a moment to load before redirecting immediately
            setTimeout(() => {
                if (!user) {
                    toast.error("Please login to access downloads");
                    router.push("/");
                }
            }, 1000);
            return;
        }

        const fetchDownloads = async () => {
            try {
                const res = await axiosInstance.get(`/download/user/${user._id}`);
                if (res.data.success) {
                    setDownloads(res.data.downloads);
                }
            } catch (error) {
                console.error("Failed to fetch downloads", error);
                toast.error("Error loading downloads history");
            } finally {
                setLoading(false);
            }
        };

        fetchDownloads();
    }, [user, router]);

    if (!user) return <div className="p-8 text-center text-gray-500">Redirecting...</div>;
    if (loading) return <div className="p-8 text-center text-gray-500">Loading downloads history...</div>;

    return (
        <div className="min-h-screen bg-white">
            <Head>
                <title>Downloads | YourTube</title>
            </Head>

            <Header />

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 mt-16">
                <div className="flex items-center mb-8 border-b pb-4">
                    <Download className="w-8 h-8 mr-4 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Your Downloads</h1>
                </div>

                {downloads.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
                        <MonitorPlay className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-medium text-gray-700">No downloads yet</h2>
                        <p className="text-gray-500 mt-2">Videos you download will appear here.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {downloads.map((item: any, idx: number) => {
                            const video = item.videoId;
                            if (!video) return null; // Defensive check if video was deleted from db

                            return (
                                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer" onClick={() => router.push(`/watch/${video._id}`)}>
                                    <div className="w-48 flex-shrink-0">
                                        <div className="aspect-video bg-gray-200 rounded-lg relative overflow-hidden group">
                                            <video
                                                src={`http://localhost:5000/${video.filepath}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                                                {video.videotitle}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {video.videochanel}
                                            </p>
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-2">
                                            <span>Downloaded {formatDistanceToNow(new Date(item.downloadedAt))} ago</span>
                                            <span className="px-2 py-0.5 bg-gray-200 rounded-full">{video.filesize || "Unknown size"}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
