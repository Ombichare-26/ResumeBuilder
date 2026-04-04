import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadJobDescription } from "../controllers/jdController.js";
import { getPersonalizedRoadmap } from "../controllers/roadmapController.js";

const router = express.Router();

// Upload route
router.post(
    "/upload",
    authMiddleware,
    uploadJobDescription
);

// Personalized Roadmap route
router.post(
    "/roadmap",
    authMiddleware,
    getPersonalizedRoadmap
);

export default router;
