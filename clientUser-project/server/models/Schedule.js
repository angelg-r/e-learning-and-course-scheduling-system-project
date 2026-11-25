const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    trainor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
    date: { type: String, required: true },
    slot: { type: String, required: true },
    maxSlots: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["Scheduled", "Completed"], default: "Scheduled" }
}, { timestamps: true });

module.exports = mongoose.model("Schedule", scheduleSchema);