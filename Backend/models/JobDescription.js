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
    },

    { timestamps: true }
);

export default mongoose.model("JobDescription", jdSchema);