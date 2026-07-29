import AtsMatch from "../models/atsMatch.model.js";
import Resume from "../models/resume.model.js";
import AppError from "../utils/AppError.js";
import { analyzeAtsKeywordsWithAi } from "../services/ai/atsMatcher.service.js";

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

    const effectiveJd = customJd || resume.jobDescription || "";

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
