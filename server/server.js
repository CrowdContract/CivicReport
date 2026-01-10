import express from "express";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { DATABASE } from "./config.js";
import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/report.js";
import aiRoutes from "./routes/ai.js";
import socketService from "./services/socketService.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = socketService.initialize(server);

// db
mongoose.set("strictQuery", false);
mongoose
  .connect(DATABASE)
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.log("❌ Database connection error:", err));

// middlewares
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes middleware
app.use("/api", authRoutes);
app.use("/api", reportRoutes);
app.use("/api/ai", aiRoutes);

// Socket.IO status endpoint
app.get("/api/socket/status", (req, res) => {
  res.json({
    connected: socketService.getConnectedUsersCount(),
    status: "active"
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.IO enabled for real-time alerts`);
  console.log(`🤖 AI-powered road defect detection ready`);
});
