import axios from "axios";

// Automatically identify if we are in production (e.g., Vercel) or local
const isProd = process.env.NODE_ENV === "production";

// Priority 1: Use variable set in Vercel settings (NEXT_PUBLIC_BACKEND_URL)
// Priority 2: In dev mode, default back to localhost:5000
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

if (isProd && !backendUrl) {
    console.warn("CRITICAL: NEXT_PUBLIC_BACKEND_URL is missing in production! Please set it in Vercel settings.");
}

console.log(`📡 Axios Instance using baseURL: ${backendUrl || "http://localhost:5000"}`);

const axiosInstance = axios.create({
    baseURL: backendUrl || "http://localhost:5000",
});

export default axiosInstance;
