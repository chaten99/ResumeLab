import gemini from "../../config/gemini.js";
import { env } from "../../config/env.js";
import logger from "../../config/logger.js";
import AppError from "../../utils/AppError.js";
import { aiResumeAnalysisSchema } from "../../validators/resumeAnalysis.schema.js";
import { buildResumeAnalysisPrompt } from "./resumeAnalysis.prompt.js";

export const analyzeResumeWithAI = async ({
    resumeText,
    targetRole,
    jobDescription,
    metrics,
}) => {
    const prompt = buildResumeAnalysisPrompt({
        resumeText,
        targetRole,
        jobDescription,
        metrics,
    });

    let response;

    try {
        response = await gemini.models.generateContent({
            model: env.GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.2,
            },
        });
    } catch (error) {
        logger.error({ err: error }, "Gemini API call failed");
        throw new AppError("AI resume analysis failed", 502);
    }

    if (!response || !response.text) {
        logger.error("Gemini returned an empty response");
        throw new AppError("AI returned an empty response", 502);
    }

    let parsedResponse;

    try {
        parsedResponse = JSON.parse(response.text);
    } catch (parseError) {
        logger.error({ err: parseError, rawText: response.text }, "Failed to parse Gemini JSON response");
        throw new AppError("AI returned an invalid response", 502);
    }

    const validationResult = aiResumeAnalysisSchema.safeParse(parsedResponse);

    if (!validationResult.success) {
        logger.error({ err: validationResult.error }, "Gemini JSON response failed Zod schema validation");
        throw new AppError("AI response did not match the expected format", 502);
    }

    return validationResult.data;
};