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

        // 🔹 Step 3: Save to DB (match schema)
        const resume = await Resume.create({
            userId: req.user,
            filePath,
            text,

            skills: extracted.skills || [],

            experience: extracted.experience || [],

            projects: extracted.projects || [],

            achievements: extracted.achievements || [],

            certifications: extracted.certifications || [],
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