import mongoose from "mongoose";

const jdSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },

        skills: [String],
    },
    { timestamps: true }
);

export default mongoose.model("JobDescription", jdSchema);