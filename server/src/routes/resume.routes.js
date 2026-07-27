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
    uploadResumeSchema,
    resumeIdSchema,
} from "../validators/resume.schema.js";

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

export default resumeRouter;