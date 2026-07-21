"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Schedule a new meeting
var add = async function (req, res) {
    try {
        const { companyId, title, date, participants } = req.body;
        if (!companyId || !title || !date) {
            return ReE(res, "companyId, title, and date are required", 400);
        }
        if (!participants || !Array.isArray(participants) || participants.length === 0) {
            return ReE(res, "At least one participant is required", 400);
        }

        const record = await model.Meeting.create(req.body);
        return ReS(res, record, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.add = add;

// ✅ Fetch all
var fetchAll = async function (req, res) {
    try {
        const records = await model.Meeting.findAll({
            where: { isDeleted: false },
            order: [["date", "DESC"]],
        });
        return ReS(res, { success: true, data: records }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchAll = fetchAll;

// ✅ Fetch single by ID
var fetchSingle = async function (req, res) {
    try {
        const { id } = req.params;
        if (!id) return ReE(res, "ID is required", 400);

        const record = await model.Meeting.findByPk(id);
        if (!record) return ReE(res, "Record not found", 404);

        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchSingle = fetchSingle;

// ✅ Fetch all meetings for a company (with summary + upcoming, matching I2 dashboard)
var fetchByCompany = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const records = await model.Meeting.findAll({
            where: { companyId, isDeleted: false },
            order: [["date", "DESC"]],
        });

        const summary = {
            total: records.length,
            upcoming: records.filter((m) => m.status === "Upcoming").length,
            completed: records.filter((m) => m.status === "Completed").length,
            cancelled: records.filter((m) => m.status === "Cancelled").length,
            rescheduled: records.filter((m) => m.status === "Rescheduled").length,
        };

        const typeCounts = {};
        records.forEach((m) => {
            typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
        });

        const upcomingMeetings = records
            .filter((m) => m.status === "Upcoming")
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);

        return ReS(res, {
            companyId: parseInt(companyId),
            summary,
            typeCounts,
            upcomingMeetings,
            meetings: records,
        }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchByCompany = fetchByCompany;

// ✅ Update (edit meeting / update status e.g. Upcoming → Completed/Cancelled/Rescheduled)
var updateRecord = async function (req, res) {
    try {
        const record = await model.Meeting.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update(req.body);
        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateRecord = updateRecord;

// ✅ Soft delete
var deleteRecord = async function (req, res) {
    try {
        const record = await model.Meeting.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update({ isDeleted: true });
        return ReS(res, { message: "Record deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteRecord = deleteRecord;

// ✅ Duplicate a meeting (matches "duplicateMeeting" — new Upcoming meeting, date pushed 7 days out)
var duplicateRecord = async function (req, res) {
    try {
        const record = await model.Meeting.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        const plain = record.get({ plain: true });
        delete plain.id;
        delete plain.createdAt;
        delete plain.updatedAt;
        plain.status = "Upcoming";
        plain.date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const duplicate = await model.Meeting.create(plain);
        return ReS(res, duplicate, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.duplicateRecord = duplicateRecord;

// ✅ Upload supporting document (adds to documents array)
var uploadDocument = async function (req, res) {
    try {
        const { id } = req.params;
        if (!id) return ReE(res, "id is required", 400);
        if (!req.file) return ReE(res, "No file uploaded", 400);

        const record = await model.Meeting.findByPk(id);
        if (!record) return ReE(res, "Record not found", 404);

        const newDoc = {
            name: req.file.originalname,
            url: req.file.location,
            size: req.file.size,
        };
        const documents = [...(record.documents || []), newDoc];

        await record.update({ documents });
        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.uploadDocument = uploadDocument;