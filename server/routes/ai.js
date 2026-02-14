import express from "express";
import { requireSignin } from "../middlewares/auth.js";
import { 
  createReportWithAI, 
  analyzeImage, 
  getEnhancedStatistics,
  analyzeComplaint,
  uploadImages,
  uploadSingleImage 
} from "../controllers/reportAI.js";

const router = express.Router();

// AI-powered report creation
router.post("/report/create", requireSignin, uploadImages, createReportWithAI);

// Real-time image analysis
router.post("/analyze-image", requireSignin, uploadSingleImage, analyzeImage);

// RAG: analyze complaint text against past reports
router.post("/analyze-complaint", requireSignin, analyzeComplaint);

// Enhanced statistics with AI insights
router.get("/statistics", requireSignin, getEnhancedStatistics);

export default router;