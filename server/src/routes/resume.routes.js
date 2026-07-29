import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import validate from "../middleware/validate.js";

import {
    uploadResume,
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