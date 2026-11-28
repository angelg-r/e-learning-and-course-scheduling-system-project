const nodemailer = require("nodemailer");
const NotificationLog = require("../models/NotificationLog");

function createEmailTransporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return null;
    }
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

async function sendEmail({ userId, to, subject, message, event }) {
    if (!to) return null;
    let status = "queued";
    let providerResponse = "SMTP not configured; logged locally.";

    const transporter = createEmailTransporter();
    if (transporter) {
        try {
            const info = await transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.SMTP_USER,
                to,
                subject,
                text: message
            });
            status = "sent";
            providerResponse = info.messageId || "Sent";
        } catch (err) {
            status = "failed";
            providerResponse = err.message;
        }
    } else {
        console.log(`[Email Notification - ${event}] To: ${to} | Subject: ${subject} | ${message}`);
    }

    return NotificationLog.create({
        recipientUser: userId,
        email: to,
        channel: "email",
        event,
        subject,
        message,
        status,
        providerResponse
    }).catch(() => null);
}

async function sendSms({ userId, to, message, event }) {
    if (!to) return null;
    let status = "queued";
    let providerResponse = "SMS provider not configured; logged locally.";

    if (process.env.SEMAPHORE_API_KEY) {
        try {
            const res = await fetch("https://api.semaphore.co/api/v4/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    apikey: process.env.SEMAPHORE_API_KEY,
                    number: to,
                    message,
                    sendername: process.env.SEMAPHORE_SENDER_NAME || "GRTI"
                })
            });
            const body = await res.text();
            status = res.ok ? "sent" : "failed";
            providerResponse = body.slice(0, 300);
        } catch (err) {
            status = "failed";
            providerResponse = err.message;
        }
    } else if (process.env.INFOBIP_BASE_URL && process.env.INFOBIP_API_KEY) {
        try {
            const res = await fetch(`${process.env.INFOBIP_BASE_URL.replace(/\/$/, "")}/sms/2/text/advanced`, {
                method: "POST",
                headers: {
                    Authorization: `App ${process.env.INFOBIP_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: [{ from: process.env.INFOBIP_SENDER || "GRTI", destinations: [{ to }], text: message }]
                })
            });
            const body = await res.text();
            status = res.ok ? "sent" : "failed";
            providerResponse = body.slice(0, 300);
        } catch (err) {
            status = "failed";
            providerResponse = err.message;
        }
    } else {
        console.log(`[SMS Notification - ${event}] To: ${to} | ${message}`);
    }

    return NotificationLog.create({
        recipientUser: userId,
        phone: to,
        channel: "sms",
        event,
        message,
        status,
        providerResponse
    }).catch(() => null);
}

/**
 * Dispatches both Email and SMS notifications safely without blocking or throwing.
 */
async function notifyUser({ user, event, subject, message }) {
    if (!user) return;
    await Promise.all([
        user.email ? sendEmail({ userId: user._id, to: user.email, subject, message, event }) : null,
        user.phone ? sendSms({ userId: user._id, to: user.phone, message, event }) : null
    ]);
}

module.exports = { sendEmail, sendSms, notifyUser };
