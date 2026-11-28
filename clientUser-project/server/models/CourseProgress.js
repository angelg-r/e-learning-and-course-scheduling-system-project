const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({
    trainee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    completedMaterials: [{ type: mongoose.Schema.Types.ObjectId }],
    completed: { type: Boolean, default: false }
}, { timestamps: true });

courseProgressSchema.index({ trainee: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
