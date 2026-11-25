const express = require("express");
const Schedule = require("../models/Schedule");
const Reservation = require("../models/Reservation");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
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
});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
    try {
        const { course, trainor, venue, date, slot, maxSlots } = req.body;

        const conflict = await Schedule.findOne({
            date,
            slot,
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

        const created = await Schedule.create({ course, trainor, venue, date, slot, maxSlots });
        const populated = await Schedule.findById(created._id)
            .populate("course", "code title trainingMode")
            .populate("trainor", "fullName email")
            .populate("venue", "name location capacity");

        res.status(201).json({ schedule: { ...populated.toObject(), reservedCount: 0, openSlots: populated.maxSlots } });
    } catch (error) {
        res.status(400).json({ message: error.message || "Could not plot schedule." });
    }
});

router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: "Schedule removed." });
});

module.exports = router;