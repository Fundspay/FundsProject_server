"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Create A1 record for a company
var add = async function (req, res) {
    try {
        const { companyId, companyName, industry } = req.body;
        if (!companyId || !companyName || !industry) {
            return ReE(res, "companyId, companyName, and industry are required", 400);
        }

        const existing = await model.CompanyIntelligence.findOne({ where: { companyId, isDeleted: false } });
        if (existing) return ReE(res, "Company Intelligence record already exists for this company", 409);

        const record = await model.CompanyIntelligence.create(req.body);
        return ReS(res, record, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.add = add;

// ✅ Fetch all
var fetchAll = async function (req, res) {
    try {
        const records = await model.CompanyIntelligence.findAll({ where: { isDeleted: false } });
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

        const record = await model.CompanyIntelligence.findByPk(id);
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

        const record = await model.CompanyIntelligence.findOne({ where: { companyId, isDeleted: false } });
        if (!record) return ReE(res, "Record not found for this company", 404);

        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchByCompany = fetchByCompany;

// ✅ Update record
var updateRecord = async function (req, res) {
    try {
        const record = await model.CompanyIntelligence.findByPk(req.params.id);
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
        const record = await model.CompanyIntelligence.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update({ isDeleted: true });
        return ReS(res, { message: "Record deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteRecord = deleteRecord;

// ✅ Upload logo (real S3 upload)
var uploadLogo = async function (req, res) {
    try {
        const { companyId } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);
        if (!req.file) return ReE(res, "No file uploaded", 400);

        let record = await model.CompanyIntelligence.findOne({ where: { companyId, isDeleted: false } });
        if (!record) return ReE(res, "Company Intelligence record not found for this company. Create it first via /add", 404);

        await record.update({ logoUrl: req.file.location });
        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.uploadLogo = uploadLogo;