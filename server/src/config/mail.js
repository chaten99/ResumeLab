import nodemailer from "nodemailer";
import { env } from "./env.js";

const transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: false,
    ...env.MAIL_USER && env.MAIL_PASSWORD ? {
        auth: {
            user: env.MAIL_USER,
            pass: env.MAIL_PASSWORD
        }
    } : {},
});

export default transporter;
