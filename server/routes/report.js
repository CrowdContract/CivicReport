import express from "express";
import { requireSignin } from "../middlewares/auth.js";
import * as report from "../controllers/report.js";

const router = express.Router();

// Public routes
router.get("/reports", report.getReports);
router.get("/report/:id", report.getReport);
router.get("/reports/search", report.searchReports);
router.get("/reports/statistics", report.getStatistics);

// Protected routes
router.post("/report", requireSignin, report.createReport);
router.put("/report/:id", requireSignin, report.updateReport);
router.delete("/report/:id", requireSignin, report.deleteReport);
router.post("/report/:id/update", requireSignin, report.addUpdate);
router.post("/report/:id/upvote", requireSignin, report.upvoteReport);
router.get("/user-reports/:page", requireSignin, report.getUserReports);
router.get("/assigned-reports", requireSignin, report.getAssignedReports);
router.post("/report/:id/assign", requireSignin, report.assignReport);

export default router;
