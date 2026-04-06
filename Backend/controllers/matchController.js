import Report from "../models/Report.js";
import Resume from "../models/Resume.js";
import JobDescription from "../models/JobDescription.js";
import { generateATSReportEngine } from "../services/atsEngine.js";

/**
 * 🔹 POST /api/match
 * Triggers a full analysis between the latest resume and the latest job description.
 * Stores the result in the Report model.
 */
export const calculateMatch = async (req, res) => {
    try {
        const userId = req.user;

        // 1. Get latest Resume
        const latestResume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
        if (!latestResume) return res.status(404).json({ message: "No resume found. Please upload one first." });

        // 2. Get latest Job Description
        const latestJD = await JobDescription.findOne({ userId }).sort({ createdAt: -1 });
        if (!latestJD) return res.status(404).json({ message: "No job description found. Please upload one first." });

        // 3. Call atsEngine for Hybrid Analysis & Scoring
        const analysis = await generateATSReportEngine(latestResume, latestJD);

        // 5. Create or Update Report
        const report = await Report.findOneAndUpdate(
            { userId, resumeId: latestResume._id, jdId: latestJD._id },
            {
                ...analysis,
                overallScore: analysis.overallScore, // Ensure it's explicitly set
                categoryScores: analysis.categoryScores,
                missingSkills: analysis.missingSkills,
                aiSuggestions: analysis.aiSuggestions,
                experienceGaps: analysis.experienceGaps
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            message: "Match analysis completed successfully",
            report
        });

    } catch (error) {
        console.error("Match Calculation Error:", error);
        res.status(500).json({ message: "Error calculating match", error: error.message });
    }
};

/**
 * 🔹 GET /api/match/latest
 * Fetches the most recent report for the logged-in user.
 */
export const getLatestReport = async (req, res) => {
    try {
        const userId = req.user;
        const report = await Report.findOne({ userId })
            .sort({ createdAt: -1 })
            .populate("resumeId")
            .populate("jdId");

        if (!report) {
            return res.status(200).json(null);
        }

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: "Error fetching report", error: error.message });
    }
};

/**
 * 🔹 GET /api/match/jd/latest
 * Fetches the most recent job description for the logged-in user.
 */
export const getLatestJD = async (req, res) => {
    try {
        const userId = req.user;
        const jd = await JobDescription.findOne({ userId }).sort({ createdAt: -1 });

        if (!jd) {
            return res.status(200).json(null);
        }

        res.status(200).json(jd);
    } catch (error) {
        res.status(500).json({ message: "Error fetching JD", error: error.message });
    }
};
