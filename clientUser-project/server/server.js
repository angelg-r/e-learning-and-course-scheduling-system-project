const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { sanitizeBody } = require("./utils/security");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const courseRoutes = require("./routes/courses");
const venueRoutes = require("./routes/venues");
const scheduleRoutes = require("./routes/schedules");
const reservationRoutes = require("./routes/reservations");
const availabilityRoutes = require("./routes/availability");
const progressRoutes = require("./routes/progress");
const notificationRoutes = require("./routes/notifications");

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error("FATAL: MONGO_URI and JWT_SECRET must be set in environment variables.");
    process.exit(1);
}

const app = express();
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// CORS allowlist
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body parsing with size limit & NoSQL operator sanitization
app.use(express.json({ limit: "100kb" }));
app.use(sanitizeBody);

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Please try again shortly." }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many authentication attempts. Please try again in 15 minutes." }
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/notifications", notificationRoutes);

// Test backend
app.get("/", (_req, res) => {
    res.send("GRTI Backend is running!");
});

// Global error handler (prevents stack trace leaks)
app.use((err, _req, res, _next) => {
    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({ message: "CORS origin not allowed." });
    }
    if (err.type === "entity.too.large") {
        return res.status(413).json({ message: "Request payload too large." });
    }
    console.error("Unhandled server error:", err);
    return res.status(500).json({ message: "Internal server error." });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
