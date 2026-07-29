// TEMPORARY DEVELOPER TOOL
import { Router } from "express";
import { devVerifyEmail } from "../controllers/dev.controller.js";

const devRouter = Router();

devRouter.post("/verify-email", devVerifyEmail);

export default devRouter;
