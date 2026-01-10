import express from "express";
import { requireSignin } from "../middlewares/auth.js";
import { 
  createReportWithAI, 
  analyzeImage, 
  getEnhancedStatistics,
  uploadImages,
  uploadSingleImage 
} from "../controllers/reportAI.js";

const router = express.Router();

// AI-powered report creation
router.post("/report/create", requireSignin, uploadImages, createReportWithAI);

// Real-time image analysis
router.post("/analyze-image", requireSignin, uploadSingleImage, analyzeImage);

// Enhanced statistics with AI insights
router.get("/statistics", requireSignin, getEnhancedStatistics);

export default router;