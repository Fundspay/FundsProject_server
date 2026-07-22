"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ───── Helper: generate proposal number (PROP-YYYY-NNN) ─────
async function generateProposalNumber() {
    const year = new Date().getFullYear();
    const count = await model.Proposal.count({ where: {} });
    const next = String(count + 1).padStart(3, "0");
    return `PROP-${year}-${next}`;
}

// ✅ Get a freshly generated proposal number (for "New Proposal" button)
var getNewNumber = async function (req, res) {
    try {
        const proposalNumber = await generateProposalNumber();
        return ReS(res, { proposalNumber }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getNewNumber = getNewNumber;

// ✅ Get proposal for a given opportunity (auto-provisions a draft if none exists)
var getByOpportunity = async function (req, res) {
    try {
        const { opportunityId } = req.params;
        if (!opportunityId) return ReE(res, "opportunityId is required", 400);

        const opportunity = await model.Opportunity.findByPk(opportunityId);
        if (!opportunity) return ReE(res, "Opportunity not found", 404);

        let proposal = await model.Proposal.findOne({ where: { opportunityId, isDeleted: false } });

        if (!proposal) {
            const proposalNumber = await generateProposalNumber();
            proposal = await model.Proposal.create({
                companyId: opportunity.companyId,
                opportunityId,
                proposalNumber,
            });
        }

        return ReS(res, proposal.get({ plain: true }), 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getByOpportunity = getByOpportunity;

// ✅ Get all proposals for a company (table + summary panels)
var fetchByCompany = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const { status, search, page = 1, limit = 10 } = req.query;

        const proposals = await model.Proposal.findAll({
            where: { companyId, isDeleted: false },
            include: [{ model: model.Opportunity, attributes: ["id", "opportunityCode", "name"] }],
            order: [["updatedAt", "DESC"]],
        });

        let records = proposals.map((p) => p.get({ plain: true }));

        if (status && status !== "all") {
            records = records.filter((r) => r.status === status);
        }
        if (search) {
            const s = search.toLowerCase();
            records = records.filter(
                (r) =>
                    r.proposalNumber.toLowerCase().includes(s) ||
                    (r.Opportunity && r.Opportunity.name.toLowerCase().includes(s))
            );
        }

        const total = records.length;
        const start = (parseInt(page) - 1) * parseInt(limit);
        const end = start + parseInt(limit);
        const pageItems = records.slice(start, end);

        // ── Deal summary ──
        const dealSummary = {
            total: records.length,
            won: records.filter((r) => r.status === "Won").length,
            onHold: records.filter((r) => r.status === "On Hold").length,
            lost: records.filter((r) => r.status === "Lost").length,
            cancelled: records.filter((r) => r.status === "Cancelled").length,
        };

        // ── Financial summary ──
        const totalValue = records.reduce((s, r) => s + parseFloat(r.finalDealValue || 0), 0);
        const wonValue = records.filter((r) => r.status === "Won").reduce((s, r) => s + parseFloat(r.finalDealValue || 0), 0);
        const onHoldValue = records.filter((r) => r.status === "On Hold").reduce((s, r) => s + parseFloat(r.finalDealValue || 0), 0);
        const avgDealSize = records.length > 0 ? totalValue / records.length : 0;

        // ── Document status ──
        const documentSummary = {
            proposalDocs: records.filter((r) => (r.proposalDocs || []).length > 0).length,
            quotationDocs: records.filter((r) => (r.quotationDocs || []).length > 0).length,
            contractDocs: records.filter((r) => (r.contractDocs || []).length > 0).length,
            ndaDocs: records.filter((r) => (r.ndaDocs || []).length > 0).length,
            poDocs: records.filter((r) => (r.poDocs || []).length > 0).length,
        };

        return ReS(res, {
            companyId: parseInt(companyId),
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            dealSummary,
            financialSummary: { totalValue, wonValue, onHoldValue, avgDealSize },
            documentSummary,
            proposals: pageItems,
        }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchByCompany = fetchByCompany;

// ✅ Save / update proposal (bumps version on every update, matching frontend's V1->V2 behavior)
var saveProposal = async function (req, res) {
    try {
        const { opportunityId } = req.body;
        if (!opportunityId) return ReE(res, "opportunityId is required", 400);
        if (req.body.finalDealValue === undefined || parseFloat(req.body.finalDealValue) <= 0) {
            return ReE(res, "finalDealValue must be greater than 0", 400);
        }

        const opportunity = await model.Opportunity.findByPk(opportunityId);
        if (!opportunity) return ReE(res, "Opportunity not found", 404);

        let proposal = await model.Proposal.findOne({ where: { opportunityId, isDeleted: false } });

        if (!proposal) {
            const proposalNumber = req.body.proposalNumber || (await generateProposalNumber());
            proposal = await model.Proposal.create({
                companyId: opportunity.companyId,
                opportunityId,
                proposalNumber,
                ...req.body,
                version: 1,
            });
            return ReS(res, proposal, 201);
        }

        await proposal.update({ ...req.body, version: proposal.version + 1 });
        return ReS(res, proposal, 200);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.saveProposal = saveProposal;

// ✅ Mark as Won
var markAsWon = async function (req, res) {
    try {
        const proposal = await model.Proposal.findByPk(req.params.id);
        if (!proposal) return ReE(res, "Proposal not found", 404);

        await proposal.update({ status: "Won" });
        await model.Opportunity.update({ status: "Won" }, { where: { id: proposal.opportunityId } });

        return ReS(res, proposal, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.markAsWon = markAsWon;

// ✅ Mark as Lost
var markAsLost = async function (req, res) {
    try {
        const proposal = await model.Proposal.findByPk(req.params.id);
        if (!proposal) return ReE(res, "Proposal not found", 404);

        await proposal.update({ status: "Lost" });
        await model.Opportunity.update({ status: "Lost" }, { where: { id: proposal.opportunityId } });

        return ReS(res, proposal, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.markAsLost = markAsLost;

// ✅ Handover to BUILD (requires status === Won; stores a placeholder buildProjectId until the BUILD module exists)
var handoverToBuild = async function (req, res) {
    try {
        const proposal = await model.Proposal.findByPk(req.params.id);
        if (!proposal) return ReE(res, "Proposal not found", 404);

        if (proposal.status !== "Won") {
            return ReE(res, "Deal must be marked as Won before handover to BUILD", 400);
        }
        if (proposal.handedOverToBuild) {
            return ReE(res, "This proposal has already been handed over to BUILD", 400);
        }

        const year = new Date().getFullYear();
        const buildProjectId = `BUILD-${year}-${String(proposal.id).padStart(3, "0")}`;

        await proposal.update({
            handedOverToBuild: true,
            buildProjectId,
            handedOverAt: new Date(),
        });

        return ReS(res, proposal, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.handoverToBuild = handoverToBuild;

// ✅ Soft delete
var deleteProposal = async function (req, res) {
    try {
        const proposal = await model.Proposal.findByPk(req.params.id);
        if (!proposal) return ReE(res, "Proposal not found", 404);

        await proposal.update({ isDeleted: true });
        return ReS(res, { message: "Proposal deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteProposal = deleteProposal;

// ───── Attachments (5 categories) ─────

const attachmentFieldMap = {
    proposal: "proposalDocs",
    quotation: "quotationDocs",
    contract: "contractDocs",
    nda: "ndaDocs",
    po: "poDocs",
};

// ✅ Upload attachment to a specific category
var uploadAttachment = async function (req, res) {
    try {
        const { id, category } = req.params;
        const field = attachmentFieldMap[category];
        if (!field) return ReE(res, "Invalid attachment category", 400);
        if (!req.file) return ReE(res, "No file uploaded", 400);

        const proposal = await model.Proposal.findByPk(id);
        if (!proposal) return ReE(res, "Proposal not found", 404);

        const newFile = { name: req.file.originalname, url: req.file.location, size: req.file.size };
        const updated = [...(proposal[field] || []), newFile];

        await proposal.update({ [field]: updated });
        return ReS(res, proposal, 200);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.uploadAttachment = uploadAttachment;

// ✅ Remove a single attachment from a category (matches the chip's "x" button)
var removeAttachment = async function (req, res) {
    try {
        const { id, category } = req.params;
        const { name } = req.body;
        const field = attachmentFieldMap[category];
        if (!field) return ReE(res, "Invalid attachment category", 400);
        if (!name) return ReE(res, "name is required", 400);

        const proposal = await model.Proposal.findByPk(id);
        if (!proposal) return ReE(res, "Proposal not found", 404);

        const updated = (proposal[field] || []).filter((f) => f.name !== name);
        await proposal.update({ [field]: updated });

        return ReS(res, proposal, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.removeAttachment = removeAttachment;

