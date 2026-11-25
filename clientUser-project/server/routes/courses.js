const express = require("express");
const Course = require("../models/Course");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, async (_req, res) => {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({ courses });
});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json({ course });
    } catch (error) {
        res.status(400).json({ message: error.message || "Could not create course." });
    }
});

router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted." });
});

router.post("/:id/materials", verifyToken, requireRole("admin", "trainor"), async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found." });

    course.materials.unshift({ ...req.body, uploadedBy: req.user.id });
    await course.save();
    res.status(201).json({ course });
});

router.delete("/:id/materials/:materialId", verifyToken, requireRole("admin", "trainor"), async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found." });

    course.materials = course.materials.filter((m) => String(m._id) !== req.params.materialId);
    await course.save();
    res.json({ course });
});

module.exports = router;