import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


// Routes
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import jdRoutes from "./routes/jdRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import roadmapRoutes from "./routes/roadmapRoutes.js";

const app = express();

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Frontend URLs
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/jd", jdRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/roadmap", roadmapRoutes);

// Health check
app.get("/", (req, res) => {
    res.send("Backend is running");
});

export default app;