"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Create Industry Profile (M1) for a company
var add = async function (req, res) {
    try {
        const { companyId, sector, subSector, businessType } = req.body;
        if (!companyId || !sector || !subSector || !businessType) {
            return ReE(res, "companyId, sector, subSector, and businessType are required", 400);
        }

        const existing = await model.IndustryProfile.findOne({ where: { companyId, isDeleted: false } });
        if (existing) return ReE(res, "Industry Profile already exists for this company", 409);

        const record = await model.IndustryProfile.create(req.body);
        return ReS(res, record, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.add = add;

// ✅ Fetch all
var fetchAll = async function (req, res) {
    try {
        const records = await model.IndustryProfile.findAll({ where: { isDeleted: false } });
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

        const record = await model.IndustryProfile.findByPk(id);
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

        const record = await model.IndustryProfile.findOne({ where: { companyId, isDeleted: false } });
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
        const record = await model.IndustryProfile.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        if (req.body.revenueMin && req.body.revenueMax) {
            if (parseFloat(req.body.revenueMin) > parseFloat(req.body.revenueMax)) {
                return ReE(res, "revenueMin cannot exceed revenueMax", 400);
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
        const record = await model.IndustryProfile.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update({ isDeleted: true });
        return ReS(res, { message: "Record deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteRecord = deleteRecord;