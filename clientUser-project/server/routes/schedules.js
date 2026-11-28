const express = require("express");
const mongoose = require("mongoose");
const Schedule = require("../models/Schedule");
const Reservation = require("../models/Reservation");
const AvailabilityRequest = require("../models/AvailabilityRequest");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { validateObjectId, isNonEmptyString } = require("../utils/security");
const { notifyUser } = require("../utils/notifications");

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
    try {
        const filter = {};
        if ((req.user.role || "").toLowerCase() === "trainor" && req.query.mine === "true") {
            filter.trainor = req.user.id;
        }

        const schedules = await Schedule.find(filter)
            .populate("course", "code title trainingMode")
            .populate("trainor", "fullName email")
            .populate("venue", "name location capacity")
            .sort({ date: 1 });

        const counts = await Reservation.aggregate([
            { $match: { status: { $ne: "Cancelled" } } },
            { $group: { _id: "$schedule", count: { $sum: 1 } } }
        ]);
        const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

        const enriched = schedules.map((s) => {
            const reservedCount = countMap.get(String(s._id)) || 0;
            return {
                ...s.toObject(),
                reservedCount,
                openSlots: Math.max(0, s.maxSlots - reservedCount)
            };
        });

        res.json({ schedules: enriched });
    } catch {
        res.status(500).json({ message: "Failed to load schedules." });
    }
});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
    try {
        const { course, trainor, venue, date, slot, maxSlots } = req.body;
        if (
            !mongoose.isValidObjectId(course) ||
            !mongoose.isValidObjectId(trainor) ||
            !mongoose.isValidObjectId(venue)
        ) {
            return res.status(400).json({ message: "Valid course, trainor, and venue IDs are required." });
        }
        if (!isNonEmptyString(date, 40) || !isNonEmptyString(slot, 60)) {
            return res.status(400).json({ message: "Date and slot are required." });
        }

        const approvedUnavailability = await AvailabilityRequest.findOne({
            trainor,
            date: date.trim(),
            status: "Approved",
            $or: [{ slot: "Full Day" }, { slot: slot.trim() }]
        }).populate("trainor", "fullName");

        if (approvedUnavailability) {
            return res.status(409).json({
                message: `Cannot plot schedule: ${approvedUnavailability.trainor?.fullName || "Trainor"} has an approved unavailability on ${date.trim()} (${approvedUnavailability.slot}).`
            });
        }

        const conflict = await Schedule.findOne({
            date: date.trim(),
            slot: slot.trim(),
            $or: [{ trainor }, { venue }]
        }).populate("trainor", "fullName").populate("venue", "name");

        if (conflict) {
            const who = String(conflict.trainor?._id) === trainor
                ? conflict.trainor.fullName
                : conflict.venue?.name;
            return res.status(409).json({
                message: `Schedule conflict: ${who} is already slotted on ${date} (${slot}).`
            });
        }

        const created = await Schedule.create({
            course,
            trainor,
            venue,
            date: date.trim(),
            slot: slot.trim(),
            maxSlots: Number(maxSlots)
        });
        const populated = await Schedule.findById(created._id)
            .populate("course", "code title trainingMode")
            .populate("trainor", "fullName email phone")
            .populate("venue", "name location capacity");

        await notifyUser({
            user: populated.trainor,
            event: "schedule_assigned",
            subject: `GRTI Schedule Assigned: ${populated.course?.title || "Training"}`,
            message: `Hi ${populated.trainor?.fullName || "Trainor"}, you have been assigned to ${populated.course?.title || "a training"} on ${populated.date} (${populated.slot}) at ${populated.venue?.name || "GRTI"}.`
        });

        res.status(201).json({ schedule: { ...populated.toObject(), reservedCount: 0, openSlots: populated.maxSlots } });
    } catch (error) {
        res.status(400).json({ message: error.message || "Could not plot schedule." });
    }
});

router.delete("/:id", verifyToken, requireRole("admin"), validateObjectId("id"), async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id)
            .populate("course", "title")
            .populate("trainor", "fullName email phone");
        if (!schedule) return res.status(404).json({ message: "Schedule not found." });

        const affectedReservations = await Reservation.find({
            schedule: schedule._id,
            status: { $ne: "Cancelled" }
        }).populate("trainee", "fullName email phone");

        await schedule.deleteOne();

        await Promise.all([
            notifyUser({
                user: schedule.trainor,
                event: "schedule_cancelled",
                subject: `GRTI Schedule Cancelled: ${schedule.course?.title || "Training"}`,
                message: `Hi ${schedule.trainor?.fullName || "Trainor"}, the schedule for ${schedule.course?.title || "training"} on ${schedule.date} (${schedule.slot}) has been cancelled.`
            }),
            ...affectedReservations.map((r) =>
                notifyUser({
                    user: r.trainee,
                    event: "schedule_cancelled",
                    subject: `GRTI Schedule Update: ${schedule.course?.title || "Training"} Cancelled`,
                    message: `Hi ${r.trainee?.fullName || "Trainee"}, the ${schedule.course?.title || "training"} session on ${schedule.date} (${schedule.slot}) has been cancelled.`
                })
            )
        ]);

        res.json({ message: "Schedule removed." });
    } catch {
        res.status(500).json({ message: "Failed to remove schedule." });
    }
});

module.exports = router;
