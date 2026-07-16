"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Create M3 record for a company
var add = async function (req, res) {
    try {
        const { companyId } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const existing = await model.BusinessOpportunity.findOne({ where: { companyId, isDeleted: false } });
        if (existing) return ReE(res, "Business Opportunity record already exists for this company", 409);

        if (req.body.opportunityScore !== undefined) {
            const score = parseInt(req.body.opportunityScore);
            if (isNaN(score) || score < 0 || score > 100) {
                return ReE(res, "opportunityScore must be between 0 and 100", 400);
            }
        }

        const record = await model.BusinessOpportunity.create(req.body);
        return ReS(res, record, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.add = add;

// ✅ Fetch all (with pain points)
var fetchAll = async function (req, res) {
    try {
        const records = await model.BusinessOpportunity.findAll({
            where: { isDeleted: false },
            include: [{ model: model.PainPoint, where: { isDeleted: false }, required: false }],
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

        const record = await model.BusinessOpportunity.findByPk(id, {
            include: [{ model: model.PainPoint, where: { isDeleted: false }, required: false }],
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

        const record = await model.BusinessOpportunity.findOne({
            where: { companyId, isDeleted: false },
            include: [{ model: model.PainPoint, where: { isDeleted: false }, required: false }],
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
        const record = await model.BusinessOpportunity.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        if (req.body.opportunityScore !== undefined) {
            const score = parseInt(req.body.opportunityScore);
            if (isNaN(score) || score < 0 || score > 100) {
                return ReE(res, "opportunityScore must be between 0 and 100", 400);
            }
        }

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
        const record = await model.BusinessOpportunity.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update({ isDeleted: true });
        return ReS(res, { message: "Record deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteRecord = deleteRecord;

// ───── Pain Points ─────

var addPainPoint = async function (req, res) {
    try {
        const { businessOpportunityId, name } = req.body;
        if (!businessOpportunityId || !name) return ReE(res, "businessOpportunityId and name are required", 400);

        const painPoint = await model.PainPoint.create(req.body);
        return ReS(res, painPoint, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addPainPoint = addPainPoint;

var updatePainPoint = async function (req, res) {
    try {
        const painPoint = await model.PainPoint.findByPk(req.params.id);
        if (!painPoint) return ReE(res, "Pain point not found", 404);

        await painPoint.update(req.body);
        return ReS(res, painPoint, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updatePainPoint = updatePainPoint;

var deletePainPoint = async function (req, res) {
    try {
        const painPoint = await model.PainPoint.findByPk(req.params.id);
        if (!painPoint) return ReE(res, "Pain point not found", 404);

        await painPoint.update({ isDeleted: true });
        return ReS(res, { message: "Pain point deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deletePainPoint = deletePainPoint;