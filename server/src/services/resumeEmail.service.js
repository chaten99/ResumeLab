import { Resend } from "resend";
import { env } from "../config/env.js";
import logger from "../config/logger.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export const sendResumeIntroEmail = async ({
  email,
  name,
  fileName,
  status,
  failureReason,
  uploadedAt,
}) => {
  if (!resend) {
    logger.info({ email, status, fileName }, "RESEND_API_KEY is missing. Email skipped.");
    return;
  }

  const isSuccess = status === "COMPLETED";
  const subject = isSuccess
    ? "Your Resume Introduction has been uploaded successfully."
    : "Upload Failed.";
  const formattedDate = new Date(uploadedAt || Date.now()).toLocaleString();
  const builderUrl = `${env.CLIENT_URL}/resumes/builder`;

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
                        <tr>
                            <td style="padding: 32px 32px 24px; text-align: left; border-bottom:1px solid #f1f5f9;">
                                <span style="font-size:22px; font-weight:700; color:#0f172a; letter-spacing:-0.5px;">Resume<span style="color:#2563eb;">Lab</span></span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 32px; text-align: left;">
                                <h1 style="margin:0 0 16px; font-size:20px; font-weight:600; color:#0f172a;">
                                    ${isSuccess ? "Introduction Upload Complete" : "Upload Encountered an Issue"}
                                </h1>
                                <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#475569;">
                                    Hi <strong>${name || "there"}</strong>,<br>
                                    ${
                                      isSuccess
                                        ? "Your self-introduction media has been processed and is ready inside your Resume Builder workspace."
                                        : "We ran into an issue while processing your uploaded self-introduction."
                                    }
                                </p>
                                
                                <div style="margin: 0 0 28px; padding: 20px; background-color:${isSuccess ? "#f0fdf4" : "#fef2f2"}; border: 1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}; border-radius:8px; text-align:left;">
                                    <p style="margin:0 0 8px; font-size:14px; font-weight:600; color:${isSuccess ? "#166534" : "#991b1b"};">
                                        Status: ${isSuccess ? "Successful" : "Failed"}
                                    </p>
                                    <p style="margin:0 0 4px; font-size:13px; color:#475569;">
                                        <strong>File Name:</strong> ${fileName}
                                    </p>
                                    <p style="margin:0; font-size:13px; color:#475569;">
                                        <strong>Timestamp:</strong> ${formattedDate}
                                    </p>
                                    ${failureReason ? `<p style="margin:8px 0 0; font-size:13px; color:#991b1b;"><strong>Reason:</strong> ${failureReason}</p>` : ""}
                                </div>

                                <div style="text-align:center; margin-bottom: 28px;">
                                    <a href="${builderUrl}" target="_blank" style="display:inline-block; padding: 12px 28px; background-color:#2563eb; color:#ffffff; font-size:14px; font-weight:600; text-decoration:none; border-radius:6px;">
                                        Open Resume Builder
                                    </a>
                                </div>

                                <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.5;">
                                    If you have any questions, feel free to contact our support team.
                                </p>
                            </td>
                        </tr>
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

  try {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject,
      html,
    });
    logger.info({ email, status, fileName }, "Resume intro email sent successfully");
  } catch (err) {
    logger.error({ err: err.message, email }, "Failed to send resume intro email");
  }
};
