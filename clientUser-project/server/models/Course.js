const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    format: { type: String, enum: ["PDF", "Video", "Slides"], default: "PDF" },
    link: { type: String, required: true, trim: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    trainingMode: {
        type: String,
        enum: ["Office Training", "Virtual Training", "Group Training", "1-to-1 Training"],
        default: "Office Training"
    },
    modulesCount: { type: Number, default: 1, min: 1 },
    price: { type: Number, default: 0, min: 0 },
    materials: [materialSchema]
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);