const mongoose = require("mongoose");

const availabilityRequestSchema = new mongoose.Schema({
    trainor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    slot: { type: String, required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Pending", "Approved", "Declined"], default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("AvailabilityRequest", availabilityRequestSchema);