"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Log a new communication
var add = async function (req, res) {
    try {
        const { companyId, contactName, type, subject } = req.body;
        if (!companyId || !contactName || !type || !subject) {
            return ReE(res, "companyId, contactName, type, and subject are required", 400);
        }

        const record = await model.CommunicationLog.create(req.body);
        return ReS(res, record, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.add = add;

// ✅ Fetch all
var fetchAll = async function (req, res) {
    try {
        const records = await model.CommunicationLog.findAll({
            where: { isDeleted: false },
            order: [["createdAt", "DESC"]],
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

        const record = await model.CommunicationLog.findByPk(id);
        if (!record) return ReE(res, "Record not found", 404);

        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchSingle = fetchSingle;

// ✅ Fetch all logs for a company (with summary counts, matching the I1 dashboard's page-stats)
var fetchByCompany = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const records = await model.CommunicationLog.findAll({
            where: { companyId, isDeleted: false },
            order: [["createdAt", "DESC"]],
        });

        const summary = {
            total: records.length,
            sent: records.filter((r) => r.status === "Sent" || r.status === "Delivered").length,
            replied: records.filter((r) => r.status === "Replied").length,
            draft: records.filter((r) => r.status === "Draft").length,
            failed: records.filter((r) => r.status === "Failed").length,
            read: records.filter((r) => r.status === "Read").length,
            delivered: records.filter((r) => r.status === "Delivered").length,
        };

        const typeCounts = {};
        records.forEach((r) => {
            typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
        });

        return ReS(res, {
            companyId: parseInt(companyId),
            summary,
            typeCounts,
            logs: records,
        }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchByCompany = fetchByCompany;

// ✅ Update (edit log / update status e.g. Sent → Delivered → Read → Replied)
var updateRecord = async function (req, res) {
    try {
        const record = await model.CommunicationLog.findByPk(req.params.id);
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
        const record = await model.CommunicationLog.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update({ isDeleted: true });
        return ReS(res, { message: "Record deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteRecord = deleteRecord;

// ✅ Duplicate a log as a new Draft (matches "duplicateLog" in frontend)
var duplicateRecord = async function (req, res) {
    try {
        const record = await model.CommunicationLog.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        const plain = record.get({ plain: true });
        delete plain.id;
        delete plain.createdAt;
        delete plain.updatedAt;
        plain.status = "Draft";

        const duplicate = await model.CommunicationLog.create(plain);
        return ReS(res, duplicate, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.duplicateRecord = duplicateRecord;

// ✅ Upload attachment (adds to attachments array, mirrors AIM A3's uploadDocument pattern)
var uploadAttachment = async function (req, res) {
    try {
        const { id } = req.params;
        if (!id) return ReE(res, "id is required", 400);
        if (!req.file) return ReE(res, "No file uploaded", 400);

        const record = await model.CommunicationLog.findByPk(id);
        if (!record) return ReE(res, "Record not found", 404);

        const newAttachment = {
            name: req.file.originalname,
            url: req.file.location,
            size: req.file.size,
        };
        const attachments = [...(record.attachments || []), newAttachment];

        await record.update({ attachments });
        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.uploadAttachment = uploadAttachment;