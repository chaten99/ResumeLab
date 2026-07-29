export const welcomeTemplate = ({ name }) => {
    const subject = "Welcome to ResumeLab!";

    const text = `
Hi ${name || "User"},

Welcome to ResumeLab! We're excited to help you optimize your resume, beat ATS screeners, and land more interviews.

Start by uploading your resume or creating your target role profile.

ResumeLab Team
    `.trim();

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px; color: #171717; background-color: #ffffff;">
            <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 24px; color: #000000; letter-spacing: -0.5px;">
                ResumeLab
            </h1>
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 12px;">
                Welcome aboard, ${name || "User"}!
            </h2>
            <p style="line-height: 1.6; font-size: 15px; color: #404040;">
                Your account is now verified and ready. ResumeLab brings AI-powered ATS keyword matching, recruiter-perspective analysis, and bullet improvers directly to your job application workflow.
            </p>
            <p style="line-height: 1.6; font-size: 15px; color: #404040; margin-top: 16px;">
                Upload your first resume to get instant, actionable feedback.
            </p>
            <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 32px 0 20px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                &copy; ${new Date().getFullYear()} ResumeLab. All rights reserved.
            </p>
        </div>
    `;

    return { subject, html, text };
};
