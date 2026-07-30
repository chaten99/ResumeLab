import {
    sendVerificationEmail,
    sendPasswordResetEmail,
} from "./email.service.js";

export const sendVerificationOtpEmail = async ({
    email,
    name,
    otp,
    expiresIn,
}) => {
    return sendVerificationEmail({
        email,
        name,
        otp,
        expiresIn,
    });
};

export const sendPasswordResetOtpEmail = async ({
    email,
    name,
    otp,
    expiresIn,
}) => {
    return sendPasswordResetEmail({
        email,
        name,
        otp,
        expiresIn,
    });
};
