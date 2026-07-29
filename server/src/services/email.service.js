import transporter from "../config/mail.js";
import { env } from "../config/env.js";

export const sendEmail = async ({
    to,
    subject,
    text,
    html,
}) => {
    return transporter.sendMail({
        from: env.MAIL_FROM,
        to,
        subject,
        text,
        html,
    });
};
