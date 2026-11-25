const express = require("express");
const Reservation = require("../models/Reservation");
const Schedule = require("../models/Schedule");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
    const role = (req.user.role || "").toLowerCase();
    const filter = {};

    if (role === "trainee") {
        filter.trainee = req.user.id;
    } else if (role === "trainor") {
        const mySchedules = await Schedule.find({ trainor: req.user.id }).select("_id");
        filter.schedule = { $in: mySchedules.map((s) => s._id) };
    }

    const reservations = await Reservation.find(filter)
        .populate("trainee", "fullName email")
        .populate({
            path: "schedule",
            populate: [
                { path: "course", select: "code title" },
                { path: "venue", select: "name location" },
                { path: "trainor", select: "fullName" }
            ]
        })
        .sort({ createdAt: -1 });

    res.json({ reservations });
});

router.post("/", verifyToken, requireRole("trainee", "admin"), async (req, res) => {
    try {
        const { scheduleId, trainingMode, notes } = req.body;
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) return res.status(404).json({ message: "Schedule not found." });

        const existing = await Reservation.findOne({
            trainee: req.user.id,
            schedule: scheduleId,
            status: { $ne: "Cancelled" }
        });
        if (existing) {
            return res.status(409).json({ message: "You already have a reservation for this schedule." });
        }

        const activeCount = await Reservation.countDocuments({
            schedule: scheduleId,
            status: { $ne: "Cancelled" }
        });
        if (activeCount >= schedule.maxSlots) {
            return res.status(400).json({ message: "This schedule is already full." });
        }

        const created = await Reservation.create({
            trainee: req.user.id,
            schedule: scheduleId,
            trainingMode,
            notes
        });

        const populated = await Reservation.findById(created._id)
            .populate("trainee", "fullName email")
            .populate({
                path: "schedule",
                populate: [
                    { path: "course", select: "code title" },
                    { path: "venue", select: "name location" },
                    { path: "trainor", select: "fullName" }
                ]
            });

        res.status(201).json({ reservation: populated });
    } catch {
        res.status(500).json({ message: "Failed to submit reservation." });
    }
});

router.patch("/:id/status", verifyToken, async (req, res) => {
    const role = (req.user.role || "").toLowerCase();
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found." });

    const isOwner = String(reservation.trainee) === req.user.id;
    if (role !== "admin" && !(isOwner && req.body.status === "Cancelled")) {
        return res.status(403).json({ message: "Forbidden." });
    }

    reservation.status = req.body.status;
    await reservation.save();
    res.json({ reservation });
});

router.patch("/:id/attendance", verifyToken, requireRole("trainor", "admin"), async (req, res) => {
    const reservation = await Reservation.findByIdAndUpdate(
        req.params.id,
        { attendance: req.body.attendance },
        { new: true }
    );
    if (!reservation) return res.status(404).json({ message: "Reservation not found." });
    res.json({ reservation });
});

module.exports = router;