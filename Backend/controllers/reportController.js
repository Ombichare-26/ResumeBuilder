import Report from "../models/Report.js";
import Resume from "../models/Resume.js";
import JobDescription from "../models/JobDescription.js";
import { generateATSReportEngine } from "../services/atsEngine.js";

export const generateReport = async (req, res) => {
    try {
        const { resumeId, jdId } = req.body;

        if (!resumeId || !jdId) {
            return res.status(400).json({ message: "resumeId and jdId are required." });
        }

        // 1. Fetch data
        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ message: "Resume not found." });
        }

        const jd = await JobDescription.findById(jdId);
        if (!jd) {
            return res.status(404).json({ message: "Job Description not found." });
        }

        // 2. Perform 3-Layered ATS Scoring & Gap Analysis
        const atsResult = await generateATSReportEngine(resume, jd);

        // 3. Save to database
        const newReport = await Report.create({
            userId: req.user || resume.userId, // authMiddleware sets req.user to string ID
            resumeId,
            jdId,
            regexScore: atsResult.regexScore,
            similarityScore: atsResult.similarityScore,
            llmScore: atsResult.llmScore,
            overallScore: atsResult.overallScore,
            categoryScores: atsResult.categoryScores,
            missingSkills: atsResult.missingSkills,
            aiSuggestions: atsResult.aiSuggestions
        });

        // 4. Return result
        return res.status(201).json({
            message: "ATS Report generated successfully.",
            report: newReport
        });

    } catch (error) {
        console.error("Error in generateReport controller:", error);
        return res.status(500).json({ message: "Internal server error generating ATS report." });
    }
};
