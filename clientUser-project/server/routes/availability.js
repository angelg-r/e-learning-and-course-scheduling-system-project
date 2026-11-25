const express = require("express");
const AvailabilityRequest = require("../models/AvailabilityRequest");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, requireRole("trainor", "admin"), async (req, res) => {
    const role = (req.user.role || "").toLowerCase();
    const filter = role === "trainor" ? { trainor: req.user.id } : {};
    const requests = await AvailabilityRequest.find(filter)
        .populate("trainor", "fullName email")
        .sort({ createdAt: -1 });
    res.json({ requests });
});

router.post("/", verifyToken, requireRole("trainor"), async (req, res) => {
    const { date, slot, reason } = req.body;
    const created = await AvailabilityRequest.create({
        trainor: req.user.id,
        date,
        slot,
        reason
    });
    res.status(201).json({ request: created });
});

router.delete("/:id", verifyToken, requireRole("trainor", "admin"), async (req, res) => {
    await AvailabilityRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Request deleted." });
});

module.exports = router;