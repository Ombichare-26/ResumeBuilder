import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


// Routes
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
// import matchRoutes from "./routes/matchRoutes.js";

const app = express();

// Middleware
app.use(cors());



app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
// app.use("/api/match", matchRoutes);

// Health check
app.get("/", (req, res) => {
    res.send("Backend is running");
});

export default app;