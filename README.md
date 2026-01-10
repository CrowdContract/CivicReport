# 🏛️ Civic Report System - Infrastructure Complaints & Traffic Violations

A complete MERN stack application for reporting and managing infrastructure issues and traffic violations in your community.

## ✅ What Has Been Built

### Backend (Complete)
- ✅ **New Database Models:**
  - `Report` model with categories, severity, status, location, updates
  - `User` model with roles (Citizen, Official, Admin) and departments
  
- ✅ **Complete API Endpoints:**
  - `POST /api/report` - Create new report
  - `GET /api/reports` - Get all reports (with filters)
  - `GET /api/report/:id` - Get single report details
  - `PUT /api/report/:id` - Update report
  - `DELETE /api/report/:id` - Delete report
  - `POST /api/report/:id/update` - Add progress update
  - `POST /api/report/:id/upvote` - Upvote/downvote report
  - `GET /api/user-reports/:page` - Get user's reports
  - `GET /api/assigned-reports` - Get reports assigned to official
  - `POST /api/report/:id/assign` - Assign report to official (admin only)
  - `GET /api/reports/statistics` - Get dashboard statistics
  - `GET /api/reports/search` - Advanced search with filters

- ✅ **Features:**
  - Role-based access control (Citizen, Official, Admin)
  - Department-based assignment
  - Status tracking (New → In Progress → Resolved)
  - Severity levels (Low, Medium, High, Critical)
  - Location-based queries with geospatial indexing
  - Progress updates timeline
  - Upvoting system
  - View counter

### Frontend (Complete)
- ✅ **Pages Created:**
  - Home page with statistics dashboard
  - Report submission form
  - Report detail view with updates
  - User dashboard (my reports + assigned reports)
  - Login/Register pages
  
- ✅ **Components:**
  - ReportCard - Display report summaries
  - Navigation with role badges
  - Status and severity indicators
  - Update timeline
  - Upvote functionality

- ✅ **Features:**
  - Responsive design with Bootstrap
  - Real-time status updates
  - Role-based UI (different views for Citizens/Officials/Admin)
  - Category icons and color coding
  - Google Places fallback for manual address entry

### Database
- ✅ **Seeded with test data:**
  - 5 users (1 admin, 2 citizens, 2 officials)
  - 6 sample reports across different categories
  - Various statuses and severity levels

## 🚀 How to Run

### 1. Start MongoDB
```bash
# MongoDB should already be running
Get-Service -Name MongoDB
```

### 2. Start Backend Server
```bash
cd civic-report-app/server
npm start
```
Server runs on: http://localhost:8000

### 3. Start Frontend Client
```bash
cd civic-report-app/client
npm start
```
Client runs on: http://localhost:3000

## 🔐 Test Accounts

### Admin Account
- **Email:** admin@civic.gov
- **Password:** admin123
- **Access:** Full system access, can assign reports, view all data

### Citizen Accounts
- **Email:** john@example.com / jane@example.com
- **Password:** citizen123
- **Access:** Submit reports, track own reports, upvote

### Official Accounts
- **Email:** mike@civic.gov (Roads Dept) / sarah@civic.gov (Traffic Dept)
- **Password:** official123
- **Access:** View assigned reports, add updates, change status

## 📊 Report Categories

### Infrastructure Issues:
- 🕳️ Potholes
- 💡 Streetlights
- 💧 Water Supply
- 🚰 Drainage
- 🛣️ Road Damage
- 🚦 Traffic Signals
- 🗑️ Garbage Collection
- 🏗️ Other Infrastructure

### Traffic Violations:
- 🚗 Illegal Parking
- 🚦 Signal Violations
- ⚠️ Other Violations

## 🎯 Key Features Implemented

### For Citizens:
- ✅ Submit infrastructure complaints
- ✅ Report traffic violations
- ✅ Track report status
- ✅ Upvote important issues
- ✅ View community reports
- ✅ Get updates on submitted reports

