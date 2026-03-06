export const sendSMSOTP = async (phone, otp) => {
    try {
        console.log(`[MOCK SMS SERVICE]: Sending OTP ${otp} to phone ${phone}`);
        // For production, integrate Twilio here
        // const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
        // await client.messages.create({ body: `Your YourTube OTP is ${otp}`, from: '+1...', to: phone });

        return { success: true, message: "OTP sent via SMS (Mocked)" };
    } catch (error) {
        console.error("SMS Service Error:", error);
        return { success: false, message: error.message };
    }
};
