const express = require("express");
const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");
const Schedule = require("../models/Schedule");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { validateObjectId } = require("../utils/security");
const { notifyUser } = require("../utils/notifications");

const router = express.Router();
const ALLOWED_STATUSES = ["Pending", "Confirmed", "Cancelled"];
const ALLOWED_ATTENDANCE = ["Pending", "Present", "Absent"];

router.get("/", verifyToken, async (req, res) => {
    try {
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
    } catch {
        res.status(500).json({ message: "Failed to load reservations." });
    }
});

router.post("/", verifyToken, requireRole("trainee", "admin"), async (req, res) => {
    try {
        const { scheduleId, trainingMode, notes } = req.body;
        if (!mongoose.isValidObjectId(scheduleId)) {
            return res.status(400).json({ message: "Invalid schedule ID." });
        }

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
            trainingMode: typeof trainingMode === "string" ? trainingMode.trim() : undefined,
            notes: typeof notes === "string" ? notes.trim().slice(0, 500) : ""
        });

        const populated = await Reservation.findById(created._id)
            .populate("trainee", "fullName email phone")
            .populate({
                path: "schedule",
                populate: [
                    { path: "course", select: "code title" },
                    { path: "venue", select: "name location" },
                    { path: "trainor", select: "fullName" }
                ]
            });

        await notifyUser({
            user: populated.trainee,
            event: "reservation_created",
            subject: `GRTI Reservation Received: ${populated.schedule?.course?.title || "Training"}`,
            message: `Hi ${populated.trainee?.fullName || "Trainee"}, your reservation for ${populated.schedule?.course?.title || "training"} on ${populated.schedule?.date} (${populated.schedule?.slot}) is currently Pending.`
        });

        res.status(201).json({ reservation: populated });
    } catch {
        res.status(500).json({ message: "Failed to submit reservation." });
    }
});

router.patch("/:id/status", verifyToken, validateObjectId("id"), async (req, res) => {
    try {
        const nextStatus = req.body.status;
        if (!ALLOWED_STATUSES.includes(nextStatus)) {
            return res.status(400).json({ message: "Invalid reservation status." });
        }

        const role = (req.user.role || "").toLowerCase();
        const reservation = await Reservation.findById(req.params.id)
            .populate("trainee", "fullName email phone")
            .populate({
                path: "schedule",
                populate: [
                    { path: "course", select: "title" },
                    { path: "venue", select: "name" }
                ]
            });
        if (!reservation) return res.status(404).json({ message: "Reservation not found." });

        const isOwner = String(reservation.trainee?._id || reservation.trainee) === req.user.id;
        if (role !== "admin" && !(isOwner && nextStatus === "Cancelled")) {
            return res.status(403).json({ message: "Forbidden." });
        }

        reservation.status = nextStatus;
        await reservation.save();

        await notifyUser({
            user: reservation.trainee,
            event: "reservation_status_update",
            subject: `GRTI Reservation ${nextStatus}: ${reservation.schedule?.course?.title || "Training"}`,
            message: `Hi ${reservation.trainee?.fullName || "Trainee"}, your reservation for ${reservation.schedule?.course?.title || "training"} on ${reservation.schedule?.date} (${reservation.schedule?.slot}) at ${reservation.schedule?.venue?.name || "GRTI"} is now ${nextStatus}.`
        });

        res.json({ reservation });
    } catch {
        res.status(500).json({ message: "Failed to update reservation status." });
    }
});

router.patch("/:id/attendance", verifyToken, requireRole("trainor", "admin"), validateObjectId("id"), async (req, res) => {
    try {
        const nextAttendance = req.body.attendance;
        if (!ALLOWED_ATTENDANCE.includes(nextAttendance)) {
            return res.status(400).json({ message: "Invalid attendance status." });
        }

        const reservation = await Reservation.findById(req.params.id).populate("schedule", "trainor");
        if (!reservation) return res.status(404).json({ message: "Reservation not found." });

        const role = (req.user.role || "").toLowerCase();
        if (role === "trainor" && String(reservation.schedule?.trainor) !== req.user.id) {
            return res.status(403).json({ message: "Forbidden: you can only mark attendance for your own schedules." });
        }

        reservation.attendance = nextAttendance;
        await reservation.save();
        res.json({ reservation });
    } catch {
        res.status(500).json({ message: "Failed to update attendance." });
    }
});

module.exports = router;
