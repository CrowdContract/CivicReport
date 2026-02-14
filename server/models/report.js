import { model, Schema, ObjectId } from "mongoose";

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      maxLength: 255,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      // Expanded to support AI-detected categories
      enum: [
        "Pothole",
        "Streetlight",
        "Water Supply",
        "Drainage",
        "Road Damage",
        "Traffic Signal",
        "Garbage",
        "Other Infrastructure",
        // AI-detected categories
        "Road Maintenance",
        "Public Safety",
        "Emergency",
        "Traffic Management",
        "Public Utilities",
        "Infrastructure",
        "Pedestrian Safety",
        "Environmental",
      ],
    },
    type: {
      type: String,
      default: "Infrastructure",
      enum: ["Infrastructure", "Traffic Violation"],
    },
    severity: {
      type: String,
      default: "Medium",
      enum: ["Low", "Medium", "High", "Critical"],
    },
    status: {
      type: String,
      default: "New",
      enum: ["New", "In Progress", "Resolved", "Rejected", "Closed", "Critical"],
    },
    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Urgent"],
      default: "Normal",
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    location: {
      address: { type: String, default: "GPS Location" },
      city: String,
      coordinates: [Number], // [longitude, latitude]
    },
    photos: [
      {
        filename: String,
        originalName: String,
        url: String,
        size: Number,
        mimetype: String,
        // Legacy S3 fields
        Location: String,
        Key: String,
      },
    ],
    // AI Analysis results
    aiAnalysis: {
      defectType: String,
      severity: String,
      size: String,
      safetyRisk: Number,
      description: String,
      recommendedAction: String,
      isEmergency: Boolean,
      confidence: Number,
      category: String,
      analyzedAt: Date,
      aiModel: String,
      error: String,
    },
    reportedBy: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: ObjectId,
      ref: "User",
    },
    updates: [
      {
        message: String,
        updatedBy: { type: ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    resolvedAt: Date,
    views: {
      type: Number,
      default: 0,
    },
    upvotes: [{ type: ObjectId, ref: "User" }],
    // RAG: vector embedding of title+description for similarity search
    embedding: {
      type: [Number],
      select: false, // don't return in normal queries
    },
  },
  { timestamps: true }
);

// Geospatial index for proximity queries
schema.index({ "location.coordinates": "2dsphere" });
schema.index({ status: 1, severity: 1 });
schema.index({ category: 1 });
schema.index({ isEmergency: 1 });
schema.index({ "aiAnalysis.severity": 1 });

export default model("Report", schema);
