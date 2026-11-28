const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

function verifyToken(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.id || !mongoose.isValidObjectId(decoded.id)) {
            return res.status(401).json({ message: "Invalid token payload." });
        }
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}

function requireRole(...allowedRoles) {
    const normalized = allowedRoles.map((r) => r.toLowerCase());
    return (req, res, next) => {
        const role = (req.user?.role || "").toLowerCase();
        if (!normalized.includes(role)) {
            return res.status(403).json({ message: "Forbidden: insufficient permissions." });
        }
        next();
    };
}

module.exports = { verifyToken, requireRole };
