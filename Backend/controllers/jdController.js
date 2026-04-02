import JobDescription from "../models/JobDescription.js";
import { extractFromFastAPI } from "../services/fastApiService.js";
import { generateJDInsights } from "../services/ollamaService.js";

export const uploadJobDescription = async (req, res) => {
    try {
        const { targetRole, content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        // Pass JD text to FastAPI to leverage our parsing engine to extract generic skills automatically
        const extracted = await extractFromFastAPI(content);
        const skillsData = extracted.skills || {};
        const formattedSkills = skillsData.all || (Array.isArray(skillsData) ? skillsData : []);
        
        // Pass JD to Ollama for intelligent synthesis & project recommendations, ensuring it knows the specific role
        const aiInsights = await generateJDInsights(targetRole, content);

        // Store in DB, ensuring userId matches identically to Resume setup
        const jd = await JobDescription.create({
            userId: req.user,  // Extracted from authMiddleware
            targetRole,
            content,
            skills: formattedSkills,
            
            summary: aiInsights.summary,
            requiredSkills: aiInsights.requiredSkills,
            recommendedProjects: aiInsights.recommendedProjects,
        });

        res.status(201).json({
            message: "Job description saved successfully",
            jobDescription: jd,
        });

    } catch (error) {
        console.error("Error saving job description:", error);
        res.status(500).json({ message: "Error saving job description", error: error.message, stack: error.stack });
    }
};
