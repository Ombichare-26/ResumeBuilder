import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        resumeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resume",
            required: true,
        },
        jdId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobDescription",
            required: true,
        },
        
        // 3-Layered Scores
        regexScore: { type: Number, default: 0 },
        similarityScore: { type: Number, default: 0 },
        llmScore: { type: Number, default: 0 },

        // Final Calculated Score
        overallScore: { type: Number, required: true },
        
        categoryScores: {
            TechnicalSkills: { type: Number, default: 0 },
            Experience: { type: Number, default: 0 },
            Achievements: { type: Number, default: 0 },
            Projects: { type: Number, default: 0 }
        },
        
        missingSkills: [String],
        aiSuggestions: { type: String, default: "" },
        
        // Detail object to store gap analysis strings
        experienceGaps: [String]
    },
    { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
