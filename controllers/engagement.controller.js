"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");
const { Op } = require("sequelize");

// ───── Helper: build unified timeline from CommunicationLog + Meeting ─────
async function buildTimeline(companyId) {
    const [comms, meetings] = await Promise.all([
        model.CommunicationLog.findAll({ where: { companyId, isDeleted: false } }),
        model.Meeting.findAll({ where: { companyId, isDeleted: false } }),
    ]);

    const commIconMap = {
        Email: "email", WhatsApp: "whatsapp", "Phone Call": "phone",
        SMS: "sms", LinkedIn: "linkedin", Teams: "meeting", "Google Meet": "meeting",
    };
    const commStatusMap = {
        Sent: "Completed", Delivered: "Completed", Read: "Completed",
        Replied: "Completed", Draft: "Draft", Failed: "Failed",
    };

    const commActivities = comms.map((c) => {
        const plain = c.get({ plain: true });
        return {
            id: "C" + plain.id,
            sourceType: "communication",
            sourceId: plain.id,
            type: plain.type,
            icon: commIconMap[plain.type] || "email",
            title: plain.subject,
            description: `${plain.type} ${plain.direction === "Outbound" ? "sent to" : "received from"} ${plain.contactName}`,
            timestamp: plain.createdAt,
            status: commStatusMap[plain.status] || "Completed",
        };
    });

    const meetingTypeIconMap = {
        Online: "meeting", Offline: "meeting", Demo: "demo",
        Discovery: "discovery", "Follow-up": "followup", Workshop: "workshop",
    };
    const meetingStatusMap = {
        Upcoming: "Upcoming", Completed: "Completed", Cancelled: "Failed", Rescheduled: "Pending",
    };

    const meetingActivities = meetings.map((m) => {
        const plain = m.get({ plain: true });
        return {
            id: "M" + plain.id,
            sourceType: "meeting",
            sourceId: plain.id,
            type: "Meeting",
            icon: meetingTypeIconMap[plain.type] || "meeting",
            title: plain.title,
            description: `${plain.type} with ${(plain.participants || []).slice(0, 2).join(", ")}${(plain.participants || []).length > 2 ? " +" + ((plain.participants || []).length - 2) : ""}`,
            timestamp: plain.date,
            status: meetingStatusMap[plain.status] || "Completed",
        };
    });

    const all = [...commActivities, ...meetingActivities].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    return all;
}

