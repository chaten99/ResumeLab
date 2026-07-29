import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import { runAtsMatch, getAtsMatch } from "../controllers/ats.controller.js";

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.post("/", runAtsMatch);
router.get("/", getAtsMatch);

export default router;
