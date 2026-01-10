// API Configuration
export const API = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Google API keys
export const GOOGLE_PLACES_KEY = process.env.REACT_APP_GOOGLE_PLACES_KEY || "your-google-places-api-key";
export const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY || "your-google-maps-api-key";

// App Configuration
export const APP_NAME = process.env.REACT_APP_NAME || "CivicReport";
export const APP_DESCRIPTION = process.env.REACT_APP_DESCRIPTION || "Smart Civic Reporting Platform";

// Report categories
export const REPORT_CATEGORIES = [
  "Pothole",
  "Streetlight",
  "Water Supply",
  "Drainage",
  "Road Damage",
  "Traffic Signal",
  "Garbage",
  "Other Infrastructure",
];

export const SEVERITY_LEVELS = ["Low", "Medium", "High", "Critical"];

export const STATUS_OPTIONS = ["New", "In Progress", "Resolved", "Rejected", "Closed"];

export const REPORT_TYPES = ["Infrastructure", "Traffic Violation"];

// User Roles
export const USER_ROLES = {
  CITIZEN: "Citizen",
  OFFICIAL: "Official", 
  ADMIN: "Admin"
};

// Status Colors for UI
export const STATUS_COLORS = {
  "New": "#F59E0B",
  "In Progress": "#3B82F6", 
  "Resolved": "#10B981",
  "Rejected": "#EF4444",
  "Closed": "#6B7280"
};

// Severity Colors for UI
export const SEVERITY_COLORS = {
  "Low": "#10B981",
  "Medium": "#F59E0B",
  "High": "#EF4444", 
  "Critical": "#DC2626"
};
