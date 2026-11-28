const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["trainee", "trainor", "admin"],
        default: "trainee"
    },
    phone: { type: String, default: "", trim: true },
    specialization: { type: String, default: "", trim: true }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
