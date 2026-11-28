const mongoose = require("mongoose");

/**
 * Recursively strips MongoDB operator keys (`$` prefix or `.` in key names)
 * from plain objects/arrays to prevent NoSQL injection.
 */
function stripMongoOperators(value) {
    if (Array.isArray(value)) {
        return value.map(stripMongoOperators);
    }
    if (value && typeof value === "object") {
        const clean = {};
        for (const [key, val] of Object.entries(value)) {
            if (key.startsWith("$") || key.includes(".")) continue;
            clean[key] = stripMongoOperators(val);
        }
        return clean;
    }
    return value;
}

/**
 * Express middleware that sanitizes `req.body` against MongoDB operator injection.
 */
function sanitizeBody(req, _res, next) {
    if (req.body && typeof req.body === "object") {
        req.body = stripMongoOperators(req.body);
    }
    next();
}

/**
 * Middleware factory that validates a route parameter as a MongoDB ObjectId.
 */
function validateObjectId(...paramNames) {
    return (req, res, next) => {
        for (const name of paramNames) {
            if (!mongoose.isValidObjectId(req.params[name])) {
                return res.status(400).json({ message: `Invalid ${name} format.` });
            }
        }
        next();
    };
}

function isNonEmptyString(val, maxLength = 500) {
    return typeof val === "string" && val.trim().length > 0 && val.trim().length <= maxLength;
}

function isValidEmail(email) {
    return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPassword(password) {
    return typeof password === "string" && password.length >= 8 && password.length <= 128;
}

function isSafeUrl(link) {
    if (typeof link !== "string") return false;
    const trimmed = link.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith("/")) return true;
    try {
        const parsed = new URL(trimmed);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

module.exports = {
    sanitizeBody,
    validateObjectId,
    isNonEmptyString,
    isValidEmail,
    isValidPassword,
    isSafeUrl
};
