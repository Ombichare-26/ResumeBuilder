import mongoose from "mongoose";

const jdSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        targetRole: {
            type: String,
        },
        content: {
            type: String,
            required: true,
        },

        skills: [String],
        requiredTools: [String],

        summary: {
            type: String,
        },

        requiredSkills: [
            {
                category: String,
                details: [String]
            }
        ],

        recommendedProjects: [
            {
                name: String,
                description: String,
                ideaSource: String,
            }
        ],
    },

    { timestamps: true }
);

export default mongoose.model("JobDescription", jdSchema);