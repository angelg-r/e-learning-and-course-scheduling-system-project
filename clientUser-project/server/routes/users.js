const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", verifyToken, async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user });
});

router.put("/me", verifyToken, async (req, res) => {
    try {
        const { fullName, phone, specialization, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found." });

        if (fullName) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (specialization !== undefined) user.specialization = specialization;

        if (newPassword) {
            const match = await bcrypt.compare(currentPassword || "", user.password);
            if (!match) return res.status(400).json({ message: "Current password is incorrect." });
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();
        res.json({
            message: "Profile updated!",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                specialization: user.specialization
            }
        });
    } catch {
        res.status(500).json({ message: "Failed to update profile." });
    }
});

router.get("/", verifyToken, requireRole("admin"), async (_req, res) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
});

router.get("/trainors", verifyToken, requireRole("admin"), async (_req, res) => {
    const trainors = await User.find({ role: "trainor" }).select("_id fullName email specialization");
    res.json({ trainors });
});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        if (!fullName || !email) {
            return res.status(400).json({ message: "Full name and email are required." });
        }
        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) return res.status(409).json({ message: "Email already exists." });

        const hashedPassword = await bcrypt.hash(password || "12345678", 10);
        const created = await User.create({
            fullName,
            email,
            password: hashedPassword,
            role: role || "trainee"
        });

        res.status(201).json({
            user: { _id: created._id, fullName: created.fullName, email: created.email, role: created.role }
        });
    } catch {
        res.status(500).json({ message: "Failed to create user." });
    }
});

router.patch("/:id/role", verifyToken, requireRole("admin"), async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role: req.body.role },
        { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user });
});

router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed." });
});

module.exports = router;