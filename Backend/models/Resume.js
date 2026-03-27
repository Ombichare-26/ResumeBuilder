import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        filePath: {
            type: String,
            required: true,
        },

        text: {
            type: String,
        },

        skills: [String],

        experience: [String],

        projects: [String],

        achievements: [String],

        certifications: [String],
    },
    { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);