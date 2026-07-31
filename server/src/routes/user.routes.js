import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import {
    getProfile,
    updateProfile,
    changePassword,
    getUserCredits,
    getActivitiesHandler,
    getNotificationsHandler,
    markNotificationReadHandler,
    markAllNotificationsReadHandler,
    deleteNotificationHandler,
    exportUserData,
    deactivateAccount,
} from "../controllers/user.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/change-password", changePassword);
router.get("/credits", getUserCredits);

// Activities & Notifications
router.get("/activities", getActivitiesHandler);
router.get("/notifications", getNotificationsHandler);
router.patch("/notifications/read-all", markAllNotificationsReadHandler);
router.patch("/notifications/:id/read", markNotificationReadHandler);
router.delete("/notifications/:id", deleteNotificationHandler);

// Account Settings Extras
router.post("/export-data", exportUserData);
router.delete("/account", deactivateAccount);

export default router;
