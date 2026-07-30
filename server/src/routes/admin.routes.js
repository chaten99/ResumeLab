import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/admin.middleware.js";
import {
    getOverviewStats,
    getAnalytics,
    getSystemHealthController,
    getUsers,
    getUserDetails,
    disableUser,
    enableUser,
    verifyUserEmail,
    resetUserPassword,
    changeUserCredits,
    changeUserSubscription,
    extendUserSubscription,
    expireUserSubscription,
    getAllResumes,
    deleteResumeByAdmin,
    getAllPayments,
    getAllCreditLedger,
    getAuditLogs,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Apply auth and admin check to all admin endpoints
router.use(authenticate, requireAdmin);

router.get("/overview", getOverviewStats);
router.get("/analytics", getAnalytics);
router.get("/health", getSystemHealthController);

router.get("/users", getUsers);
router.get("/users/:id", getUserDetails);
router.post("/users/:id/disable", disableUser);
router.post("/users/:id/enable", enableUser);
router.post("/users/:id/verify-email", verifyUserEmail);
router.post("/users/:id/reset-password", resetUserPassword);
router.post("/users/:id/change-credits", changeUserCredits);
router.post("/users/:id/change-subscription", changeUserSubscription);
router.post("/users/:id/extend-subscription", extendUserSubscription);
router.post("/users/:id/expire-subscription", expireUserSubscription);

router.get("/resumes", getAllResumes);
router.delete("/resumes/:id", deleteResumeByAdmin);

router.get("/payments", getAllPayments);
router.get("/credits/ledger", getAllCreditLedger);
router.get("/audit-logs", getAuditLogs);

export default router;
