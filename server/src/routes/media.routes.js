import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import { getUserMedia, deleteMedia } from "../controllers/media.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getUserMedia);
router.delete("/:id", deleteMedia);

export default router;
