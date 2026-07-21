"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ───── Helper: generate a new opportunity code (OPP-YYYY-NNN) ─────
async function generateOpportunityCode() {
    const year = new Date().getFullYear();
    const count = await model.Opportunity.count({ where: {} }); // includes soft-deleted on purpose, so codes never collide
    const next = String(count + 1).padStart(3, "0");
    return `OPP-${year}-${next}`;
}

// ✅ Create a new opportunity
var add = async function (req, res) {
    try {
        const { companyId, name, contactName, solutions } = req.body;
        if (!companyId || !name) {
            return ReE(res, "companyId and name are required", 400);
        }
        if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
            return ReE(res, "At least one solution type is required", 400);
        }

        const opportunityCode = req.body.opportunityCode || (await generateOpportunityCode());

        const record = await model.Opportunity.create({ ...req.body, opportunityCode });
        return ReS(res, record, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.add = add;

// ✅ Get a freshly generated opportunity code (for "New ID" button)
var getNewCode = async function (req, res) {
    try {
        const opportunityCode = await generateOpportunityCode();
        return ReS(res, { opportunityCode }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getNewCode = getNewCode;

// ✅ Fetch all
var fetchAll = async function (req, res) {
    try {
        const records = await model.Opportunity.findAll({
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

        const record = await model.Opportunity.findByPk(id);
        if (!record) return ReE(res, "Record not found", 404);

        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchSingle = fetchSingle;

// ✅ Fetch all opportunities for a company (with summary panels: status, revenue, source breakdown)
var fetchByCompany = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const records = await model.Opportunity.findAll({
            where: { companyId, isDeleted: false },
            order: [["createdAt", "DESC"]],
        });

        const opportunities = records.map((r) => r.get({ plain: true }));

        const statusSummary = {
            total: opportunities.length,
            active: opportunities.filter((o) => o.status === "Active").length,
            onHold: opportunities.filter((o) => o.status === "On Hold").length,
            won: opportunities.filter((o) => o.status === "Won").length,
            lost: opportunities.filter((o) => o.status === "Lost").length,
        };

        const sourceCounts = {};
        opportunities.forEach((o) => {
            if (o.source) sourceCounts[o.source] = (sourceCounts[o.source] || 0) + 1;
        });

        const totalPipeline = opportunities.reduce((sum, o) => sum + parseFloat(o.estimatedRevenue || o.estimatedBudget || 0), 0);
        const wonRevenue = opportunities
            .filter((o) => o.status === "Won")
            .reduce((sum, o) => sum + parseFloat(o.estimatedRevenue || o.estimatedBudget || 0), 0);
        const activePipeline = opportunities
            .filter((o) => o.status === "Active")
            .reduce((sum, o) => sum + parseFloat(o.estimatedRevenue || o.estimatedBudget || 0), 0);
        const avgDealSize = opportunities.length > 0 ? totalPipeline / opportunities.length : 0;

        return ReS(res, {
            companyId: parseInt(companyId),
            statusSummary,
            sourceCounts,
            revenueSummary: {
                totalPipeline,
                wonRevenue,
                activePipeline,
                avgDealSize,
            },
            opportunities,
        }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchByCompany = fetchByCompany;

// ✅ Update
var updateRecord = async function (req, res) {
    try {
        const record = await model.Opportunity.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update(req.body);
        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateRecord = updateRecord;

// ✅ Mark as Won
var markAsWon = async function (req, res) {
    try {
        const record = await model.Opportunity.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update({ status: "Won" });
        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.markAsWon = markAsWon;

// ✅ Mark as Lost
var markAsLost = async function (req, res) {
    try {
        const record = await model.Opportunity.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update({ status: "Lost" });
        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.markAsLost = markAsLost;

// ✅ Soft delete
var deleteRecord = async function (req, res) {
    try {
        const record = await model.Opportunity.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update({ isDeleted: true });
        return ReS(res, { message: "Record deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteRecord = deleteRecord;

// ✅ Duplicate an opportunity (matches "duplicateOpportunity" — new code, status reset to Active, " (Copy)" appended)
var duplicateRecord = async function (req, res) {
    try {
        const record = await model.Opportunity.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        const plain = record.get({ plain: true });
        delete plain.id;
        delete plain.createdAt;
        delete plain.updatedAt;
        plain.opportunityCode = await generateOpportunityCode();
        plain.status = "Active";
        plain.name = plain.name + " (Copy)";

        const duplicate = await model.Opportunity.create(plain);
        return ReS(res, duplicate, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.duplicateRecord = duplicateRecord;

// ✅ Upload attachment (adds to attachments array)
var uploadAttachment = async function (req, res) {
    try {
        const { id } = req.params;
        if (!id) return ReE(res, "id is required", 400);
        if (!req.file) return ReE(res, "No file uploaded", 400);

        const record = await model.Opportunity.findByPk(id);
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