import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import { getBillingHistory } from "../controllers/subscription.controller.js";

const router = express.Router();

router.get("/history", authenticate, getBillingHistory);

export default router;
