import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { mediaUpload } from "../middleware/mediaUpload.middleware.js";
import validate from "../middleware/validate.js";

import {
    uploadResume,
    uploadResumeIntro,
    getLatestResumeIntro,
    confirmStep1,
    updateBuilderState,
    exportPdfHandler,
    exportDocxHandler,
    updateResumeTranscript,
    updateStructuredResume,
    retriggerResumeExtraction,
    reprocessResumeTranscript,
    getResumes,
    getResumeById,
    deleteResume,
} from "../controllers/resume.controller.js";

import {
    analyzeResume,
    getResumeAnalysis,
} from "../controllers/analysis.controller.js";

import {
    uploadResumeSchema,
    resumeIdSchema,
} from "../validators/resume.schema.js";

import bulletRouter from "./bullet.routes.js";
import atsRouter from "./ats.routes.js";

const resumeRouter = Router();

resumeRouter.use(authenticate);

resumeRouter.get(
    "/",
    getResumes
);

resumeRouter.get(
    "/intro/latest",
    getLatestResumeIntro
);

resumeRouter.post(
    "/upload-intro",
    mediaUpload.single("file"),
    uploadResumeIntro
);

resumeRouter.post(
    "/:id/step1/confirm",
    validate(resumeIdSchema),
    confirmStep1
);

resumeRouter.put(
    "/:id/builder-state",
    validate(resumeIdSchema),
    updateBuilderState
);

resumeRouter.post(
    "/:id/export/pdf",
    validate(resumeIdSchema),
    exportPdfHandler
);

resumeRouter.post(
    "/:id/export/docx",
    validate(resumeIdSchema),
    exportDocxHandler
);

resumeRouter.put(
    "/:id/transcript",
    validate(resumeIdSchema),
    updateResumeTranscript
);

resumeRouter.put(
    "/:id/structured",
    validate(resumeIdSchema),
    updateStructuredResume
);

resumeRouter.post(
    "/:id/extract",
    validate(resumeIdSchema),
    retriggerResumeExtraction
);

resumeRouter.post(
    "/:id/transcript/reprocess",
    validate(resumeIdSchema),
    reprocessResumeTranscript
);

resumeRouter.get(
    "/:id",
    validate(resumeIdSchema),
    getResumeById
);

resumeRouter.post(
    "/upload",
    upload.single("resume"),
    validate(uploadResumeSchema),
    uploadResume
);

resumeRouter.delete(
    "/:id",
    validate(resumeIdSchema),
    deleteResume
);

resumeRouter.post(
    "/:id/analyze",
    validate(resumeIdSchema),
    analyzeResume
);

resumeRouter.get(
    "/:id/analysis",
    validate(resumeIdSchema),
    getResumeAnalysis
);

resumeRouter.use("/:id/bullets", bulletRouter);
resumeRouter.use("/:id/ats-match", atsRouter);

export default resumeRouter;