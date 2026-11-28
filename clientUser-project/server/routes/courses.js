const express = require("express");
const Course = require("../models/Course");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { validateObjectId, isNonEmptyString, isSafeUrl } = require("../utils/security");

const router = express.Router();

router.get("/", verifyToken, async (_req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.json({ courses });
    } catch {
        res.status(500).json({ message: "Failed to load courses." });
    }
});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
    try {
        const { code, title, trainingMode, modulesCount, price } = req.body;
        if (!isNonEmptyString(code, 40) || !isNonEmptyString(title, 150)) {
            return res.status(400).json({ message: "Course code and title are required." });
        }

        const course = await Course.create({
            code: code.trim(),
            title: title.trim(),
            trainingMode: typeof trainingMode === "string" ? trainingMode.trim() : undefined,
            modulesCount: Number.isFinite(Number(modulesCount)) ? Number(modulesCount) : undefined,
            price: Number.isFinite(Number(price)) && Number(price) >= 0 ? Number(price) : 0
        });
        res.status(201).json({ course });
    } catch (error) {
        res.status(400).json({ message: error.message || "Could not create course." });
    }
});

router.delete("/:id", verifyToken, requireRole("admin"), validateObjectId("id"), async (req, res) => {
    try {
        const deleted = await Course.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Course not found." });
        res.json({ message: "Course deleted." });
    } catch {
        res.status(500).json({ message: "Failed to delete course." });
    }
});

router.post("/:id/materials", verifyToken, requireRole("admin"), validateObjectId("id"), async (req, res) => {
    try {
        const { title, format, link } = req.body;
        if (!isNonEmptyString(title, 150) || !isSafeUrl(link)) {
            return res.status(400).json({ message: "A valid material title and http(s) link are required." });
        }

        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found." });

        course.materials.unshift({
            title: title.trim(),
            format: typeof format === "string" ? format.trim() : undefined,
            link: link.trim(),
            uploadedBy: req.user.id
        });
        await course.save();
        res.status(201).json({ course });
    } catch (error) {
        res.status(400).json({ message: error.message || "Failed to add material." });
    }
});

router.delete(
    "/:id/materials/:materialId",
    verifyToken,
    requireRole("admin"),
    validateObjectId("id", "materialId"),
    async (req, res) => {
        try {
            const course = await Course.findById(req.params.id);
            if (!course) return res.status(404).json({ message: "Course not found." });

            course.materials = course.materials.filter((m) => String(m._id) !== req.params.materialId);
            await course.save();
            res.json({ course });
        } catch {
            res.status(500).json({ message: "Failed to remove material." });
        }
    }
);

module.exports = router;
