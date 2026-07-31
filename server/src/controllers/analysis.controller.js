import Analysis from "../models/analysis.model.js";
import Resume from "../models/resume.model.js";
import AppError from "../utils/AppError.js";
import { runResumeAnalysis } from "../services/analysis.service.js";
import { emitToUser } from "../config/socket.js";
import { deductCredits, refundCredits } from "../services/creditLedger.service.js";
import { CREDIT_COSTS } from "../config/creditCosts.js";

export const analyzeResume = async (req, res) => {
    const { id: resumeId } = req.params;

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
        amount: CREDIT_COSTS.RESUME_ANALYSIS,
        type: "ai_usage",
        action: "Resume Analysis",
        reason: `Resume Analysis for "${resume.originalName}"`,
        referenceId: resume._id.toString(),
    });

    const analysis = await Analysis.findOneAndUpdate(
        {
            resumeId: resume._id,
            userId: req.user._id,
        },
        {
            $set: {
                status: "processing",
                errorMessage: null,
            },
        },
        {
            returnDocument: "after",
            upsert: true,
            setDefaultsOnInsert: true,
        }
    );

    resume.status = "analyzing";
    await resume.save();

    emitToUser(req.user._id, "analysis:started", {
        resumeId: resume._id,
    });

    try {
        const result = await runResumeAnalysis(resume);

        const currentResume = await Resume.findById(resume._id);
        const currentAnalysis = await Analysis.findById(analysis._id);

        if (!currentResume || !currentAnalysis) {
            return res.status(200).json({
                success: false,
                message: "Analysis target document was deleted before completion",
            });
        }

        currentAnalysis.metrics = result.metrics;
        currentAnalysis.scores = result.scores;
        currentAnalysis.issues = result.issues;
        currentAnalysis.aiAnalysis = result.ai;

        currentAnalysis.recruiterPerspective = result.recruiterPerspective;
        currentAnalysis.atsFormatting = result.atsFormatting;
        currentAnalysis.grammarWriting = result.grammarWriting;
        currentAnalysis.achievementImpact = result.achievementImpact;
        currentAnalysis.experienceAnalysis = result.experienceAnalysis;
        currentAnalysis.projectAnalysis = result.projectAnalysis;

        currentAnalysis.status = "completed";
        currentAnalysis.errorMessage = null;
        await currentAnalysis.save();

        currentResume.status = "completed";
        await currentResume.save();

        emitToUser(req.user._id, "analysis:completed", {
            resumeId: currentResume._id,
            analysis: currentAnalysis,
        });

        emitToUser(req.user._id, "notification:created", {
            title: "Analysis Completed",
            message: `AI Analysis completed for "${currentResume.originalName}"`,
            type: "success",
        });

        return res.status(200).json({
            success: true,
            message: "Resume analyzed successfully",
            analysis: currentAnalysis,
        });
    } catch (error) {
        // Automatic refund on AI failure
        try {
            await refundCredits({
                userId: req.user._id,
                amount: CREDIT_COSTS.RESUME_ANALYSIS,
                action: "AI Analysis Failure Refund",
                reason: `Automatic refund for failed Resume Analysis (${error.message})`,
                referenceId: resume._id.toString(),
            });
        } catch (refundErr) {
            console.error("Failed to refund credits:", refundErr);
        }

        const currentResume = await Resume.findById(resume._id);
        const currentAnalysis = await Analysis.findById(analysis._id);

        if (currentAnalysis && currentResume) {
            currentAnalysis.status = "failed";
            currentAnalysis.errorMessage = error.message || "Resume analysis failed";
            await currentAnalysis.save();

            currentResume.status = "failed";
            await currentResume.save();

            emitToUser(req.user._id, "analysis:failed", {
                resumeId: currentResume._id,
                errorMessage: currentAnalysis.errorMessage,
            });

            emitToUser(req.user._id, "notification:created", {
                title: "Analysis Failed",
                message: `Analysis failed for "${currentResume.originalName}". Credits refunded.`,
                type: "error",
            });
        }

        throw error;
    }
};

export const getResumeAnalysis = async (req, res) => {
    const { id: resumeId } = req.params;

    const resume = await Resume.findOne({
        _id: resumeId,
        userId: req.user._id,
    });

    if (!resume) {
        throw new AppError("Resume not found", 404);
    }

    const analysis = await Analysis.findOne({
        resumeId: resume._id,
        userId: req.user._id,
    });

    if (!analysis) {
        throw new AppError("Analysis not found for this resume", 404);
    }

    return res.status(200).json({
        success: true,
        analysis,
    });
};