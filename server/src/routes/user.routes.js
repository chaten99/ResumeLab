import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import { getProfile, updateProfile, changePassword, getUserCredits } from "../controllers/user.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/change-password", changePassword);
router.get("/credits", getUserCredits);

export default router;
