const express = require("express");
const NotificationLog = require("../models/NotificationLog");
const Reservation = require("../models/Reservation");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { notifyUser } = require("../utils/notifications");

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
    try {
        const role = (req.user.role || "").toLowerCase();
        const filter = role === "admin" ? {} : { recipientUser: req.user.id };
        const logs = await NotificationLog.find(filter)
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ notifications: logs });
    } catch {
        res.status(500).json({ message: "Failed to load notifications." });
    }
});

// Send reminders for confirmed reservations on a target date (defaults to tomorrow)
router.post("/reminders", verifyToken, requireRole("admin"), async (req, res) => {
    try {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const targetDate = typeof req.body?.date === "string" && req.body.date.trim()
            ? req.body.date.trim()
            : tomorrow;

        const reservations = await Reservation.find({ status: "Confirmed" })
            .populate("trainee", "fullName email phone")
            .populate({
                path: "schedule",
                populate: [
                    { path: "course", select: "title" },
                    { path: "venue", select: "name" }
                ]
            });

        const matching = reservations.filter((r) => r.schedule?.date === targetDate);
        await Promise.all(
            matching.map((r) =>
                notifyUser({
                    user: r.trainee,
                    event: "schedule_reminder",
                    subject: `GRTI Training Reminder: ${r.schedule?.course?.title || "Session"}`,
                    message: `Hi ${r.trainee?.fullName || "Trainee"}, reminder of your confirmed ${r.schedule?.course?.title || "training"} on ${r.schedule?.date} (${r.schedule?.slot}) at ${r.schedule?.venue?.name || "GRTI"}.`
                })
            )
        );

        res.json({ message: `Processed ${matching.length} reminder notification(s) for ${targetDate}.`, count: matching.length });
    } catch {
        res.status(500).json({ message: "Failed to send reminders." });
    }
});

module.exports = router;
