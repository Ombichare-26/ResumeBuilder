import express from "express";
import { calculateMatch, getLatestReport, getLatestJD } from "../controllers/matchController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// All match routes require authentication
router.use(authMiddleware);

/**
 * 🔹 POST /api/match
 * Triggers a full analysis between the latest resume and JD.
 */
router.post("/", calculateMatch);

/**
 * 🔹 GET /api/match/latest
 * Fetches the most recent report.
 */
router.get("/latest", getLatestReport);

/**
 * 🔹 GET /api/match/jd/latest
 * Fetches the most recent job description for details.
 */
router.get("/jd/latest", getLatestJD);

export default router;
