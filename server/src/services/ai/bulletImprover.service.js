import gemini from "../../config/gemini.js";
import { env } from "../../config/env.js";
import logger from "../../config/logger.js";
import AppError from "../../utils/AppError.js";

export const improveBulletWithAi = async ({
    originalBullet,
    targetRole,
    jobDescription,
}) => {
    const todayStr = new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const prompt = `
You are an expert resume editor and technical recruiter specializing in refining high-impact resume bullet points.

CURRENT EVALUATION TIMEFRAME:
Today's date is ${todayStr}. All dates in 2024, 2025, and 2026 are present/past dates, NOT future dates.

TARGET ROLE:
${targetRole}

JOB DESCRIPTION:
${jobDescription || "No job description provided."}

ORIGINAL BULLET POINT TO IMPROVE:
"${originalBullet}"

STRICT ANTI-HALLUCINATION RULES:
- NEVER invent achievements, metrics, numbers, percentage gains, dollar values, or team sizes that do not exist in the original bullet.
- NEVER fabricate companies, tools, frameworks, or responsibilities.
- Focus ONLY on improving sentence structure, active voice, punchy action verbs, clarity, conciseness, and alignment with the target role.
- If the original bullet lacks quantifiable metrics, improve the wording without inventing fake numbers.
- Provide 3 distinct improved variations (e.g., Action-focused, Concise, Executive-phrased).

Return a single JSON object with this exact structure:
{
  "critique": "Brief, sharp critique of why the original bullet needed improvement",
  "suggestions": [
    "Improved version option 1",
    "Improved version option 2",
    "Improved version option 3"
  ]
}
`;

    try {
        const response = await gemini.models.generateContent({
            model: env.GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const text = response.text;
        const parsed = JSON.parse(text);

        if (!parsed.suggestions || !Array.isArray(parsed.suggestions) || parsed.suggestions.length === 0) {
            throw new Error("Invalid AI bullet improver output structure");
        }

        return {
            critique: parsed.critique || "Bullet phrasing improved for clarity and role impact.",
            suggestions: parsed.suggestions.slice(0, 3),
        };
    } catch (error) {
        logger.error(
            {
                err: error,
                message: error.message,
            },
            "Gemini Bullet Improver generation failed"
        );

        throw new AppError("Failed to generate bullet improvements", 502);
    }
};
