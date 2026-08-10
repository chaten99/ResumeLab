import Resume from "../models/resume.model.js";
import Analysis from "../models/analysis.model.js";
import AppError from "../utils/AppError.js";
import { parseResumePdf } from "../services/resumeParser.service.js";
import { recordActivity } from "../services/activity.service.js";
import { createInAppNotification } from "../services/notification.service.js";
import { emitToUser } from "../config/socket.js";
import { addResumeUploadJob } from "../queues/resume.queue.js";
import { addResumeTranscriptionJob } from "../queues/transcription.queue.js";
import { extractStructuredDataFromTranscript } from "../services/ai/transcriptExtractor.service.js";
import { generateServerPdf } from "../services/pdf/pdfGenerator.service.js";
import { generateServerDocx } from "../services/docx/docxGenerator.service.js";
import { deleteFileFromS3, getPresignedDownloadUrl } from "../services/s3.service.js";
import path from "path";

export const uploadResume = async (req, res) => {
    if (!req.file) {
        throw new AppError("No file uploaded", 400);
    }
    const { targetRole, jobDescription } = req.body;
    const { text, pageCount } = await parseResumePdf(req.file.buffer);

    const resume = await Resume.create({
        userId: req.user._id,
        recordType: "RESUME",
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
        recordType: "BUILDER_DRAFT",
        originalName: originalName || req.file.originalname,
        targetRole,
        currentStep: 1,
        step1Status: "PROCESSING",
        uploadStatus: "QUEUED",
        processingStatus: "QUEUED",
        extractionPromptVersion: "v1.1",
        version: 1,
        media: {
            type: resourceType,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            status: "QUEUED",
        },
        transcript: {
            status: "PENDING",
            text: "",
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
        recordType: "BUILDER_DRAFT",
        "media.url": { $ne: null },
    })
        .sort({ updatedAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        resume: resume || null,
        media: resume?.media || null,
        transcript: resume?.transcript || null,
        structuredResume: resume?.structuredResume || null,
        currentStep: resume?.currentStep || 1,
        step1Status: resume?.step1Status || "DRAFT",
        selectedTemplate: resume?.selectedTemplate || "modern",
        selectedColor: resume?.selectedColor || "indigo",
        generatedFiles: resume?.generatedFiles || { pdf: { status: "PENDING" }, docx: { status: "PENDING" } },
    });
};

export const confirmStep1 = async (req, res) => {
    const { id } = req.params;

    const resume = await Resume.findOne({ _id: id, userId: req.user._id });
    if (!resume) {
        throw new AppError("Resume draft not found", 404);
    }

    if (resume.step1Status === "CONFIRMED") {
        return res.status(200).json({
            success: true,
            message: "Step 1 is already confirmed",
            resume,
        });
    }

    resume.step1Status = "CONFIRMED";
    resume.step1ConfirmedAt = new Date();
    resume.currentStep = 2;
    await resume.save();

    emitToUser(req.user._id, "resume:step1-confirmed", {
        resumeId: resume._id.toString(),
        step1Status: "CONFIRMED",
        currentStep: 2,
    });

    return res.status(200).json({
        success: true,
        message: "Step 1 confirmed and locked successfully",
        resume,
    });
};

export const updateBuilderState = async (req, res) => {
    const { id } = req.params;
    const { currentStep, selectedTemplate, selectedColor, structuredResume } = req.body;

    const resume = await Resume.findOne({ _id: id, userId: req.user._id });
    if (!resume) {
        throw new AppError("Resume draft not found", 404);
    }

    let contentChanged = false;

    if (currentStep && typeof currentStep === "number") {
        resume.currentStep = currentStep;
    }
    if (selectedTemplate && ["minimal", "modern", "professional", "ats", "creative", "executive"].includes(selectedTemplate)) {
        if (resume.selectedTemplate !== selectedTemplate) {
            resume.selectedTemplate = selectedTemplate;
            contentChanged = true;
        }
    }
    if (selectedColor && ["indigo", "emerald", "crimson", "amber", "slate", "violet"].includes(selectedColor)) {
        if (resume.selectedColor !== selectedColor) {
            resume.selectedColor = selectedColor;
            contentChanged = true;
        }
    }
    if (structuredResume) {
        resume.structuredResume = structuredResume;
        resume.summary = structuredResume?.summary || resume.summary;
        resume.projects = structuredResume?.projects || resume.projects;
        resume.skills = structuredResume?.skills?.technicalSkills || resume.skills;
        resume.education = structuredResume?.education || resume.education;
        resume.experience = structuredResume?.experience || resume.experience;
        contentChanged = true;
    }

    if (contentChanged) {
        resume.version = (resume.version || 1) + 1;
        if (resume.generatedFiles?.pdf) {
            resume.generatedFiles.pdf.status = "STALE";
        }
        if (resume.generatedFiles?.docx) {
            resume.generatedFiles.docx.status = "STALE";
        }
    }

    await resume.save();

    return res.status(200).json({
        success: true,
        message: "Builder state saved successfully",
        resume,
    });
};

export const updateResumeTranscript = async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    const resume = await Resume.findOne({ _id: id, userId: req.user._id });
    if (!resume) {
        throw new AppError("Resume not found", 404);
    }

    if (resume.step1Status === "CONFIRMED") {
        throw new AppError("Step 1 is confirmed and locked. Modification is not allowed.", 403);
    }

    resume.transcript = {
        ...resume.transcript,
        text: text ?? resume.transcript?.text ?? "",
        status: "COMPLETED",
        completedAt: new Date(),
    };

    if (text && text.trim()) {
        resume.currentStep = 2;
    }

    await resume.save();

    emitToUser(req.user._id, "resume:transcription-completed", {
        resumeId: resume._id.toString(),
        status: "COMPLETED",
        transcript: resume.transcript,
        resume: resume.toObject(),
    });

    return res.status(200).json({
        success: true,
        message: "Transcript updated successfully",
        resume,
        transcript: resume.transcript,
    });
};

