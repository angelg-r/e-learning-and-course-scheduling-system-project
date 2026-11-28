const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { isNonEmptyString, isValidEmail, isValidPassword } = require("../utils/security");

const router = express.Router();

// REGISTER TRAINEE
router.post("/register", async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!isNonEmptyString(fullName, 120) || !isValidEmail(email) || !password) {
            return res.status(400).json({
                message: "Please provide a valid full name, email, and password."
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "trainee"
        });

        await newUser.save();

        res.status(201).json({
            message: "Registration successful!",
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Registration failed." });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!isValidEmail(email) || typeof password !== "string" || !password) {
            return res.status(400).json({
                message: "Valid email and password are required."
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed." });
    }
});

module.exports = router;
