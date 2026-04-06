// import mongoose from "mongoose";

// const resultSchema = new mongoose.Schema(
//     {
//         userId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: true,
//         },

//         resumeId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Resume",
//             required: true,
//         },


//         jdId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "JobDescription",
//             required: true,
//         },

//         matchScore: {
//             type: Number,
//             required: true,
//         },

//         matchedSkills: [String],

//         missingSkills: [String],
//     },
//     { timestamps: true }
// );

// export default mongoose.model("Result", resultSchema);