### For Officials:
- ✅ View assigned reports
- ✅ Add progress updates
- ✅ Change report status
- ✅ Filter by department
- ✅ Priority-based sorting

### For Admins:
- ✅ View all reports
- ✅ Assign reports to officials
- ✅ View statistics dashboard
- ✅ Manage users and reports
- ✅ Track resolution metrics

## 🔧 Technical Stack

- **Frontend:** React 18, React Router, Axios, Ant Design, Bootstrap, date-fns
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JWT tokens with refresh tokens
- **File Upload:** AWS S3 (configured, ready to use)
- **Email:** AWS SES (configured, ready to use)
- **Maps:** Google Maps API (fallback implemented)

## 📈 Optional Enhancements (Ready to Add)

### 1. Real-time Notifications
- WebSocket integration for live updates
- Push notifications when report status changes
- Email alerts for assigned officials

### 2. Advanced Analytics
- Dashboard charts (reports by category, severity, time)
- Resolution time metrics
- Department performance tracking
- Heatmaps of problem areas

### 3. Map Integration
- Cluster markers for nearby reports
- Interactive map view
- Filter reports by map area
- Route planning for officials

### 4. Enhanced Features
- Photo upload for evidence
- Comment system for community discussion
- Report sharing on social media
- Mobile app (React Native)
- SMS notifications
- QR code for quick reporting

## 🗂️ Project Structure

```
civic-report-app/
├── server/
│   ├── controllers/
│   │   ├── auth.js          # Authentication logic
│   │   └── report.js        # Report CRUD operations
│   ├── models/
│   │   ├── user.js          # User schema with roles
│   │   └── report.js        # Report schema
│   ├── routes/
│   │   ├── auth.js          # Auth routes
│   │   └── report.js        # Report routes
│   ├── config.js            # Database & API keys
│   ├── seed.js              # Test data seeder
│   └── server.js            # Express app
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── cards/
│   │   │   │   └── ReportCard.js
│   │   │   └── nav/
│   │   │       └── Main.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── CreateReport.js
│   │   │   ├── ReportView.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── context/
│   │   │   └── auth.js
│   │   ├── config.js
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🎨 Customization

### Add New Categories
Edit `civic-report-app/client/src/config.js`:
```javascript
export const REPORT_CATEGORIES = [
  "Your New Category",
  // ... existing categories
];
```

### Add New Departments
Edit `civic-report-app/server/models/user.js`:
```javascript
department: {
  type: String,
  enum: ["Roads", "Water", "Electricity", "Traffic", "Your Dept", "General"],
}
```

### Change Severity Levels
Edit both client config and server model to add custom severity levels.

## 🔒 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ Input validation
- ✅ CORS configuration

## 📝 API Documentation

### Create Report
```
POST /api/report
Headers: Authorization: Bearer <token>
Body: {
  title, description, category, type, severity,
  location: { address, city }
}
```

### Get Reports (with filters)
```
GET /api/reports?status=New&category=Pothole&severity=High
```

### Add Update
```
POST /api/report/:id/update
Body: { message: "Update text" }
```

## 🚧 Known Limitations

- Image upload requires AWS S3 credentials
- Email notifications require AWS SES setup
- Google Maps requires API key for interactive maps
- Real-time updates require WebSocket implementation

## 🎯 Next Steps

1. **Test the application:**
   - Login with different roles
   - Submit reports
   - Add updates as official
   - Assign reports as admin

2. **Add API keys (optional):**
   - AWS S3 for image uploads
   - AWS SES for email notifications
   - Google Maps for interactive maps

3. **Customize for your needs:**
   - Add your city's departments
   - Customize categories
   - Add your branding

4. **Deploy to production:**
   - Set up environment variables
   - Configure production database
   - Deploy to cloud platform

## 📞 Support

For issues or questions, check the code comments or refer to the original real estate app structure.

---

**Built by transforming the Realist real estate marketplace into a civic engagement platform!** 🎉
