const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
    trainee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule", required: true },
    trainingMode: { type: String, default: "Office Training" },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "Confirmed", "Cancelled"], default: "Pending" },
    attendance: { type: String, enum: ["Pending", "Present", "Absent"], default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Reservation", reservationSchema);