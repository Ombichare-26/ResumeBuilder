import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    objective: { type: String }
});

const resourceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true }
});

const roadmapSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },

    type: { type: String, enum: ["missing_tools", "required_skills", "project"], required: true },
    targetRole: { type: String, required: true },
    steps: [stepSchema],
    resources: [resourceSchema],
    expertTip: { type: String },
    personalizationScore: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure we don't duplicate roadmaps for the same user, role, and skill
roadmapSchema.index({ userId: 1, name: 1, targetRole: 1 }, { unique: true });

const Roadmap = mongoose.model("Roadmap", roadmapSchema);
export default Roadmap;
