const express = require("express");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
    try {
        const records = await CourseProgress.find({ trainee: req.user.id });
        res.json({ progress: records });
    } catch {
        res.status(500).json({ message: "Failed to load learning progress." });
    }
});

router.post("/toggle", verifyToken, async (req, res) => {
    try {
        const { courseId, materialId } = req.body;
        if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(materialId)) {
            return res.status(400).json({ message: "Valid courseId and materialId are required." });
        }

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found." });

        const hasMaterial = course.materials.some((m) => String(m._id) === String(materialId));
        if (!hasMaterial) return res.status(404).json({ message: "Material not found in course." });

        let record = await CourseProgress.findOne({ trainee: req.user.id, course: courseId });
        if (!record) {
            record = new CourseProgress({ trainee: req.user.id, course: courseId, completedMaterials: [] });
        }

        const exists = record.completedMaterials.some((id) => String(id) === String(materialId));
        if (exists) {
            record.completedMaterials = record.completedMaterials.filter((id) => String(id) !== String(materialId));
        } else {
            record.completedMaterials.push(materialId);
        }

        record.completed =
            course.materials.length > 0 &&
            record.completedMaterials.length >= course.materials.length;

        await record.save();
        res.json({ progress: record });
    } catch {
        res.status(500).json({ message: "Failed to update learning progress." });
    }
});

module.exports = router;
