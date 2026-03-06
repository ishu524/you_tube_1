import React, { useEffect, useState } from "react";
import Videocard from "./Viedocard";
import axiosInstance from "@/lib/axiosinstance";

const Videogrid = () => {
    const [videos, setvideo] = useState<any[] | null>(null); // Better type definition for videos
    const [loading, setloading] = useState(true);
    const [error, setError] = useState<string | null>(null); // State to handle errors

    useEffect(() => {
        const fetchvideo = async () => {
            try {
                const res = await axiosInstance.get("/video/get");
                setvideo(res.data);
            } catch (err: any) { // Type the error
                console.error("Error fetching videos:", err);
                const isProd = process.env.NODE_ENV === "production";
                setError(isProd
                    ? "Failed to connect to backend. Please ensure NEXT_PUBLIC_BACKEND_URL is set correctly in Vercel."
                    : "Failed to load videos. Please ensure your local server is running on port 5000.");
                setvideo([]); // Optionally set videos to an empty array to prevent map error
            } finally {
                setloading(false);
            }
        };
        fetchvideo();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
                <>Loading..</>
            ) : error ? ( // Display error message if there's an error
                <p className="col-span-full text-red-500">{error}</p>
            ) : (
                // Add a conditional check for videos before mapping
                videos && videos.length > 0 ? (
                    videos.map((video: any) => <Videocard key={video._id} video={video} />)
                ) : (
                    <p className="col-span-full">No videos found.</p> // Message if no videos are returned
                )
            )}
        </div>
    );
};

export default Videogrid;
