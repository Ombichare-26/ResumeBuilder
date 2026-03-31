import express from "express";
import upload from "../utils/multer.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadResume } from "../controllers/resumeController.js";

const router = express.Router();

// Upload route
router.post(
    "/upload",
    authMiddleware,
    upload.single("resume"),
    uploadResume
);

export default router;