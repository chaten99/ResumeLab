import crypto from "crypto";
import { env } from "../config/env.js";

export const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

export const hashOtp = (otp) => {
    return crypto
    .createHmac("sha256", env.OTP_SECRET)
    .update(otp)
    .digest("hex");
};

export const verifyOtp = (otp, storedHash) => {
    const incomingHash = hashOtp(otp);
    const incomingBuffer = Buffer.from(incomingHash, "hex");
    const storedBuffer = Buffer.from(storedHash, "hex");

    if(incomingBuffer.length !== storedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(incomingBuffer, storedBuffer);
}