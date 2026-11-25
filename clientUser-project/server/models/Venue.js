const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    location: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["Available", "Maintenance"], default: "Available" }
}, { timestamps: true });

module.exports = mongoose.model("Venue", venueSchema);