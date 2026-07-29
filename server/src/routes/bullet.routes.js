import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import {
    improveBulletSchema,
    updateBulletStatusSchema,
} from "../validators/bullet.validator.js";
import {
    improveBullet,
    getBulletHistory,
    updateBulletStatus,
    regenerateBullet,
} from "../controllers/bullet.controller.js";

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.post("/improve", validate(improveBulletSchema), improveBullet);
router.get("/", getBulletHistory);
router.patch("/:bulletId/status", validate(updateBulletStatusSchema), updateBulletStatus);
router.post("/:bulletId/regenerate", regenerateBullet);

export default router;
