"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Get full I Master dashboard for a company
var getDashboard = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const [
            commsRaw,
            meetingsRaw,
            engagementRaw,
            tasksRaw,
            notesRaw,
            attachmentsRaw,
            statusRaw,
        ] = await Promise.all([
            model.CommunicationLog.findAll({ where: { companyId, isDeleted: false } }),
            model.Meeting.findAll({ where: { companyId, isDeleted: false } }),
            model.EngagementScore.findOne({ where: { companyId, isDeleted: false } }),
            model.PendingTask.findAll({ where: { companyId, isDeleted: false, isCompleted: false } }),
            model.CollaborationNote.findOne({ where: { companyId, isDeleted: false } }),
            model.InteractionAttachment.findAll({ where: { companyId, isDeleted: false } }),
            model.InteractionStatus.findOne({ where: { companyId, isDeleted: false } }),
        ]);

        const comms = commsRaw.map((c) => c.get({ plain: true }));
        const meetings = meetingsRaw.map((m) => m.get({ plain: true }));
        const engagement = engagementRaw ? engagementRaw.get({ plain: true }) : null;
        const tasks = tasksRaw.map((t) => t.get({ plain: true }));
        const notes = notesRaw ? notesRaw.get({ plain: true }) : null;
        const attachments = attachmentsRaw.map((a) => a.get({ plain: true }));
        const status = statusRaw ? statusRaw.get({ plain: true }) : { status: "Draft", assignedPM: null };

        // ── I1 Communication Summary ──
        const commTypeCounts = {};
        comms.forEach((c) => { commTypeCounts[c.type] = (commTypeCounts[c.type] || 0) + 1; });
        const outboundCount = comms.filter((c) => c.direction === "Outbound").length;
        const inboundCount = comms.filter((c) => c.direction === "Inbound").length;
        const i1Filled = [
            comms.length > 0,
            outboundCount > 0,
            Object.keys(commTypeCounts).length > 1,
        ].filter(Boolean).length;
        const i1Progress = Math.round((i1Filled / 3) * 100);

        // ── I2 Meeting Summary ──
        const meetingsCompleted = meetings.filter((m) => m.status === "Completed").length;
        const meetingsUpcoming = meetings.filter((m) => m.status === "Upcoming").length;
        const actionItemsCount = meetings.reduce((sum, m) => sum + (m.actionItems || []).length, 0);
        const meetingsWithMinutes = meetings.filter((m) => m.minutes && m.minutes.trim().length > 0).length;
        const followupCount = meetings.filter((m) => m.followupDate).length;
        const i2Filled = [
            meetings.length > 0,
            meetingsCompleted > 0,
            meetingsWithMinutes > 0,
        ].filter(Boolean).length;
        const i2Progress = Math.round((i2Filled / 3) * 100);

        // ── I3 Engagement Summary ──
        const i3Progress = engagement ? engagement.overallScore : 0;

        // ── Overall Progress ──
        const overallProgress = Math.round((i1Progress + i2Progress + i3Progress) / 3);

        // ── Unified Activity Timeline (latest 5, newest first) ──
        const commIconMap = {
            Email: "email", WhatsApp: "whatsapp", "Phone Call": "phone",
            SMS: "sms", LinkedIn: "linkedin", Teams: "meeting", "Google Meet": "meeting",
        };
        const commActivities = comms.map((c) => ({
            sourceType: "communication",
            icon: commIconMap[c.type] || "email",
            title: `${c.type} ${c.status}`,
            description: c.subject,
            timestamp: c.createdAt,
        }));
        const meetingActivities = meetings.map((m) => ({
            sourceType: "meeting",
            icon: "meeting",
            title: `Meeting ${m.status}`,
            description: m.title,
            timestamp: m.date,
        }));
        const timeline = [...commActivities, ...meetingActivities]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);

        // ── Documents count (attachments split by likely source isn't tracked separately; give total + I3-specific) ──
        const docCounts = {
            i1: comms.reduce((sum, c) => sum + (c.attachments || []).length, 0),
            i2: meetings.reduce((sum, m) => sum + (m.documents || []).length, 0),
            i3: attachments.length,
        };
        const meetingLinksCount = meetings.filter((m) => m.recordingUrl).length;

        // ── Last activity / next activity ──
        const lastActivity = timeline.length > 0 ? timeline[0] : null;
        const nextMeeting = meetings
            .filter((m) => m.status === "Upcoming")
            .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;

        return ReS(res, {
            companyId: parseInt(companyId),
            status: status.status,
            assignedPM: status.assignedPM,
            progress: {
                overall: overallProgress,
                i1: i1Progress,
                i2: i2Progress,
                i3: i3Progress,
            },
            communicationSummary: {
                total: comms.length,
                outbound: outboundCount,
                inbound: inboundCount,
                typeCounts: commTypeCounts,
            },
            meetingSummary: {
                total: meetings.length,
                completed: meetingsCompleted,
                upcoming: meetingsUpcoming,
                actionItems: actionItemsCount,
                minutesOfMeeting: meetingsWithMinutes,
                followupsScheduled: followupCount,
            },
            engagementSummary: engagement || { overallScore: 0, communicationQuality: 0, responseRate: 0 },
            documents: {
                i1Count: docCounts.i1,
                i2Count: docCounts.i2,
                i3Count: docCounts.i3,
                meetingLinksCount,
            },
            pendingTasksCount: tasks.length,
            collaborationNotes: notes ? notes.content : null,
            timeline,
            lastActivity,
            nextActivity: nextMeeting ? { title: nextMeeting.title, date: nextMeeting.date } : null,
        }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getDashboard = getDashboard;

// ✅ Update interaction status / assigned PM
var updateStatus = async function (req, res) {
    try {
        const { companyId, status, assignedPM } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const [record] = await model.InteractionStatus.findOrCreate({
            where: { companyId, isDeleted: false },
            defaults: { status: status || "Draft", assignedPM },
        });

        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (assignedPM !== undefined) updateData.assignedPM = assignedPM;
        await record.update(updateData);

        return ReS(res, record.get({ plain: true }), 200);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.updateStatus = updateStatus;