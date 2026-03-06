import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// THIS SCRIPT TESTS YOUR GMAIL CONFIGURATION
const testEmail = async () => {
    console.log("--- STARTING EMAIL TEST ---");
    console.log("Using Email:", process.env.EMAIL_USER);
    console.log("Using Password:", process.env.EMAIL_PASS ? "**** (Hidden)" : "MISSING!");

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("ERROR: EMAIL_USER or EMAIL_PASS is missing in .env!");
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        service: "gmail", // Simplified for testing
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Sending to yourself to test
        subject: "YourTube Email Test ✅",
        text: "If you see this, your Gmail App Password is working perfectly!",
        html: "<h1>Success! 🎉</h1><p>Your Gmail configuration for YourTube is 100% correct.</p>",
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ SUCCESS! Email sent to your inbox: " + info.messageId);
        console.log("Check your Gmail inbox (and Spam folder) now!");
    } catch (error) {
        console.error("❌ FAILED! Email could not be sent.");
        console.error("Error Message:", error.message);
        console.log("\nPossible Fixes:");
        console.log("1. Double check the 16-character App Password (no spaces).");
        console.log("2. Ensure 2-Step Verification is turned ON in Google settings.");
        console.log("3. Make sure YOUR_EMAIL matches exactly in .env.");
    }
};

testEmail();
