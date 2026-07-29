import brevoClient from "../../config/brevo.js";
import { env } from "../../config/env.js";
import logger from "../../config/logger.js";
import AppError from "../../utils/AppError.js";

export { verifyEmailTemplate } from "./templates/verifyEmail.js";
export { forgotPasswordTemplate } from "./templates/forgotPassword.js";
export { welcomeTemplate } from "./templates/welcome.js";

export const sendEmail = async ({ to, subject, html, text }) => {
    if (!to || typeof to !== "string") {
        throw new AppError("Recipient email ('to') is required", 400);
    }
    if (!subject || typeof subject !== "string") {
        throw new AppError("Email 'subject' is required", 400);
    }
    if (!html && !text) {
        throw new AppError("Email body ('html' or 'text') is required", 400);
    }

    const payload = {
        sender: {
            email: env.MAIL_FROM,
            name: env.MAIL_FROM_NAME,
        },
        to: [
            {
                email: to.trim(),
            },
        ],
        subject: subject.trim(),
        ...(html ? { htmlContent: html } : {}),
        ...(text ? { textContent: text } : {}),
    };

    try {
        const response = await brevoClient.transactionalEmails.sendTransacEmail(payload);

        const messageId = response?.messageId || response?.body?.messageId || "N/A";

        logger.info(
            { messageId, to, subject },
            "Email sent successfully via Brevo Transactional Email API"
        );

        return response;
    } catch (error) {
        const statusCode = error?.status || error?.statusCode || 500;
        const brevoMessage = error?.body?.message || error?.message || "Unknown Brevo API error";
        const requestId = error?.headers?.["x-request-id"] || error?.requestId || "N/A";

        logger.error(
            {
                err: error,
                statusCode,
                brevoMessage,
                requestId,
                to,
                subject,
            },
            "Brevo Transactional Email API send failed"
        );

        throw new AppError(
            `Failed to send email: ${brevoMessage}`,
            statusCode >= 400 && statusCode < 600 ? statusCode : 500
        );
    }
};
