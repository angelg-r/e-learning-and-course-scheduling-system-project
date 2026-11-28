const express = require("express");
const Venue = require("../models/Venue");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { validateObjectId, isNonEmptyString } = require("../utils/security");

const router = express.Router();

router.get("/", verifyToken, async (_req, res) => {
    try {
        const venues = await Venue.find().sort({ createdAt: -1 });
        res.json({ venues });
    } catch {
        res.status(500).json({ message: "Failed to load venues." });
    }
});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
    try {
        const { name, location, capacity, status } = req.body;
        if (!isNonEmptyString(name, 120) || !isNonEmptyString(location, 150)) {
            return res.status(400).json({ message: "Venue name and location are required." });
        }

        const venue = await Venue.create({
            name: name.trim(),
            location: location.trim(),
            capacity: Number(capacity),
            status: typeof status === "string" ? status.trim() : undefined
        });
        res.status(201).json({ venue });
    } catch (error) {
        res.status(400).json({ message: error.message || "Could not create venue." });
    }
});

router.patch("/:id/status", verifyToken, requireRole("admin"), validateObjectId("id"), async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id);
        if (!venue) return res.status(404).json({ message: "Venue not found." });

        venue.status = venue.status === "Available" ? "Maintenance" : "Available";
        await venue.save();
        res.json({ venue });
    } catch {
        res.status(500).json({ message: "Failed to update venue status." });
    }
});

router.delete("/:id", verifyToken, requireRole("admin"), validateObjectId("id"), async (req, res) => {
    try {
        const deleted = await Venue.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Venue not found." });
        res.json({ message: "Venue deleted." });
    } catch {
        res.status(500).json({ message: "Failed to delete venue." });
    }
});

module.exports = router;
