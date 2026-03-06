import { sendOTPEmail } from "./utils/emailService.js";
import dotenv from "dotenv";
dotenv.config();

const test = async () => {
    console.log("Testing sendOTPEmail to ishurawat524@gmail.com...");
    try {
        await sendOTPEmail("ishurawat524@gmail.com", "123456");
        console.log("Test call finished.");
    } catch (err) {
        console.error("Test call failed:", err);
    }
};

test();
