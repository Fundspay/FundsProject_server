"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Create A3 record for a company
var add = async function (req, res) {
    try {
        const { companyId } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const existing = await model.CompanyResearch.findOne({ where: { companyId, isDeleted: false } });
        if (existing) return ReE(res, "Company Research record already exists for this company", 409);

        if (req.body.qualificationScore !== undefined) {
            const score = parseInt(req.body.qualificationScore);
            if (isNaN(score) || score < 0 || score > 100) {
                return ReE(res, "qualificationScore must be between 0 and 100", 400);
            }
        }

        const record = await model.CompanyResearch.create(req.body);
        return ReS(res, record, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.add = add;

// ✅ Fetch all
var fetchAll = async function (req, res) {
    try {
        const records = await model.CompanyResearch.findAll({ where: { isDeleted: false } });
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

        const record = await model.CompanyResearch.findByPk(id);
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

        const record = await model.CompanyResearch.findOne({ where: { companyId, isDeleted: false } });
        if (!record) return ReE(res, "Record not found for this company", 404);

        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchByCompany = fetchByCompany;

// ✅ Update
var updateRecord = async function (req, res) {
    try {
        const record = await model.CompanyResearch.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        if (req.body.qualificationScore !== undefined) {
            const score = parseInt(req.body.qualificationScore);
            if (isNaN(score) || score < 0 || score > 100) {
                return ReE(res, "qualificationScore must be between 0 and 100", 400);
            }
        }

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
        const record = await model.CompanyResearch.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update({ isDeleted: true });
        return ReS(res, { message: "Record deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteRecord = deleteRecord;

// ✅ Upload a research document (adds to researchDocuments array)
var uploadDocument = async function (req, res) {
    try {
        const { companyId } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);
        if (!req.file) return ReE(res, "No file uploaded", 400);

        let record = await model.CompanyResearch.findOne({ where: { companyId, isDeleted: false } });
        if (!record) {
            record = await model.CompanyResearch.create({ companyId });
        }

        const newDoc = {
            name: req.file.originalname,
            url: req.file.location,
            size: req.file.size,
        };
        const researchDocuments = [...(record.researchDocuments || []), newDoc];

        await record.update({ researchDocuments });
        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.uploadDocument = uploadDocument;