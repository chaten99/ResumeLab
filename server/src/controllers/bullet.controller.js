import BulletImprovement from "../models/bulletImprovement.model.js";
import Resume from "../models/resume.model.js";
import AppError from "../utils/AppError.js";
import { improveBulletWithAi } from "../services/ai/bulletImprover.service.js";

export const improveBullet = async (req, res) => {
    const { id: resumeId } = req.params;
    const { originalBullet, targetRole: customRole, jobDescription: customJd } = req.body;

    const resume = await Resume.findOne({
        _id: resumeId,
        userId: req.user._id,
    });

    if (!resume) {
        throw new AppError("Resume not found", 404);
    }

    const effectiveRole = customRole || resume.targetRole;
    const effectiveJd = customJd || resume.jobDescription || "";

    const { critique, suggestions } = await improveBulletWithAi({
        originalBullet,
        targetRole: effectiveRole,
        jobDescription: effectiveJd,
    });

    const bulletRecord = await BulletImprovement.create({
        userId: req.user._id,
        resumeId: resume._id,
        originalBullet,
        targetRole: effectiveRole,
        jobDescription: effectiveJd,
        critique,
        suggestions,
        status: "pending",
        history: [{ suggestions }],
    });

    return res.status(201).json({
        success: true,
        message: "Bullet improvement generated",
        bullet: bulletRecord,
    });
};

export const getBulletHistory = async (req, res) => {
    const { id: resumeId } = req.params;

    const resume = await Resume.findOne({
        _id: resumeId,
        userId: req.user._id,
    });

    if (!resume) {
        throw new AppError("Resume not found", 404);
    }

    const history = await BulletImprovement.find({
        resumeId: resume._id,
        userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        count: history.length,
        bullets: history,
    });
};

export const updateBulletStatus = async (req, res) => {
    const { id: resumeId, bulletId } = req.params;
    const { status, selectedSuggestion } = req.body;

    const bullet = await BulletImprovement.findOne({
        _id: bulletId,
        resumeId,
        userId: req.user._id,
    });

    if (!bullet) {
        throw new AppError("Bullet record not found", 404);
    }

    bullet.status = status;
    if (selectedSuggestion !== undefined) {
        bullet.selectedSuggestion = selectedSuggestion;
    }

    await bullet.save();

    return res.status(200).json({
        success: true,
        message: `Bullet marked as ${status}`,
        bullet,
    });
};

export const regenerateBullet = async (req, res) => {
    const { id: resumeId, bulletId } = req.params;

    const bullet = await BulletImprovement.findOne({
        _id: bulletId,
        resumeId,
        userId: req.user._id,
    });

    if (!bullet) {
        throw new AppError("Bullet record not found", 404);
    }

    const { critique, suggestions } = await improveBulletWithAi({
        originalBullet: bullet.originalBullet,
        targetRole: bullet.targetRole,
        jobDescription: bullet.jobDescription,
    });

    bullet.critique = critique;
    bullet.suggestions = suggestions;
    bullet.status = "pending";
    bullet.history.push({ suggestions });

    await bullet.save();

    return res.status(200).json({
        success: true,
        message: "Bullet suggestions regenerated",
        bullet,
    });
};
