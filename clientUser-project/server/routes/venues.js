const express = require("express");
const Venue = require("../models/Venue");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, async (_req, res) => {
    const venues = await Venue.find().sort({ createdAt: -1 });
    res.json({ venues });
});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
    try {
        const venue = await Venue.create(req.body);
        res.status(201).json({ venue });
    } catch (error) {
        res.status(400).json({ message: error.message || "Could not create venue." });
    }
});

router.patch("/:id/status", verifyToken, requireRole("admin"), async (req, res) => {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: "Venue not found." });

    venue.status = venue.status === "Available" ? "Maintenance" : "Available";
    await venue.save();
    res.json({ venue });
});

router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
    await Venue.findByIdAndDelete(req.params.id);
    res.json({ message: "Venue deleted." });
});

module.exports = router;