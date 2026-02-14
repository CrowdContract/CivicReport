import Report from "../models/report.js";
import aiService from "../services/aiService.js";
import socketService from "../services/socketService.js";
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Create report with AI analysis
export const createReportWithAI = async (req, res) => {
  try {
    const { title, description, category, severity } = req.body;
    // location comes as JSON string from FormData
    const location = req.body.location ? JSON.parse(req.body.location) : null;
    const userId = req.user._id;

    let aiAnalysis = null;
    let processedImages = [];

    // Process uploaded images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Compress and process image
        const processedBuffer = await sharp(file.buffer)
          .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();

        // Convert to base64 for AI analysis
        const base64Image = processedBuffer.toString('base64');
        
        // Analyze first image with AI
        if (!aiAnalysis) {
          console.log('Analyzing image with AI...');
          aiAnalysis = await aiService.analyzeRoadImage(base64Image);
          console.log('AI Analysis Result:', aiAnalysis);
        }

        // Store processed image (in production, upload to S3/cloud storage)
        const filename = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
        const filepath = path.join(__dirname, '../uploads', filename);
        
        // Ensure uploads directory exists
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        await fs.promises.writeFile(filepath, processedBuffer);
        
        processedImages.push({
          filename,
          originalName: file.originalname,
          size: processedBuffer.length,
          mimetype: 'image/jpeg',
          url: `/uploads/${filename}`
        });
      }
    }

    // Create report data
    let reportData = {
      title: title || (aiAnalysis ? await aiService.generateReportTitle(aiAnalysis) : 'Road Issue Report'),
      description: description || (aiAnalysis ? await aiService.generateReportDescription(aiAnalysis, location) : 'Road infrastructure issue reported'),
      category: category || (aiAnalysis ? aiAnalysis.category : 'Infrastructure'),
      severity: severity || (aiAnalysis ? aiAnalysis.severity : 'Medium'),
      location: location,
      reportedBy: userId,
      photos: processedImages,
      aiAnalysis: aiAnalysis,
      status: 'New',
      createdAt: new Date()
    };

    // Auto-escalate critical issues
    if (aiAnalysis && (aiAnalysis.isEmergency || aiAnalysis.severity === 'Critical')) {
      reportData.status = 'Critical';
      reportData.priority = 'High';
      reportData.isEmergency = true;
    }

    const report = await new Report(reportData).save();
    await report.populate('reportedBy', 'name email role');

    // Async: generate and store embedding for future RAG queries
    const embedText = `${report.title} ${report.description} ${report.category}`;
    aiService.embedReport(report._id, embedText).catch(console.error);

    // Send real-time alerts for critical/emergency issues
    if (reportData.isEmergency || aiAnalysis?.isEmergency) {
      console.log('Sending emergency alert...');
      await socketService.sendCriticalAlert(report);
    } else if (aiAnalysis?.severity === 'High' || aiAnalysis?.safetyRisk >= 7) {
      console.log('Sending proximity alert...');
      await socketService.sendProximityAlert(report, 3); // 3km radius for high severity
    }

    res.json({
      success: true,
      message: aiAnalysis ? 'Report created with AI analysis' : 'Report created successfully',
      report,
      aiAnalysis
    });

  } catch (error) {
    console.error('Create report error:', error);
    res.json({
      error: 'Error creating report: ' + error.message
    });
  }
};

// Analyze image endpoint (for real-time analysis)
export const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        error: 'No image provided'
      });
    }

    // Process image
    const processedBuffer = await sharp(req.file.buffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const base64Image = processedBuffer.toString('base64');
    
    // Analyze with AI
    const analysis = await aiService.analyzeRoadImage(base64Image);

    res.json({
      success: true,
      analysis,
      suggestions: {
        title: await aiService.generateReportTitle(analysis),
        category: analysis.category,
        severity: analysis.severity,
        isEmergency: analysis.isEmergency
      }
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    res.json({
      error: 'Error analyzing image: ' + error.message
    });
  }
};

// Enhanced statistics with AI insights
export const getEnhancedStatistics = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const newReports = await Report.countDocuments({ status: 'New' });
    const inProgress = await Report.countDocuments({ status: 'In Progress' });
    const resolved = await Report.countDocuments({ status: 'Resolved' });
    const critical = await Report.countDocuments({ severity: 'Critical' });

    // AI-detected reports statistics
    const aiDetectedReports = await Report.countDocuments({ 'aiAnalysis': { $exists: true } });
    const emergencyReports = await Report.countDocuments({ isEmergency: true });

    // Category breakdown
    const categoryStats = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Severity breakdown
    const severityStats = await Report.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent AI detections
    const recentAIDetections = await Report.find({ 'aiAnalysis': { $exists: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title aiAnalysis.defectType aiAnalysis.severity createdAt');

    res.json({
      totalReports,
      newReports,
      inProgress,
      resolved,
      critical,
      aiDetectedReports,
      emergencyReports,
      categoryStats,
      severityStats,
      recentAIDetections
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.json({
      error: 'Error fetching statistics: ' + error.message
    });
  }
};

// Multer middleware exports
export const uploadImages = upload.array('images', 5);
export const uploadSingleImage = upload.single('image');

// RAG: analyze a complaint text against past reports
export const analyzeComplaint = async (req, res) => {
  try {
    const { complaint, location } = req.body;
    if (!complaint) return res.json({ error: 'Complaint text required' });

    const result = await aiService.analyzeComplaintWithRAG(complaint, location);
    if (!result) return res.json({ error: 'Analysis failed' });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Complaint analysis error:', error);
    res.json({ error: error.message });
  }
};