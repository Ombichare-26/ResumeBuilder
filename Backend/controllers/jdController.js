import JobDescription from "../models/JobDescription.js";
import { extractFromFastAPI } from "../services/fastApiService.js";

export const uploadJobDescription = async (req, res) => {
    try {
        const { targetRole, content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        // Pass JD text to FastAPI to leverage our parsing engine to extract skills automatically
        const extracted = await extractFromFastAPI(content);

        // Store in DB, ensuring userId matches identically to Resume setup
        const jd = await JobDescription.create({
            userId: req.user,  // Extracted from authMiddleware
            targetRole,
            content,
            skills: extracted.skills || [],
        });

        res.status(201).json({
            message: "Job description saved successfully",
            jobDescription: jd,
        });

    } catch (error) {
        console.error("Error saving job description:", error.message);
        res.status(500).json({ message: "Error saving job description" });
    }
};
