const mongoose = require("mongoose");

const notificationLogSchema = new mongoose.Schema({
    recipientUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    channel: { type: String, enum: ["email", "sms"], required: true },
    event: { type: String, required: true, trim: true },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    status: { type: String, enum: ["sent", "queued", "failed"], default: "queued" },
    providerResponse: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("NotificationLog", notificationLogSchema);
