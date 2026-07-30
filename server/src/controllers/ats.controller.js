import AtsMatch from "../models/atsMatch.model.js";
import Resume from "../models/resume.model.js";
import AppError from "../utils/AppError.js";
import { analyzeAtsKeywordsWithAi } from "../services/ai/atsMatcher.service.js";
import { deductCredits, refundCredits } from "../services/creditLedger.service.js";
import { CREDIT_COSTS } from "../config/creditCosts.js";

export const runAtsMatch = async (req, res) => {
    const { id: resumeId } = req.params;
    const { jobDescription: customJd } = req.body;

    const resume = await Resume.findOne({
        _id: resumeId,
        userId: req.user._id,
    });

    if (!resume) {
        throw new AppError("Resume not found", 404);
    }

    // Atomic Credit Deduction before AI Processing
    await deductCredits({
        userId: req.user._id,
        amount: CREDIT_COSTS.ATS_KEYWORD_MATCHER,
        type: "ai_usage",
        action: "ATS Matcher",
        reason: `ATS Keyword Matcher for "${resume.originalName}"`,
        referenceId: resume._id.toString(),
    });

    const effectiveJd = customJd || resume.jobDescription || "";

    try {
        const result = await analyzeAtsKeywordsWithAi({
            resumeText: resume.extractedText || "",
            targetRole: resume.targetRole,
            jobDescription: effectiveJd,
        });

        const atsMatch = await AtsMatch.findOneAndUpdate(
            {
                resumeId: resume._id,
                userId: req.user._id,
            },
            {
                $set: {
                    coveragePercentage: result.coveragePercentage,
                    summary: result.summary,
                    categorizedSkills: result.categorizedSkills,
                },
            },
            {
                returnDocument: "after",
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );

        return res.status(200).json({
            success: true,
            message: "ATS keyword analysis completed",
            atsMatch,
        });
    } catch (error) {
        // Automatic refund on failure
        try {
            await refundCredits({
                userId: req.user._id,
                amount: CREDIT_COSTS.ATS_KEYWORD_MATCHER,
                action: "ATS Matcher Failure Refund",
                reason: `Automatic refund for failed ATS Matcher (${error.message})`,
                referenceId: resume._id.toString(),
            });
        } catch (refundErr) {
            console.error("Failed to refund credits:", refundErr);
        }
        throw error;
    }
};

export const getAtsMatch = async (req, res) => {
    const { id: resumeId } = req.params;

    const resume = await Resume.findOne({
        _id: resumeId,
        userId: req.user._id,
    });

    if (!resume) {
        throw new AppError("Resume not found", 404);
    }

    const atsMatch = await AtsMatch.findOne({
        resumeId: resume._id,
        userId: req.user._id,
    });

    if (!atsMatch) {
        throw new AppError("ATS keyword analysis not found for this resume", 404);
    }

    return res.status(200).json({
        success: true,
        atsMatch,
    });
};
