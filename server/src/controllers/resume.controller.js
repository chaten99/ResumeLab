import Resume from "../models/resume.model.js";
import Analysis from "../models/analysis.model.js";
import AppError from "../utils/AppError.js";
import { parseResumePdf } from "../services/resumeParser.service.js";
import { recordActivity } from "../services/activity.service.js";
import { createInAppNotification } from "../services/notification.service.js";
import { emitToUser } from "../config/socket.js";
import { addResumeUploadJob } from "../queues/resume.queue.js";
import { deleteFileFromS3 } from "../services/s3.service.js";
import path from "path";

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

export const uploadResumeIntro = async (req, res) => {
    if (!req.file) {
        throw new AppError("Please select or record a valid video or audio introduction file", 400);
    }

    const userId = req.user._id;
    const { targetRole = "Full Stack Developer", originalName } = req.body;

    const ext = path.extname(req.file.originalname).toLowerCase();
    const isAudio = [".mp3", ".wav", ".m4a"].includes(ext) || req.file.mimetype.startsWith("audio/");
    const resourceType = isAudio ? "audio" : "video";

    const resume = await Resume.create({
        userId,
        originalName: originalName || req.file.originalname,
        targetRole,
        currentStep: 1,
        uploadStatus: "QUEUED",
        processingStatus: "QUEUED",
        media: {
            type: resourceType,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            status: "QUEUED",
        },
    });

    emitToUser(userId, "resume:queued", {
        resumeId: resume._id.toString(),
        status: "QUEUED",
        progress: 5,
    });

    const job = await addResumeUploadJob({
        resumeId: resume._id.toString(),
        userId: userId.toString(),
        filePath: req.file.path,
        originalFileName: req.file.originalname,
        resourceType,
        mimeType: req.file.mimetype,
        size: req.file.size,
    });

    if (job) {
        resume.jobId = job.id?.toString() || null;
        await resume.save();
    }

    return res.status(202).json({
        success: true,
        message: "Resume introduction queued for processing",
        resumeId: resume._id,
        status: "queued",
        resume,
    });
};

export const getLatestResumeIntro = async (req, res) => {
    const userId = req.user._id;
    const resume = await Resume.findOne({
        userId,
        "media.url": { $ne: null },
        uploadStatus: "COMPLETED",
    })
        .sort({ updatedAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        resume: resume || null,
        media: resume?.media || null,
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

    if (resume.media?.objectKey) {
        await deleteFileFromS3(resume.media.objectKey);
    }

    await Analysis.deleteMany({
        resumeId: req.params.id,
        userId: req.user._id,
    });

    await recordActivity({
        userId: req.user._id,
        type: "resume_deleted",
        description: `Deleted resume "${resume.originalName}"`,
    });

    return res.status(200).json({
        success: true,
        message: "Resume deleted successfully",
    });
};