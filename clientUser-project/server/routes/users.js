const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const {
    validateObjectId,
    isNonEmptyString,
    isValidEmail,
    isValidPassword
} = require("../utils/security");

const router = express.Router();
const ALLOWED_ROLES = ["trainee", "trainor", "admin"];

router.get("/me", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found." });
        res.json({ user });
    } catch {
        res.status(500).json({ message: "Failed to load profile." });
    }
});

router.put("/me", verifyToken, async (req, res) => {
    try {
        const { fullName, phone, specialization, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found." });

        if (fullName !== undefined) {
            if (!isNonEmptyString(fullName, 120)) {
                return res.status(400).json({ message: "Invalid full name." });
            }
            user.fullName = fullName.trim();
        }
        if (phone !== undefined) {
            if (typeof phone !== "string" || phone.trim().length > 40) {
                return res.status(400).json({ message: "Invalid phone number." });
            }
            user.phone = phone.trim();
        }
        if (specialization !== undefined) {
            if (typeof specialization !== "string" || specialization.trim().length > 120) {
                return res.status(400).json({ message: "Invalid specialization." });
            }
            user.specialization = specialization.trim();
        }

        if (newPassword) {
            if (!isValidPassword(newPassword)) {
                return res.status(400).json({ message: "New password must be at least 8 characters long." });
            }
            const match = await bcrypt.compare(
                typeof currentPassword === "string" ? currentPassword : "",
                user.password
            );
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
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json({ users });
    } catch {
        res.status(500).json({ message: "Failed to fetch users." });
    }
});

router.get("/trainors", verifyToken, requireRole("admin"), async (_req, res) => {
    try {
        const trainors = await User.find({ role: "trainor" }).select("_id fullName email specialization");
        res.json({ trainors });
    } catch {
        res.status(500).json({ message: "Failed to fetch trainors." });
    }
});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        if (!isNonEmptyString(fullName, 120) || !isValidEmail(email)) {
            return res.status(400).json({ message: "Valid full name and email are required." });
        }
        if (!isValidPassword(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters long." });
        }

        const targetRole = (role || "trainee").toLowerCase();
        if (!ALLOWED_ROLES.includes(targetRole)) {
            return res.status(400).json({ message: "Invalid user role." });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) return res.status(409).json({ message: "Email already exists." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const created = await User.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: targetRole
        });

        res.status(201).json({
            user: { _id: created._id, fullName: created.fullName, email: created.email, role: created.role }
        });
    } catch {
        res.status(500).json({ message: "Failed to create user." });
    }
});

router.patch("/:id/role", verifyToken, requireRole("admin"), validateObjectId("id"), async (req, res) => {
    try {
        const targetRole = typeof req.body.role === "string" ? req.body.role.toLowerCase() : "";
        if (!ALLOWED_ROLES.includes(targetRole)) {
            return res.status(400).json({ message: "Invalid user role." });
        }
        if (String(req.params.id) === req.user.id && targetRole !== "admin") {
            return res.status(400).json({ message: "You cannot demote your own admin account." });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role: targetRole },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found." });
        res.json({ user });
    } catch {
        res.status(500).json({ message: "Failed to update user role." });
    }
});

router.delete("/:id", verifyToken, requireRole("admin"), validateObjectId("id"), async (req, res) => {
    try {
        if (String(req.params.id) === req.user.id) {
            return res.status(400).json({ message: "You cannot delete your own account." });
        }
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "User not found." });
        res.json({ message: "User removed." });
    } catch {
        res.status(500).json({ message: "Failed to remove user." });
    }
});

module.exports = router;
