import otpGenerator from "otp-generator";
import bcrypt from "bcryptjs";

export const generateOTP = () => {
    return otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });
};

export const hashOTP = async (otp) => {
    return await bcrypt.hash(otp, 10);
};

export const verifyHashedOTP = async (otp, hashedOtp) => {
    return await bcrypt.compare(otp, hashedOtp);
};
