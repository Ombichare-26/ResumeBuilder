import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadJobDescription } from "../controllers/jdController.js";

const router = express.Router();

// Upload route
router.post(
    "/upload",
    authMiddleware,
    uploadJobDescription
);

export default router;
