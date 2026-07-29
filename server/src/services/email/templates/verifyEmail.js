export const verifyEmailTemplate = ({ name, otp, expiresIn = "10 minutes" }) => {
    const subject = "Verify your ResumeLab email";

    const text = `
Hi ${name || "User"},

Your ResumeLab verification code is:

${otp}

This code will expire in ${expiresIn}.

If you didn't create a ResumeLab account, you can safely ignore this email.

ResumeLab Team
    `.trim();

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px; color: #171717; background-color: #ffffff;">
            <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 24px; color: #000000; letter-spacing: -0.5px;">
                ResumeLab
            </h1>
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 12px;">
                Verify your email address
            </h2>
            <p style="line-height: 1.6; font-size: 15px; color: #404040;">
                Hi ${name || "there"},
            </p>
            <p style="line-height: 1.6; font-size: 15px; color: #404040;">
                Use the following verification code to verify your ResumeLab account:
            </p>
            <div style="margin: 28px 0; padding: 20px; background-color: #f5f5f7; border-radius: 10px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827; border: 1px solid #e5e7eb;">
                ${otp}
            </div>
            <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                This code will expire in <strong>${expiresIn}</strong>.
                If you didn't create a ResumeLab account, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 32px 0 20px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                &copy; ${new Date().getFullYear()} ResumeLab. All rights reserved.
            </p>
        </div>
    `;

    return { subject, html, text };
};
