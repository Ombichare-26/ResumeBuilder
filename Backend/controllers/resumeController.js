import Resume from "../models/Resume.js";
import { parseFile } from "../services/parseFile.js";
import { extractFromFastAPI } from "../services/fastApiService.js";
import fs from "fs";

export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const filePath = req.file.path;

        // 🔹 Step 1: Convert file → text
        const text = await parseFile(filePath);



        // 🔹 Step 2: Send to FastAPI
        const extracted = await extractFromFastAPI(text);

        // Map FastAPI data back to Mongoose schema
        const skillsData = extracted.skills || {};
        const formattedSkills = skillsData.all || (Array.isArray(skillsData) ? skillsData : []);
        
        const formattedExperience = (extracted.experience || []).map(exp => ({
            role: exp.role || "",
            company: exp.company || "",
            duration: exp.duration || "",
            description: Array.isArray(exp.description) ? exp.description.join("\n") : (exp.description || ""),
        }));

        const formattedProjects = (extracted.projects || []).map(proj => ({
            name: proj.name || "",
            technologies: proj.technologies || [],
            description: Array.isArray(proj.description) ? proj.description.join("\n") : (proj.description || ""),
        }));

        const formattedAchievements = (extracted.achievements || []).map(ach => 
            ach.title ? ach.title : (typeof ach === "string" ? ach : JSON.stringify(ach))
        );

        const formattedCertifications = (extracted.certifications || []).map(cert => 
            cert.name ? cert.name : (typeof cert === "string" ? cert : JSON.stringify(cert))
        );

        // 🔹 Step 3: Save to DB (match schema)
        const resume = await Resume.create({
            userId: req.user,
            filePath,
            text,

            skills: formattedSkills,

            experience: formattedExperience,

            projects: formattedProjects,

            achievements: formattedAchievements,

            certifications: formattedCertifications,
        });

        // Cleanup physical file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.status(200).json({
            message: "Resume uploaded & parsed successfully",
            resume,
        });

    } catch (error) {
        console.error(error);

        // Cleanup physical file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            message: "Error processing resume",
        });
    }
};