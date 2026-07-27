import { sendEmail } from "./email.service.js";

export const sendVerificationOtpEmail = async ({
    email,
    name,
    otp,
    expiresIn,
}) => {
    const subject = "Verify your ResumeLab email";

    const text = `
Hi ${name},

Your ResumeLab verification code is:

${otp}

This code will expire shortly.

If you didn't create a ResumeLab account, you can ignore this email.

ResumeLab
    `.trim();

    const html = `
        <div style="
            font-family: Arial, sans-serif;
            max-width: 560px;
            margin: 0 auto;
            padding: 32px 20px;
            color: #171717;
        ">
            <h1 style="
                font-size: 24px;
                margin-bottom: 24px;
            ">
                ResumeLab
            </h1>

            <h2 style="
                font-size: 20px;
                margin-bottom: 12px;
            ">
                Verify your email
            </h2>

            <p style="line-height: 1.6;">
                Hi ${name},
            </p>

            <p style="line-height: 1.6;">
                Use the following verification code to verify
                your ResumeLab account:
            </p>

            <div style="
                margin: 28px 0;
                padding: 18px;
                background: #f5f5f5;
                border-radius: 8px;
                text-align: center;
                font-size: 32px;
                font-weight: 700;
                letter-spacing: 8px;
            ">
                ${otp}
            </div>

            <p style="
                font-size: 14px;
                color: #666;
                line-height: 1.6;
            ">
                This code will expire shortly.
                If you didn't create a ResumeLab account,
                you can safely ignore this email.
            </p>
        </div>
    `;

    await sendEmail({
        to: email,
        subject,
        text,
        html,
    });
};

export const sendPasswordResetOtpEmail = async ({
    email,
    name,
    otp,
    expiresIn,
}) => {
    const subject = "Reset your ResumeLab password";

    const text = `
Hi ${name},

We received a request to reset your ResumeLab password.

Your password reset code is:

${otp}

This code will expire in ${expiresIn}.

If you didn't request a password reset, you can safely ignore this email.

ResumeLab
    `.trim();

    const html = `
        <div style="
            font-family: Arial, sans-serif;
            max-width: 560px;
            margin: 0 auto;
            padding: 32px 20px;
            color: #171717;
        ">
            <h1 style="font-size: 24px; margin-bottom: 24px;">
                ResumeLab
            </h1>

            <h2 style="font-size: 20px; margin-bottom: 12px;">
                Reset your password
            </h2>

            <p style="line-height: 1.6;">
                Hi ${name},
            </p>

            <p style="line-height: 1.6;">
                We received a request to reset your ResumeLab password.
                Use the code below to continue.
            </p>

            <div style="
                margin: 28px 0;
                padding: 18px;
                background: #f5f5f5;
                border-radius: 8px;
                text-align: center;
                font-size: 32px;
                font-weight: 700;
                letter-spacing: 8px;
            ">
                ${otp}
            </div>

            <p style="
                font-size: 14px;
                color: #666;
                line-height: 1.6;
            ">
                This code will expire in
                <strong>${expiresIn}</strong>.
            </p>

            <p style="
                font-size: 14px;
                color: #666;
                line-height: 1.6;
            ">
                If you didn't request this password reset,
                you can safely ignore this email.
            </p>
        </div>
    `;

    await sendEmail({
        to: email,
        subject,
        text,
        html,
    });
};