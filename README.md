# 🏛️ CivicReport — AI-Powered Civic Reporting Platform

A full-stack MERN application for reporting and managing infrastructure issues and traffic violations. Built with a modern premium UI, real-time alerts via Socket.IO, and AI-powered road defect detection using GPT-4o Vision.

---

## 🚀 Tech Stack

- **Frontend:** React 18, Framer Motion, Lucide Icons, React Router v6
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **AI:** OpenAI GPT-4o Vision — image analysis & defect detection
- **LLM:** Prompt engineering + RAG pipeline (embeddings via `text-embedding-3-small`, cosine similarity search over MongoDB)
- **Real-time:** Socket.IO — live alerts for nearby incidents
- **Maps:** Google Maps API — satellite view, GPS auto-pinning
- **Auth:** JWT + Refresh Tokens, Role-based access control
- **Styling:** Custom CSS — glassmorphism, gradients, dark/light mode

---

## ✨ Features

### AI & LLM Integration
- 📸 **Smart Camera** — capture road images directly from device camera
- 🤖 **GPT-4o Vision** — auto-detects potholes, cracks, road damage from photos with confidence scoring
- 🧠 **Prompt Engineering** — domain-specific system prompt gives GPT-4o the context of a professional civic infrastructure engineer, producing precise structured assessments
- 📚 **RAG Pipeline** — complaint text is converted to a vector embedding (`text-embedding-3-small`), similarity-searched against all past reports in MongoDB, and top matches are injected into the LLM prompt as context — enabling recurring issue detection and resolution time estimates
- 📊 **Structured Output** — all LLM responses enforce `response_format: json_object`, guaranteeing parseable JSON with fields like `severity`, `priority`, `recommendedAction`, `estimatedResolutionDays`, `isRecurring`
- 🗺️ **GPS Auto-pin** — detected issues are automatically placed on satellite map
- 🚨 **Emergency Detection** — AI flags critical issues and escalates automatically
- � **Socket.IO Alerts** — nearby users get real-time notifications for accidents and critical reportso

### Reporting System
- Submit infrastructure complaints and traffic violations
- Category auto-detection via AI or manual selection
- Severity levels: Low / Medium / High / Critical
- Photo evidence upload with AI analysis
- Location tagging with address and GPS coordinates

### Role-Based Access
| Role | Capabilities |
|------|-------------|
| Citizen | Submit reports, track status, upvote issues |
| Official | View assigned reports, add updates, change status |
| Admin | Assign reports, view all stats, manage users |

### Dashboard
- Live statistics — total, new, in-progress, resolved
- My reports with full status tracking
- Assigned reports queue for officials
- Category and severity breakdown charts

### UI/UX
- Premium SaaS-style design (Stripe/Linear inspired)
- Glassmorphism cards with gradient accents
- Smooth Framer Motion animations
- Full dark/light mode with system preference detection
- Fully responsive across all devices

---

## 📋 API Endpoints

### Auth
```
POST   /api/login
POST   /api/pre-register
GET    /api/current-user
GET    /api/refresh-token
PUT    /api/update-profile
```

### Reports
```
POST   /api/report              — Create report
GET    /api/reports             — List all (filterable)
GET    /api/report/:id          — Single report
PUT    /api/report/:id          — Update report
DELETE /api/report/:id          — Delete report
POST   /api/report/:id/update   — Add progress update
POST   /api/report/:id/upvote   — Upvote/remove upvote
GET    /api/user-reports/:page  — My reports (paginated)
GET    /api/assigned-reports    — Reports assigned to me
POST   /api/report/:id/assign   — Assign to official (admin only)
GET    /api/reports/statistics  — Dashboard stats
GET    /api/reports/search      — Advanced search
```

### AI
```
POST   /api/ai/analyze-image      — Analyze image with GPT-4o Vision
POST   /api/ai/report/create      — Create AI-assisted report
POST   /api/ai/analyze-complaint  — RAG: analyze complaint against past reports
GET    /api/ai/statistics         — Enhanced stats with AI insights
```

---

## 🗂️ Project Structure

```
civic-report-app/
├── server/
│   ├── controllers/
│   │   ├── auth.js
│   │   ├── report.js
│   │   └── reportAI.js         ← AI report controller
│   ├── models/
│   │   ├── user.js
│   │   └── report.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── report.js
│   │   └── ai.js
│   ├── services/
│   │   ├── aiService.js        ← GPT-4o Vision integration
│   │   └── socketService.js    ← Real-time alerts
│   ├── middlewares/auth.js
│   ├── config.js
│   ├── seed.js
│   └── server.js
│
└── client/
    └── src/
        ├── components/
        │   ├── ai/SmartCamera.js
        │   ├── maps/SmartMap.js
        │   ├── nav/ModernNav.js
        │   └── ui/ThemeToggle.js
        ├── pages/
        │   ├── LandingPage.js
        │   ├── Login.js / Register.js
        │   ├── ModernDashboard.js
        │   ├── Reports.js
        │   ├── ReportView.js
        │   ├── ModernCreateReport.js
        │   └── AIReportCreate.js
        ├── context/
        │   ├── auth.js
        │   ├── theme.js
        │   └── socket.js
        └── styles/modern.css
```

---

## ⚙️ Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Install Dependencies

```bash
# Server
cd civic-report-app/server
npm install

# Client
cd civic-report-app/client
npm install
```

### 2. Environment Variables

Create `server/.env`:
```env
PORT=8000
DATABASE_URL=mongodb://
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-key
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_GOOGLE_MAPS_KEY=your-google-maps-key
```

### 3. Seed Database

```bash
cd civic-report-app/server
node seed.js
```

### 4. Run

```bash
# Terminal 1 — Backend
cd civic-report-app/server
node server.js

# Terminal 2 — Frontend
cd civic-report-app/client
npm start
```

App runs at `http://localhost:3000`

---

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@civic.gov | admin123 |
| Citizen | john@example.com | citizen123 |
| Official | mike@civic.gov | official123 |

---

## 📊 Report Categories

**Infrastructure:** Pothole · Streetlight · Water Supply · Drainage · Road Damage · Traffic Signal · Garbage · Other

**Traffic:** Illegal Parking · Signal Violations · Other Violations

**Severity:** Low · Medium · High · Critical

**Status flow:** New → In Progress → Resolved / Rejected / Closed

---

## 🔒 Security

- JWT authentication with refresh token rotation
- Role-based route protection on both client and server
- Password hashing with bcrypt
- CORS configured per environment
- All secrets managed via environment variables
