"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Create A3 record for a company
var add = async function (req, res) {
    try {
        const { companyId } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const existing = await model.TechnicalArchitecture.findOne({ where: { companyId, isDeleted: false } });
        if (existing) return ReE(res, "Technical Architecture record already exists for this company", 409);

        const record = await model.TechnicalArchitecture.create(req.body);
        return ReS(res, record, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.add = add;

// ✅ Fetch all (with children)
var fetchAll = async function (req, res) {
    try {
        const records = await model.TechnicalArchitecture.findAll({
            where: { isDeleted: false },
            include: [
                { model: model.ThirdPartyIntegration, where: { isDeleted: false }, required: false },
                { model: model.TechnicalRisk, where: { isDeleted: false }, required: false },
                { model: model.ReferenceDocument, where: { isDeleted: false }, required: false },
            ],
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

        const record = await model.TechnicalArchitecture.findByPk(id, {
            include: [
                { model: model.ThirdPartyIntegration, where: { isDeleted: false }, required: false },
                { model: model.TechnicalRisk, where: { isDeleted: false }, required: false },
                { model: model.ReferenceDocument, where: { isDeleted: false }, required: false },
            ],
        });
        if (!record) return ReE(res, "Record not found", 404);

        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchSingle = fetchSingle;

// ✅ Fetch by companyId
var fetchByCompany = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const record = await model.TechnicalArchitecture.findOne({
            where: { companyId, isDeleted: false },
            include: [
                { model: model.ThirdPartyIntegration, where: { isDeleted: false }, required: false },
                { model: model.TechnicalRisk, where: { isDeleted: false }, required: false },
                { model: model.ReferenceDocument, where: { isDeleted: false }, required: false },
            ],
        });
        if (!record) return ReE(res, "Record not found for this company", 404);

        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchByCompany = fetchByCompany;

// ✅ Update main record
var updateRecord = async function (req, res) {
    try {
        const record = await model.TechnicalArchitecture.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update(req.body);
        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateRecord = updateRecord;

// ✅ Soft delete main record
var deleteRecord = async function (req, res) {
    try {
        const record = await model.TechnicalArchitecture.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update({ isDeleted: true });
        return ReS(res, { message: "Record deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteRecord = deleteRecord;

// ───── Third-Party Integrations ─────

var addIntegration = async function (req, res) {
    try {
        const { technicalArchitectureId, name } = req.body;
        if (!technicalArchitectureId || !name) return ReE(res, "technicalArchitectureId and name are required", 400);

        const integration = await model.ThirdPartyIntegration.create(req.body);
        return ReS(res, integration, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addIntegration = addIntegration;

var updateIntegration = async function (req, res) {
    try {
        const integration = await model.ThirdPartyIntegration.findByPk(req.params.id);
        if (!integration) return ReE(res, "Integration not found", 404);

        await integration.update(req.body);
        return ReS(res, integration, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateIntegration = updateIntegration;

var deleteIntegration = async function (req, res) {
    try {
        const integration = await model.ThirdPartyIntegration.findByPk(req.params.id);
        if (!integration) return ReE(res, "Integration not found", 404);

        await integration.update({ isDeleted: true });
        return ReS(res, { message: "Integration deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteIntegration = deleteIntegration;

// ───── Technical Risks ─────

var addRisk = async function (req, res) {
    try {
        const { technicalArchitectureId, name } = req.body;
        if (!technicalArchitectureId || !name) return ReE(res, "technicalArchitectureId and name are required", 400);

        const risk = await model.TechnicalRisk.create(req.body);
        return ReS(res, risk, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addRisk = addRisk;

var updateRisk = async function (req, res) {
    try {
        const risk = await model.TechnicalRisk.findByPk(req.params.id);
        if (!risk) return ReE(res, "Risk not found", 404);

        await risk.update(req.body);
        return ReS(res, risk, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateRisk = updateRisk;

var deleteRisk = async function (req, res) {
    try {
        const risk = await model.TechnicalRisk.findByPk(req.params.id);
        if (!risk) return ReE(res, "Risk not found", 404);

        await risk.update({ isDeleted: true });
        return ReS(res, { message: "Risk deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteRisk = deleteRisk;

// ───── Reference Documents ─────

// Add via URL
var addReferenceUrl = async function (req, res) {
    try {
        const { technicalArchitectureId, url } = req.body;
        if (!technicalArchitectureId || !url) return ReE(res, "technicalArchitectureId and url are required", 400);

        const doc = await model.ReferenceDocument.create({
            technicalArchitectureId,
            docType: "url",
            url,
        });
        return ReS(res, doc, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addReferenceUrl = addReferenceUrl;

// Upload real file to S3
var uploadReferenceFile = async function (req, res) {
    try {
        const { technicalArchitectureId } = req.body;
        if (!technicalArchitectureId) return ReE(res, "technicalArchitectureId is required", 400);
        if (!req.file) return ReE(res, "No file uploaded", 400);

        const doc = await model.ReferenceDocument.create({
            technicalArchitectureId,
            docType: "file",
            name: req.file.originalname,
            url: req.file.location,
            fileSize: req.file.size,
        });

        return ReS(res, doc, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.uploadReferenceFile = uploadReferenceFile;

var deleteReference = async function (req, res) {
    try {
        const doc = await model.ReferenceDocument.findByPk(req.params.id);
        if (!doc) return ReE(res, "Document not found", 404);

        await doc.update({ isDeleted: true });
        return ReS(res, { message: "Document deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteReference = deleteReference;