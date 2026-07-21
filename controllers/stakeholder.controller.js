"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Add a stakeholder/contact for a company
var add = async function (req, res) {
    try {
        const { companyId, contactName, designation, department, decisionLevel, mobileNumber, officialEmail } = req.body;
        if (!companyId || !contactName || !designation || !department || !decisionLevel || !mobileNumber || !officialEmail) {
            return ReE(res, "companyId, contactName, designation, department, decisionLevel, mobileNumber, and officialEmail are required", 400);
        }

        const stakeholder = await model.Stakeholder.create(req.body);
        return ReS(res, stakeholder, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.add = add;

// ✅ Fetch all
var fetchAll = async function (req, res) {
    try {
        const records = await model.Stakeholder.findAll({ where: { isDeleted: false } });
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

        const record = await model.Stakeholder.findByPk(id);
        if (!record) return ReE(res, "Stakeholder not found", 404);

        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchSingle = fetchSingle;

// ✅ Fetch all stakeholders for a company (+ synopsis stats)
var fetchByCompany = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const records = await model.Stakeholder.findAll({
            where: { companyId, isDeleted: false },
            order: [["createdAt", "ASC"]],
        });

        const synopsis = {
            total: records.length,
            decisionMakers: records.filter((r) => r.decisionLevel === "Decision Maker").length,
            influencers: records.filter((r) => r.decisionLevel === "Influencer").length,
            gatekeepers: records.filter((r) => r.decisionLevel === "Gatekeeper").length,
            endUsers: records.filter((r) => r.decisionLevel === "End User").length,
            departments: [...new Set(records.map((r) => r.department))].length,
            primaryContact: records.find((r) => r.isPrimaryContact)?.contactName || null,
        };

        return ReS(res, { companyId: parseInt(companyId), synopsis, contacts: records }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchByCompany = fetchByCompany;

// ✅ Update
var updateRecord = async function (req, res) {
    try {
        const record = await model.Stakeholder.findByPk(req.params.id);
        if (!record) return ReE(res, "Stakeholder not found", 404);

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
        const record = await model.Stakeholder.findByPk(req.params.id);
        if (!record) return ReE(res, "Stakeholder not found", 404);

        await record.update({ isDeleted: true });
        return ReS(res, { message: "Stakeholder deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteRecord = deleteRecord;

// ✅ Upload profile photo
var uploadPhoto = async function (req, res) {
    try {
        const { id } = req.body;
        if (!id) return ReE(res, "id (stakeholder ID) is required", 400);
        if (!req.file) return ReE(res, "No file uploaded", 400);

        const record = await model.Stakeholder.findByPk(id);
        if (!record) return ReE(res, "Stakeholder not found", 404);

        await record.update({ photoUrl: req.file.location });
        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.uploadPhoto = uploadPhoto;

// ✅ Upload an attachment (adds to the attachments array)
var uploadAttachment = async function (req, res) {
    try {
        const { id } = req.body;
        if (!id) return ReE(res, "id (stakeholder ID) is required", 400);
        if (!req.file) return ReE(res, "No file uploaded", 400);

        const record = await model.Stakeholder.findByPk(id);
        if (!record) return ReE(res, "Stakeholder not found", 404);

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