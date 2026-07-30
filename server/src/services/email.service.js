import { Resend } from "resend";
import { env } from "../config/env.js";
import logger from "../config/logger.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export const sendEmail = async ({ to, subject, html, text }) => {
    if (!resend) {
        logger.warn({ to, subject }, "RESEND_API_KEY is missing. Email skipped.");
        return { id: "mock-id-no-api-key" };
    }

    try {
        const data = await resend.emails.send({
            from: env.EMAIL_FROM,
            to,
            subject,
            html,
            text,
        });

        logger.info({ to, subject, emailId: data?.id }, "Email sent successfully via Resend");
        return data;
    } catch (error) {
        logger.error({ err: error, to, subject }, "Failed to send email via Resend");
        throw error;
    }
};

export const sendVerificationEmail = async ({ email, name, otp, expiresIn = "10 minutes" }) => {
    const subject = "Verify your ResumeLab email";
    const verificationUrl = `${env.CLIENT_URL}/verify-email`;

    const text = `Hi ${name},\n\nYour ResumeLab verification code is: ${otp}\n\nThis code will expire in ${expiresIn}.\n\nVerify online: ${verificationUrl}\n\nIf you didn't create a ResumeLab account, please ignore this email.\n\nResumeLab Team`.trim();

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 32px 32px 24px; text-align: left; border-bottom:1px solid #f1f5f9;">
                                    <span style="font-size:22px; font-weight:700; color:#0f172a; letter-spacing:-0.5px;">Resume<span style="color:#2563eb;">Lab</span></span>
                                </td>
                            </tr>
                            <!-- Body -->
                            <tr>
                                <td style="padding: 32px; text-align: left;">
                                    <h1 style="margin:0 0 16px; font-size:20px; font-weight:600; color:#0f172a;">Verify your email address</h1>
                                    <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#475569;">
                                        Hi <strong>${name}</strong>,<br>
                                        Use the verification code below to verify your ResumeLab account:
                                    </p>
                                    
                                    <!-- OTP Code Box -->
                                    <div style="margin: 0 0 28px; padding: 20px; background-color:#f1f5f9; border-radius:8px; text-align:center; font-family:'Courier New', monospace; font-size:32px; font-weight:700; letter-spacing:10px; color:#0f172a;">
                                        ${otp}
                                    </div>

                                    <div style="text-align:center; margin-bottom: 28px;">
                                        <a href="${verificationUrl}" target="_blank" style="display:inline-block; padding: 12px 28px; background-color:#2563eb; color:#ffffff; font-size:14px; font-weight:600; text-decoration:none; border-radius:6px;">Verify Email</a>
                                    </div>

                                    <p style="margin:0 0 8px; font-size:13px; color:#64748b; line-height:1.5;">
                                        This verification code will expire in <strong>${expiresIn}</strong>.
                                    </p>
                                    <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.5;">
                                        Or copy this link to your browser: <a href="${verificationUrl}" style="color:#2563eb; text-decoration:underline;">${verificationUrl}</a>
                                    </p>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 20px 32px; background-color:#f8fafc; text-align: center; border-top:1px solid #f1f5f9;">
                                    <p style="margin:0; font-size:12px; color:#94a3b8;">
                                        &copy; ${new Date().getFullYear()} ResumeLab. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `.trim();

    return sendEmail({ to: email, subject, html, text });
};

export const sendPasswordResetEmail = async ({ email, name, otp, expiresIn = "10 minutes" }) => {
    const subject = "Reset your ResumeLab password";
    const resetUrl = `${env.CLIENT_URL}/reset-password`;

    const text = `Hi ${name},\n\nWe received a request to reset your ResumeLab password.\n\nYour password reset code is: ${otp}\n\nThis code will expire in ${expiresIn}.\n\nReset online: ${resetUrl}\n\nIf you didn't request a password reset, you can safely ignore this email.\n\nResumeLab Team`.trim();

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 32px 32px 24px; text-align: left; border-bottom:1px solid #f1f5f9;">
                                    <span style="font-size:22px; font-weight:700; color:#0f172a; letter-spacing:-0.5px;">Resume<span style="color:#2563eb;">Lab</span></span>
                                </td>
                            </tr>
                            <!-- Body -->
                            <tr>
                                <td style="padding: 32px; text-align: left;">
                                    <h1 style="margin:0 0 16px; font-size:20px; font-weight:600; color:#0f172a;">Reset your password</h1>
                                    <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#475569;">
                                        Hi <strong>${name}</strong>,<br>
                                        We received a request to reset your password. Use the code below to reset your password:
                                    </p>
                                    
                                    <!-- OTP Code Box -->
                                    <div style="margin: 0 0 28px; padding: 20px; background-color:#f1f5f9; border-radius:8px; text-align:center; font-family:'Courier New', monospace; font-size:32px; font-weight:700; letter-spacing:10px; color:#0f172a;">
                                        ${otp}
                                    </div>

                                    <div style="text-align:center; margin-bottom: 28px;">
                                        <a href="${resetUrl}" target="_blank" style="display:inline-block; padding: 12px 28px; background-color:#2563eb; color:#ffffff; font-size:14px; font-weight:600; text-decoration:none; border-radius:6px;">Reset Password</a>
                                    </div>

                                    <p style="margin:0 0 8px; font-size:13px; color:#64748b; line-height:1.5;">
                                        This reset code will expire in <strong>${expiresIn}</strong>.
                                    </p>
                                    <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.5;">
                                        If you did not request this, you can safely ignore this email.
                                    </p>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 20px 32px; background-color:#f8fafc; text-align: center; border-top:1px solid #f1f5f9;">
                                    <p style="margin:0; font-size:12px; color:#94a3b8;">
                                        &copy; ${new Date().getFullYear()} ResumeLab. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `.trim();

    return sendEmail({ to: email, subject, html, text });
};
