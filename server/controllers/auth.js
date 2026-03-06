import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import users from "../Models/Auth.js";
import { getUserStateFromIP, isSouthIndia, getISTTime } from "../utils/geoService.js";
import { generateOTP, hashOTP, verifyHashedOTP } from "../utils/otpService.js";
import { sendOTPEmail } from "../utils/emailService.js";
import { sendSMSOTP } from "../utils/smsService.js";

// STEP 1: LOGIN INITIATE (Detect region, send OTP, decide theme)
export const login = async (req, res) => {
    const { email, name, image, phone } = req.body;
    // Get IP manually for localhost test or use request-ip middleware
    const userIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    try {
        const state = await getUserStateFromIP(userIP);
        const southIndia = isSouthIndia(state);

        // 1. SELECT THEME BASED ON RULES
        const istTime = getISTTime();
        const currentHour = istTime.getHours();
        const currentMinute = istTime.getMinutes();

        // Between 10:00 AM and 12:00 PM (10:00 to 11:59)
        const isTenToTwelve = currentHour >= 10 && currentHour < 12;
        let theme = "dark";
        if (southIndia && isTenToTwelve) theme = "light";

        // 2. FIND OR CREATE USER
        console.log(`[AUTH]: Finding/Creating user for email: ${email}`);
        let existingUser = await users.findOne({ email });
        if (!existingUser) {
            console.log(`[AUTH]: Creating new user: ${name || 'Unknown'}`);
            existingUser = await users.create({
                email,
                name,
                image,
                phone,
                state,
                themePreference: theme,
                joinedon: new Date()
            });
        } else {
            console.log(`[AUTH]: Existing user found: ${existingUser.name}`);
            // Update latest state and theme per login rule
            existingUser.state = state;
            existingUser.themePreference = theme;
        }

        // 3. GENERATE & HASH OTP
        const otp = generateOTP();
        console.log(`[AUTH]: Generated OTP for ${email}: ${otp}`);
        const hashedOtp = await hashOTP(otp);

        existingUser.otpHash = hashedOtp;
        existingUser.otpExpiry = new Date(Date.now() + 5 * 60000); // 5 mins
        existingUser.otpAttempts = 0;

        // 4. SEND OTP BASED ON SIGN-IN METHOD
        console.log(`[AUTH]: Attempting to send OTP to ${email || phone}`);
        if (email) {
            existingUser.authMethod = "email";
            console.log(`[AUTH]: Calling sendOTPEmail...`);
            await sendOTPEmail(email, otp);
            console.log(`[AUTH]: sendOTPEmail finished.`);
        } else {
            existingUser.authMethod = "sms";
            const targetPhone = phone || existingUser.phone || "MOCKED_PHONE";
            await sendSMSOTP(targetPhone, otp);
            console.log(`[AUTH]: Sent SMS OTP to ${targetPhone}`);
        }
        await existingUser.save();
        console.log(`[AUTH]: User saved successfully.`);

        return res.status(200).json({
            success: true,
            message: `OTP sent via ${existingUser.authMethod}`,
            userId: existingUser._id,
            theme: theme,
            authMethod: existingUser.authMethod,
            state: state,
            isDevMode: true, // For debugging/test visibility
            mockOTP: process.env.NODE_ENV === "development" ? otp : undefined
        });

    } catch (error) {
        console.error("Login Step 1 error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// STEP 2: VERIFY OTP
export const verifyOTP = async (req, res) => {
    const { userId, otp } = req.body;

    try {
        const user = await users.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Security guards
        if (user.otpAttempts >= 3) return res.status(403).json({ message: "Max attempts reached. Request a new OTP." });
        if (new Date() > user.otpExpiry) return res.status(403).json({ message: "OTP expired." });

        const isMatch = await verifyHashedOTP(otp, user.otpHash);

        if (!isMatch) {
            user.otpAttempts += 1;
            await user.save();
            return res.status(400).json({ message: `Invalid OTP. Attempts: ${user.otpAttempts}/3` });
        }

        // Success: Clear OTP, Generate JWT
        user.otpHash = undefined;
        user.otpExpiry = undefined;
        user.otpAttempts = 0;
        await user.save();

        const token = jwt.sign({ email: user.email, id: user._id }, "testSecret", { expiresIn: "7d" });

        return res.status(200).json({
            success: true,
            result: user,
            token,
            theme: user.themePreference
        });

    } catch (error) {
        console.error("OTP Verification error:", error);
        return res.status(500).json({ message: "Verification failed." });
    }
};
export const updateprofile = async (req, res) => {
    const { id: _id } = req.params;
    const { channelname, description } = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(500).json({ message: "User unavailable..." });
    }
    try {
        const updatedata = await users.findByIdAndUpdate(
            _id,
            {
                $set: {
                    channelname: channelname,
                    description: description,
                },
            },
            { new: true }
        );
        return res.status(201).json(updatedata);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};