export const updateStructuredResume = async (req, res) => {
    const { id } = req.params;
    const { structuredResume } = req.body;

    const resume = await Resume.findOne({ _id: id, userId: req.user._id });
    if (!resume) {
        throw new AppError("Resume not found", 404);
    }

    resume.structuredResume = structuredResume;
    resume.summary = structuredResume?.summary || resume.summary;
    resume.projects = structuredResume?.projects || resume.projects;
    resume.skills = structuredResume?.skills?.technicalSkills || resume.skills;
    resume.education = structuredResume?.education || resume.education;
    resume.experience = structuredResume?.experience || resume.experience;
    resume.currentStep = 2;
    resume.version = (resume.version || 1) + 1;

    if (resume.generatedFiles?.pdf) resume.generatedFiles.pdf.status = "STALE";
    if (resume.generatedFiles?.docx) resume.generatedFiles.docx.status = "STALE";

    await resume.save();

    emitToUser(req.user._id, "resume:extraction-completed", {
        resumeId: resume._id.toString(),
        structuredResume: resume.structuredResume,
    });

    return res.status(200).json({
        success: true,
        message: "Structured resume details saved successfully",
        resume,
        structuredResume: resume.structuredResume,
    });
};

export const exportPdfHandler = async (req, res) => {
    const { id } = req.params;

    const resume = await Resume.findOne({ _id: id, userId: req.user._id });
    if (!resume) {
        throw new AppError("Resume draft not found", 404);
    }

    if (
        resume.generatedFiles?.pdf?.status === "COMPLETED" &&
        resume.generatedFiles.pdf.version === resume.version &&
        resume.generatedFiles.pdf.url
    ) {
        const freshUrl = await getPresignedDownloadUrl(resume.generatedFiles.pdf.key);
        return res.status(200).json({
            success: true,
            message: "PDF already generated",
            export: {
                status: "COMPLETED",
                url: freshUrl || resume.generatedFiles.pdf.url,
                generatedAt: resume.generatedFiles.pdf.generatedAt,
            },
        });
    }

    if (!resume.generatedFiles) {
        resume.generatedFiles = { pdf: { status: "PENDING" }, docx: { status: "PENDING" } };
    }
    resume.generatedFiles.pdf.status = "GENERATING";
    resume.generatedFiles.pdf.failureReason = null;
    await resume.save();

    emitToUser(req.user._id, "resume:export-started", {
        resumeId: resume._id.toString(),
        type: "pdf",
    });

    try {
        const pdfResult = await generateServerPdf(resume);

        resume.generatedFiles.pdf = {
            status: "COMPLETED",
            key: pdfResult.key,
            url: pdfResult.url,
            generatedAt: pdfResult.generatedAt,
            version: pdfResult.version,
            failureReason: null,
        };
        await resume.save();

        emitToUser(req.user._id, "resume:export-completed", {
            resumeId: resume._id.toString(),
            type: "pdf",
            export: resume.generatedFiles.pdf,
        });

        return res.status(200).json({
            success: true,
            message: "PDF generated and stored successfully",
            export: resume.generatedFiles.pdf,
        });
    } catch (err) {
        resume.generatedFiles.pdf.status = "FAILED";
        resume.generatedFiles.pdf.failureReason = err.message;
        await resume.save();

        emitToUser(req.user._id, "resume:export-failed", {
            resumeId: resume._id.toString(),
            type: "pdf",
            failureReason: err.message,
        });

        throw new AppError(`PDF generation failed: ${err.message}`, 500);
    }
};

