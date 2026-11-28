const express = require("express");
const AvailabilityRequest = require("../models/AvailabilityRequest");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { validateObjectId, isNonEmptyString } = require("../utils/security");
const { notifyUser } = require("../utils/notifications");

const router = express.Router();
const ALLOWED_STATUSES = ["Pending", "Approved", "Declined"];

router.get("/", verifyToken, requireRole("trainor", "admin"), async (req, res) => {
    try {
        const role = (req.user.role || "").toLowerCase();
        const filter = role === "trainor" ? { trainor: req.user.id } : {};
        const requests = await AvailabilityRequest.find(filter)
            .populate("trainor", "fullName email")
            .sort({ createdAt: -1 });
        res.json({ requests });
    } catch {
        res.status(500).json({ message: "Failed to load availability requests." });
    }
});

router.post("/", verifyToken, requireRole("trainor"), async (req, res) => {
    try {
        const { date, slot, reason } = req.body;
        if (!isNonEmptyString(date, 40) || !isNonEmptyString(slot, 60) || !isNonEmptyString(reason, 500)) {
            return res.status(400).json({ message: "Date, slot, and reason are required." });
        }

        const created = await AvailabilityRequest.create({
            trainor: req.user.id,
            date: date.trim(),
            slot: slot.trim(),
            reason: reason.trim()
        });
        res.status(201).json({ request: created });
    } catch {
        res.status(500).json({ message: "Failed to submit availability request." });
    }
});

router.patch("/:id/status", verifyToken, requireRole("admin"), validateObjectId("id"), async (req, res) => {
    try {
        const nextStatus = req.body.status;
        if (!ALLOWED_STATUSES.includes(nextStatus)) {
            return res.status(400).json({ message: "Invalid availability request status." });
        }

        const request = await AvailabilityRequest.findByIdAndUpdate(
            req.params.id,
            { status: nextStatus },
            { new: true, runValidators: true }
        ).populate("trainor", "fullName email phone");

        if (!request) return res.status(404).json({ message: "Request not found." });

        await notifyUser({
            user: request.trainor,
            event: "availability_status_update",
            subject: `GRTI Availability Request ${nextStatus}`,
            message: `Hi ${request.trainor?.fullName || "Trainor"}, your availability request for ${request.date} (${request.slot}) has been ${nextStatus.toLowerCase()}.`
        });

        res.json({ request });
    } catch {
        res.status(500).json({ message: "Failed to update availability request." });
    }
});

router.delete("/:id", verifyToken, requireRole("trainor", "admin"), validateObjectId("id"), async (req, res) => {
    try {
        const request = await AvailabilityRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found." });

        const role = (req.user.role || "").toLowerCase();
        if (role === "trainor" && String(request.trainor) !== req.user.id) {
            return res.status(403).json({ message: "Forbidden: you can only delete your own requests." });
        }

        await request.deleteOne();
        res.json({ message: "Request deleted." });
    } catch {
        res.status(500).json({ message: "Failed to delete request." });
    }
});

module.exports = router;
