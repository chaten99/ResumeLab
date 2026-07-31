import Resume from "../models/resume.model.js";
import Analysis from "../models/analysis.model.js";
import AppError from "../utils/AppError.js";
import { parseResumePdf } from "../services/resumeParser.service.js";
import { recordActivity } from "../services/activity.service.js";
import { createInAppNotification } from "../services/notification.service.js";
import { emitToUser } from "../config/socket.js";

export const uploadResume = async (req, res) => {
    if (!req.file) {
        throw new AppError("No file uploaded", 400);
    }
    const { targetRole, jobDescription } = req.body;
    const { text, pageCount } = await parseResumePdf(req.file.buffer);

    const resume = await Resume.create({
        userId: req.user._id,
        originalName: req.file.originalname,
        targetRole,
        jobDescription,
        extractedText: text,
        pageCount,
        status: "parsed",
    });

    await recordActivity({
        userId: req.user._id,
        type: "resume_uploaded",
        description: `Uploaded resume "${resume.originalName}" (${targetRole || "General"})`,
        metadata: { resumeId: resume._id },
    });

    await createInAppNotification({
        userId: req.user._id,
        title: "Resume Uploaded",
        message: `Successfully uploaded and parsed "${resume.originalName}".`,
        type: "info",
    });

    emitToUser(req.user._id, "resume:uploaded", { resume });

    return res.status(201).json({
        success: true,
        message: "Resume uploaded and parsed successfully",
        resume: {
            id: resume._id,
            originalName: resume.originalName,
            targetRole: resume.targetRole,
            jobDescription: resume.jobDescription,
            pageCount: resume.pageCount,
            status: resume.status,
            createdAt: resume.createdAt,
        },
    });
};

export const getResumes = async (req, res) => {
    const resumes = await Resume.find({
        userId: req.user._id,
    })
        .select("-extractedText -jobDescription")
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        count: resumes.length,
        resumes,
    });
};

export const getResumeById = async (req, res) => {
    const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user._id,
    }).lean();

    if (!resume) {
        throw new AppError("Resume not found", 404);
    }

    return res.status(200).json({
        success: true,
        resume,
    });
};

export const deleteResume = async (req, res) => {
    const resume = await Resume.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id,
    });

    if (!resume) {
        throw new AppError("Resume not found", 404);
    }

    await Analysis.deleteMany({
        resumeId: req.params.id,
        userId: req.user._id,
    });

    await recordActivity({
        userId: req.user._id,
        type: "resume_deleted",
        description: `Deleted resume "${resume.originalName}"`,
        metadata: { resumeId: resume._id },
    });

    await createInAppNotification({
        userId: req.user._id,
        title: "Resume Deleted",
        message: `Deleted resume "${resume.originalName}".`,
        type: "warning",
    });

    emitToUser(req.user._id, "resume:deleted", { resumeId: resume._id });

    return res.status(200).json({
        success: true,
        message: "Resume deleted successfully",
    });
};