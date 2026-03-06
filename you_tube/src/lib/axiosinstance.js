import axios from "axios";

const isProd = process.env.NODE_ENV === "production";
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

if (isProd && !backendUrl) {
    console.error("CRITICAL: NEXT_PUBLIC_BACKEND_URL is missing in production! Please set it in Vercel settings.");
}

const axiosInstance = axios.create({
    baseURL: backendUrl || "http://localhost:5000",
});

export default axiosInstance;