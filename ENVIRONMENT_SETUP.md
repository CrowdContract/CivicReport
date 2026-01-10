# Environment Setup Guide

## 📊 Data Sources Overview

The CivicReport app gets data from multiple sources:

### 1. **Database (MongoDB)**
- **Location**: Local MongoDB instance at `mongodb://127.0.0.1:27017/civic-report`
- **Data**: User accounts, reports, updates, assignments
- **Seeded Data**: 6 sample reports, 5 test users with different roles

### 2. **API Endpoints**
- **Statistics**: `/api/reports/statistics` - Real-time report counts
- **User Reports**: `/api/user-reports/:page` - User's submitted reports
- **All Reports**: `/api/reports` - All reports (admin/official view)
- **Report Details**: `/api/report/:id` - Individual report data

### 3. **Fallback Data**
- **Landing Page Stats**: Hardcoded fallback values (1247, 892, 234, 12)
- **Used when**: API is unavailable or returns empty data

## 🔧 Environment Files

### Client Environment (`.env`)
```env
# React App Configuration
PORT=3000
SKIP_PREFLIGHT_CHECK=true

# API Configuration
REACT_APP_API_URL=http://localhost:8000/api

# Google Maps & Places API Keys (Optional)
REACT_APP_GOOGLE_MAPS_KEY=your-google-maps-api-key-here
REACT_APP_GOOGLE_PLACES_KEY=your-google-places-api-key-here

# App Configuration
REACT_APP_NAME=CivicReport
REACT_APP_DESCRIPTION=Smart Civic Reporting Platform

# Development Settings
GENERATE_SOURCEMAP=false
REACT_APP_ENV=development
```

### Server Environment (`.env`)
```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
DATABASE_URL=mongodb://127.0.0.1:27017/civic-report

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=7d

# Client URL
CLIENT_URL=http://localhost:3000

# Email Configuration (AWS SES - Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
EMAIL_FROM="CivicReport" <noreply@civicreport.com>
REPLY_TO=support@civicreport.com

# Google Services (Optional)
GOOGLE_GEOCODER_API_KEY=your-google-geocoder-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GOOGLE_PLACES_API_KEY=your-google-places-api-key

# File Upload Configuration (AWS S3 - Optional)
AWS_S3_BUCKET=civic-report-uploads
AWS_S3_REGION=us-east-1

# App Configuration
APP_NAME=CivicReport
APP_DESCRIPTION=Smart Civic Reporting Platform
SUPPORT_EMAIL=support@civicreport.com

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Development Settings
DEBUG=true
LOG_LEVEL=info
```

## 🗄️ Database Setup

### Current Test Data (from seed.js):

#### **Users Created:**
```
Admin: admin@civic.gov / admin123
Citizen 1: john@example.com / citizen123  
Citizen 2: jane@example.com / citizen123
Roads Official: mike@civic.gov / official123
Traffic Official: sarah@civic.gov / official123
```

#### **Sample Reports Created:**
1. **Large Pothole on Main Street** (High severity, New status)
2. **Streetlight Not Working** (Medium severity, In Progress)
3. **Water Leakage on Park Road** (Critical severity, In Progress)
4. **Broken Traffic Signal** (High severity, New)
5. **Illegal Parking Blocking Fire Hydrant** (Medium severity, New)
6. **Garbage Not Collected for 5 Days** (Medium severity, Resolved)

### To Reset/Reseed Database:
```bash
cd civic-report-app/server
node seed.js
```

## 🔑 API Keys Needed (Optional Features)

### Google Services:
1. **Google Maps API Key**
   - For: Interactive maps, location display
   - Get from: [Google Cloud Console](https://console.cloud.google.com/)
   - Enable: Maps JavaScript API, Places API

2. **Google Places API Key**
   - For: Address autocomplete, location search
   - Same as above or separate key

3. **Google Geocoder API Key**
   - For: Converting addresses to coordinates
   - Enable: Geocoding API

### AWS Services:
1. **AWS Access Keys**
   - For: File uploads (S3), Email sending (SES)
   - Get from: [AWS IAM Console](https://console.aws.amazon.com/iam/)

2. **S3 Bucket**
   - For: Storing report images/attachments
   - Create in: [AWS S3 Console](https://console.aws.amazon.com/s3/)

## 🚀 Quick Start

### 1. **Basic Setup (No API Keys Needed)**
```bash
# Start MongoDB
mongod

# Start Backend
cd civic-report-app/server
npm start

# Start Frontend  
cd civic-report-app/client
npm start
```

### 2. **With API Keys (Full Features)**
1. Get Google Maps/Places API keys
2. Update `.env` files with your keys
3. Restart both servers

## 📈 Data Flow

```
Landing Page Stats:
API Call → /api/reports/statistics → Real Data
If API fails → Fallback to hardcoded values

Dashboard Data:
Login → JWT Token → Protected Routes → User-specific data

Report Creation:
Form Submit → API → MongoDB → Real-time updates
```

## 🔍 Current Data Status

- ✅ **MongoDB**: Running with seeded data
- ✅ **API Endpoints**: All functional
- ✅ **Authentication**: JWT-based, working
- ✅ **Real-time Stats**: Live from database
- ⚠️ **Maps**: Placeholder keys (need real Google API keys)
- ⚠️ **File Upload**: Placeholder AWS config (need real AWS keys)

## 🛠️ Troubleshooting

### No Data Showing:
1. Check if MongoDB is running: `mongod`
2. Check if seed data exists: `mongo civic-report` → `db.reports.count()`
3. Re-run seed script: `node seed.js`

### API Errors:
1. Check server logs in terminal
2. Verify `.env` file exists and has correct values
3. Check if port 8000 is available

### Environment Variables Not Loading:
1. Restart both servers after changing `.env`
2. Check `.env` file names (no extra extensions)
3. Verify environment variable names match exactly

The app is currently running with real database data and will show live statistics once you interact with it!