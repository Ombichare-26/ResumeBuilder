import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        filePath: String,
        text: String,

        skills: [String],

        experience: [
            {

                role: String,
                company: String,
                duration: String,
                description: String,
            },
        ],

        projects: [
            {
                name: String,
                technologies: [String],
                description: String,
            },
        ],

        achievements: [String],

        certifications: [String],
    },
    { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);