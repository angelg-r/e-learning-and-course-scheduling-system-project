const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}

function requireRole(...allowedRoles) {
    return (req, res, next) => {
        const role = (req.user?.role || "").toLowerCase();
        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ message: "Forbidden: insufficient permissions." });
        }
        next();
    };
}

module.exports = { verifyToken, requireRole };