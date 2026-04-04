import Roadmap from "../models/Roadmap.js";
import Resume from "../models/Resume.js"; // Assuming Resume model exists
import { generateRoadmap } from "../services/ollamaService.js";

export const getPersonalizedRoadmap = async (req, res) => {
    try {
        const { type, name, targetRole } = req.body;
        const userId = req.user;

        if (!type || !name || !targetRole) {
            return res.status(400).json({ message: "Type, Name, and TargetRole are required." });
        }

        // 1. Check DB Cache first
        // Note: For TRUE personalization, we cache by userId + name + role.
        const existingRoadmap = await Roadmap.findOne({ userId, name, targetRole });
        if (existingRoadmap) {
            console.log(`[ROADMAP] Returning cached roadmap for: ${name}`);
            return res.status(200).json(existingRoadmap);
        }

        // 2. Fetch User Resume for Level-Aware Personalization
        const userResume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
        const resumeContent = userResume ? userResume.text : "No resume found. Provide a general start-to-end roadmap.";

        // 3. Generate new roadmap via AI
        console.log(`[ROADMAP] Generating NEW personalized roadmap for: ${name}...`);
        const aiRoadmap = await generateRoadmap(type, name, targetRole, resumeContent);

        // 4. Store in DB
        const newRoadmap = await Roadmap.create({
            userId,
            name,
            type,
            targetRole,
            steps: aiRoadmap.steps,
            resources: aiRoadmap.resources,
            expertTip: aiRoadmap.expertTip,
            personalizationScore: aiRoadmap.personalizationScore
        });

        res.status(201).json(newRoadmap);

    } catch (error) {
        console.error("Error in Roadmap Controller:", error);
        res.status(500).json({ message: "Failed to fetch roadmap.", error: error.message });
    }
};