export const exportDocxHandler = async (req, res) => {
    const { id } = req.params;

    const resume = await Resume.findOne({ _id: id, userId: req.user._id });
    if (!resume) {
        throw new AppError("Resume draft not found", 404);
    }

    if (
        resume.generatedFiles?.docx?.status === "COMPLETED" &&
        resume.generatedFiles.docx.version === resume.version &&
        resume.generatedFiles.docx.url
    ) {
        const freshUrl = await getPresignedDownloadUrl(resume.generatedFiles.docx.key);
        return res.status(200).json({
            success: true,
            message: "DOCX already generated",
            export: {
                status: "COMPLETED",
                url: freshUrl || resume.generatedFiles.docx.url,
                generatedAt: resume.generatedFiles.docx.generatedAt,
            },
        });
    }

    if (!resume.generatedFiles) {
        resume.generatedFiles = { pdf: { status: "PENDING" }, docx: { status: "PENDING" } };
    }
    resume.generatedFiles.docx.status = "GENERATING";
    resume.generatedFiles.docx.failureReason = null;
    await resume.save();

    emitToUser(req.user._id, "resume:export-started", {
        resumeId: resume._id.toString(),
        type: "docx",
    });

    try {
        const docxResult = await generateServerDocx(resume);

        resume.generatedFiles.docx = {
            status: "COMPLETED",
            key: docxResult.key,
            url: docxResult.url,
            generatedAt: docxResult.generatedAt,
            version: docxResult.version,
            failureReason: null,
        };
        await resume.save();

        emitToUser(req.user._id, "resume:export-completed", {
            resumeId: resume._id.toString(),
            type: "docx",
            export: resume.generatedFiles.docx,
        });

        return res.status(200).json({
            success: true,
            message: "DOCX generated and stored successfully",
            export: resume.generatedFiles.docx,
        });
    } catch (err) {
        resume.generatedFiles.docx.status = "FAILED";
        resume.generatedFiles.docx.failureReason = err.message;
        await resume.save();

        emitToUser(req.user._id, "resume:export-failed", {
            resumeId: resume._id.toString(),
            type: "docx",
            failureReason: err.message,
        });

        throw new AppError(`DOCX generation failed: ${err.message}`, 500);
    }
};

export const retriggerResumeExtraction = async (req, res) => {
    const { id } = req.params;

    const resume = await Resume.findOne({ _id: id, userId: req.user._id });
    if (!resume) {
        throw new AppError("Resume not found", 404);
    }

    if (resume.step1Status === "CONFIRMED") {
        throw new AppError("Step 1 is confirmed and locked. Modification is not allowed.", 403);
    }

    if (!resume.transcript?.text) {
        throw new AppError("No speech transcript available for extraction", 400);
    }

    const structuredData = await extractStructuredDataFromTranscript(
        resume.transcript.text,
        resume.targetRole || "Full Stack Engineer"
    );

    resume.structuredResume = structuredData;
    resume.summary = structuredData?.summary || "";
    resume.projects = structuredData?.projects || [];
    resume.skills = structuredData?.skills?.technicalSkills || [];
    resume.education = structuredData?.education || [];
    resume.experience = structuredData?.experience || [];
    resume.version = (resume.version || 1) + 1;
    if (resume.generatedFiles?.pdf) resume.generatedFiles.pdf.status = "STALE";
    if (resume.generatedFiles?.docx) resume.generatedFiles.docx.status = "STALE";

    await resume.save();

    emitToUser(req.user._id, "resume:extraction-completed", {
        resumeId: resume._id.toString(),
        structuredResume: resume.structuredResume,
    });

    return res.status(200).json({
        success: true,
        message: "AI resume extraction updated successfully",
        structuredResume: resume.structuredResume,
    });
};

export const reprocessResumeTranscript = async (req, res) => {
    const { id } = req.params;

    const resume = await Resume.findOne({ _id: id, userId: req.user._id });
    if (!resume) {
        throw new AppError("Resume not found", 404);
    }

    if (resume.step1Status === "CONFIRMED") {
        throw new AppError("Step 1 is confirmed and locked. Modification is not allowed.", 403);
    }

    if (!resume.media?.objectKey && !resume.media?.url) {
        throw new AppError("No introduction media attached to reprocess", 400);
    }

    resume.transcript.status = "PENDING";
    resume.transcript.failureReason = null;
    resume.step1Status = "PROCESSING";
    await resume.save();

    const job = await addResumeTranscriptionJob({
        resumeId: resume._id.toString(),
        userId: req.user._id.toString(),
        objectKey: resume.media.objectKey,
        mimeType: resume.media.mimeType,
        resourceType: resume.media.type,
        originalFileName: resume.media.originalName || resume.originalName,
    });

    return res.status(202).json({
        success: true,
        message: "Speech re-transcription job queued successfully",
        resumeId: resume._id,
        jobId: job?.id || null,
    });
};

export const getResumes = async (req, res) => {
    const resumes = await Resume.find({
        userId: req.user._id,
        recordType: { $ne: "BUILDER_DRAFT" },
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

    if (resume.step1Status === "CONFIRMED" && resume.recordType === "BUILDER_DRAFT") {
        throw new AppError("Step 1 is locked. Confirmed builder media cannot be deleted.", 403);
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