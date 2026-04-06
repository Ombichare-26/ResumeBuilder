import express from "express";
import { getPersonalizedRoadmap } from "../controllers/roadmapController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// All roadmap routes require authentication
router.use(authMiddleware);

/**
 * 🔹 POST /api/roadmap
 * Fetches or generates a personalized learning roadmap.
 */


router.post("/", getPersonalizedRoadmap);

export default router;
