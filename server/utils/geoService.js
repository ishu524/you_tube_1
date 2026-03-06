import axios from "axios";

export const getUserStateFromIP = async (ip) => {
    try {
        // Handling localhost for development
        if (ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1") {
            // For dev, we'll return a default (e.g., Delhi) or allow manual override
            return "Tamil Nadu"; // Setting a default for testing South India logic
        }

        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        if (response.data.status === "success") {
            return response.data.regionName || "Unknown";
        }
        return "Unknown";
    } catch (error) {
        console.error("Geo Location Error:", error);
        return "Unknown";
    }
};

export const SOUTH_INDIAN_STATES = [
    "Tamil Nadu",
    "Kerala",
    "Karnataka",
    "Andhra Pradesh",
    "Telangana"
];

export const isSouthIndia = (state) => {
    return SOUTH_INDIAN_STATES.includes(state);
};

export const getISTTime = () => {
    const date = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(date.getTime() + istOffset);
};
