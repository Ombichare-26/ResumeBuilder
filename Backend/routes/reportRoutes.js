import express from "express";
import { generateReport } from "../controllers/reportController.js";
import authMiddleware from "../middlewares/authMiddleware.js"; 

const router = express.Router();

// Generate a scored ATS report
// Use authMiddleware to ensure user context is available, if middleware exists
router.post("/generate", authMiddleware, generateReport);

export default router;