// ✅ Get full activity timeline for a company (with filters, pagination)
var getTimeline = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const { type, status, search, page = 1, limit = 10 } = req.query;

        let timeline = await buildTimeline(companyId);

        if (type && type !== "all") {
            timeline = timeline.filter((a) => a.type === type);
        }
        if (status && status !== "all") {
            timeline = timeline.filter((a) => a.status === status);
        }
        if (search) {
            const s = search.toLowerCase();
            timeline = timeline.filter(
                (a) => a.title.toLowerCase().includes(s) || a.description.toLowerCase().includes(s)
            );
        }

        const total = timeline.length;
        const start = (parseInt(page) - 1) * parseInt(limit);
        const end = start + parseInt(limit);
        const pageItems = timeline.slice(start, end);

        // Type counts (for the "Activity Summary" panel)
        const typeCounts = {};
        timeline.forEach((a) => {
            typeCounts[a.icon] = (typeCounts[a.icon] || 0) + 1;
        });

        return ReS(res, {
            companyId: parseInt(companyId),
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            typeCounts,
            lastActivity: timeline.length > 0 ? timeline[0] : null,
            activities: pageItems,
        }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getTimeline = getTimeline;

// ✅ Get / recalculate engagement score for a company
var getEngagementScore = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const record = await model.EngagementScore.findOne({ where: { companyId, isDeleted: false } });
        return ReS(res, record ? record.get({ plain: true }) : {
            companyId: parseInt(companyId),
            overallScore: 0,
            communicationQuality: 0,
            responseRate: 0,
            activityFrequency: 0,
            lastCalculatedAt: null,
        }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getEngagementScore = getEngagementScore;

var recalculateEngagementScore = async function (req, res) {
    try {
        const { companyId } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const timeline = await buildTimeline(companyId);
        const total = timeline.length;
        const completed = timeline.filter((a) => a.status === "Completed").length;

        const activityFrequency = total > 0 ? Math.min(Math.round((total / 20) * 100), 100) : 0;
        const responseRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        const comms = await model.CommunicationLog.findAll({ where: { companyId, isDeleted: false } });
        const repliedCount = comms.filter((c) => c.status === "Replied").length;
        const communicationQuality = comms.length > 0 ? Math.round((repliedCount / comms.length) * 100) : 0;

        const overallScore = Math.round((activityFrequency + responseRate + communicationQuality) / 3);

        const [record] = await model.EngagementScore.findOrCreate({
            where: { companyId, isDeleted: false },
            defaults: { overallScore, communicationQuality, responseRate, activityFrequency, lastCalculatedAt: new Date() },
        });

        await record.update({ overallScore, communicationQuality, responseRate, activityFrequency, lastCalculatedAt: new Date() });

        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.recalculateEngagementScore = recalculateEngagementScore;

// ───── Pending Tasks ─────

var getTasks = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const tasks = await model.PendingTask.findAll({
            where: { companyId, isDeleted: false, isCompleted: false },
            order: [["createdAt", "ASC"]],
        });
        return ReS(res, { success: true, data: tasks }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getTasks = getTasks;

var addTask = async function (req, res) {
    try {
        const { companyId, text } = req.body;
        if (!companyId || !text) return ReE(res, "companyId and text are required", 400);

        const task = await model.PendingTask.create({ companyId, text });
        return ReS(res, task, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addTask = addTask;

var completeTask = async function (req, res) {
    try {
        const task = await model.PendingTask.findByPk(req.params.id);
        if (!task) return ReE(res, "Task not found", 404);

        await task.update({ isCompleted: true });
        return ReS(res, task, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.completeTask = completeTask;

// ✅ Mark all pending tasks for a company as complete
var completeAllTasks = async function (req, res) {
    try {
        const { companyId } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);

        await model.PendingTask.update(
            { isCompleted: true },
            { where: { companyId, isDeleted: false, isCompleted: false } }
        );
        return ReS(res, { message: "All tasks marked as complete" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.completeAllTasks = completeAllTasks;

var deleteTask = async function (req, res) {
    try {
        const task = await model.PendingTask.findByPk(req.params.id);
        if (!task) return ReE(res, "Task not found", 404);

        await task.update({ isDeleted: true });
        return ReS(res, { message: "Task deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteTask = deleteTask;

// ✅ Clear all pending (not-yet-completed) tasks for a company
var clearAllTasks = async function (req, res) {
    try {
        const { companyId } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);

        await model.PendingTask.update(
            { isDeleted: true },
            { where: { companyId, isDeleted: false } }
        );
        return ReS(res, { message: "All tasks cleared" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.clearAllTasks = clearAllTasks;

// ───── Collaboration Notes ─────

var getNotes = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const note = await model.CollaborationNote.findOne({ where: { companyId, isDeleted: false } });
        return ReS(res, note ? note.get({ plain: true }) : { companyId: parseInt(companyId), content: null }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getNotes = getNotes;

var upsertNotes = async function (req, res) {
    try {
        const { companyId, content } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const [note, created] = await model.CollaborationNote.findOrCreate({
            where: { companyId, isDeleted: false },
            defaults: { content },
        });

        if (!created) {
            await note.update({ content });
        }

        return ReS(res, note.get({ plain: true }), created ? 201 : 200);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.upsertNotes = upsertNotes;

// ───── Interaction Attachments ─────

var getAttachments = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const attachments = await model.InteractionAttachment.findAll({
            where: { companyId, isDeleted: false },
            order: [["createdAt", "DESC"]],
        });
        return ReS(res, { success: true, data: attachments }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getAttachments = getAttachments;

var uploadAttachment = async function (req, res) {
    try {
        const { companyId } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);
        if (!req.file) return ReE(res, "No file uploaded", 400);

        const attachment = await model.InteractionAttachment.create({
            companyId,
            name: req.file.originalname,
            url: req.file.location,
            size: req.file.size,
        });

        return ReS(res, attachment, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.uploadAttachment = uploadAttachment;

var deleteAttachment = async function (req, res) {
    try {
        const attachment = await model.InteractionAttachment.findByPk(req.params.id);
        if (!attachment) return ReE(res, "Attachment not found", 404);

        await attachment.update({ isDeleted: true });
        return ReS(res, { message: "Attachment deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteAttachment = deleteAttachment;

// ✅ Clear all attachments for a company
var clearAllAttachments = async function (req, res) {
    try {
        const { companyId } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);

        await model.InteractionAttachment.update(
            { isDeleted: true },
            { where: { companyId, isDeleted: false } }
        );
        return ReS(res, { message: "All attachments cleared" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.clearAllAttachments = clearAllAttachments;