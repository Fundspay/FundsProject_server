"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

const STAGES = ["C1", "C2", "C3", "C4"];
const STAGE_NAMES = { C1: "Connect", C2: "Clarity", C3: "Collaboration", C4: "Customer" };

// ───── Helper: log a stage-history entry ─────
async function logHistory(opportunityId, stage, note) {
    return model.StageHistory.create({
        opportunityId,
        stage,
        note: note || `Moved to ${stage} - ${STAGE_NAMES[stage] || stage}`,
    });
}

// ✅ Get journey for a single opportunity (creates a default C1 record if none exists yet)
var getByOpportunity = async function (req, res) {
    try {
        const { opportunityId } = req.params;
        if (!opportunityId) return ReE(res, "opportunityId is required", 400);

        const opportunity = await model.Opportunity.findByPk(opportunityId);
        if (!opportunity) return ReE(res, "Opportunity not found", 404);

        let journey = await model.Journey.findOne({ where: { opportunityId, isDeleted: false } });

        if (!journey) {
            journey = await model.Journey.create({
                companyId: opportunity.companyId,
                opportunityId,
                stage: "C1",
            });
            await logHistory(opportunityId, "C1", "Journey initiated - Connect");
        }

        return ReS(res, journey.get({ plain: true }), 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getByOpportunity = getByOpportunity;

// ✅ Get all journeys for a company (table + summary panels)
var fetchByCompany = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const { stage, search, page = 1, limit = 10 } = req.query;

        const journeys = await model.Journey.findAll({
            where: { companyId, isDeleted: false },
            include: [{ model: model.Opportunity, attributes: ["id", "opportunityCode", "name"] }],
            order: [["updatedAt", "DESC"]],
        });

        let records = journeys.map((j) => j.get({ plain: true }));

        if (stage && stage !== "all") {
            records = records.filter((r) => r.stage === stage);
        }
        if (search) {
            const s = search.toLowerCase();
            records = records.filter(
                (r) => r.Opportunity && r.Opportunity.name.toLowerCase().includes(s)
            );
        }

        const total = records.length;
        const start = (parseInt(page) - 1) * parseInt(limit);
        const end = start + parseInt(limit);
        const pageItems = records.slice(start, end);

        // ── Stage summary ──
        const stageSummary = { C1: 0, C2: 0, C3: 0, C4: 0 };
        records.forEach((r) => { if (stageSummary[r.stage] !== undefined) stageSummary[r.stage]++; });

        // ── Risk summary ──
        const riskSummary = { Low: 0, Medium: 0, High: 0 };
        records.forEach((r) => { if (riskSummary[r.riskLevel] !== undefined) riskSummary[r.riskLevel]++; });

        // ── Demo status summary ──
        const demoSummary = { Pending: 0, Scheduled: 0, Completed: 0 };
        records.forEach((r) => { if (demoSummary[r.demoStatus] !== undefined) demoSummary[r.demoStatus]++; });

        // ── Clarity ──
        const clarityComplete = records.filter((r) => r.reqClarity === "Complete").length;

        // ── Avg probability ──
        const avgProbability = records.length > 0
            ? Math.round(records.reduce((sum, r) => sum + (r.probability || 0), 0) / records.length)
            : 0;

        return ReS(res, {
            companyId: parseInt(companyId),
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            stageSummary,
            riskSummary,
            demoSummary,
            clarityComplete,
            avgProbability,
            journeys: pageItems,
        }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchByCompany = fetchByCompany;

// ✅ Save / update journey (full form save)
var saveJourney = async function (req, res) {
    try {
        const { opportunityId } = req.body;
        if (!opportunityId) return ReE(res, "opportunityId is required", 400);

        const opportunity = await model.Opportunity.findByPk(opportunityId);
        if (!opportunity) return ReE(res, "Opportunity not found", 404);

        const [journey, created] = await model.Journey.findOrCreate({
            where: { opportunityId, isDeleted: false },
            defaults: { companyId: opportunity.companyId, ...req.body },
        });

        if (!created) {
            await journey.update(req.body);
        }

        return ReS(res, journey.get({ plain: true }), created ? 201 : 200);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.saveJourney = saveJourney;

// ✅ Move to next stage (C1 -> C2 -> C3 -> C4), logs history
var moveToNextStage = async function (req, res) {
    try {
        const { opportunityId } = req.body;
        if (!opportunityId) return ReE(res, "opportunityId is required", 400);

        const journey = await model.Journey.findOne({ where: { opportunityId, isDeleted: false } });
        if (!journey) return ReE(res, "Journey not found for this opportunity", 404);

        const idx = STAGES.indexOf(journey.stage);
        if (idx === STAGES.length - 1) {
            return ReE(res, "Already at final stage (C4)", 400);
        }

        const nextStage = STAGES[idx + 1];
        await journey.update({ stage: nextStage });
        await logHistory(opportunityId, nextStage, req.body.note);

        return ReS(res, journey.get({ plain: true }), 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.moveToNextStage = moveToNextStage;

// ✅ Move to previous stage
var moveToPreviousStage = async function (req, res) {
    try {
        const { opportunityId } = req.body;
        if (!opportunityId) return ReE(res, "opportunityId is required", 400);

        const journey = await model.Journey.findOne({ where: { opportunityId, isDeleted: false } });
        if (!journey) return ReE(res, "Journey not found for this opportunity", 404);

        const idx = STAGES.indexOf(journey.stage);
        if (idx === 0) {
            return ReE(res, "Already at first stage (C1)", 400);
        }

        const prevStage = STAGES[idx - 1];
        await journey.update({ stage: prevStage });
        await logHistory(opportunityId, prevStage, req.body.note || `Moved back to ${prevStage} - ${STAGE_NAMES[prevStage]}`);

        return ReS(res, journey.get({ plain: true }), 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.moveToPreviousStage = moveToPreviousStage;

// ✅ Reset journey back to C1, clears history and starts fresh
var resetJourney = async function (req, res) {
    try {
        const { opportunityId } = req.body;
        if (!opportunityId) return ReE(res, "opportunityId is required", 400);

        const journey = await model.Journey.findOne({ where: { opportunityId, isDeleted: false } });
        if (!journey) return ReE(res, "Journey not found for this opportunity", 404);

        await journey.update({
            stage: "C1",
            meetingOutcome: "Neutral",
            demoStatus: "Pending",
            reqClarity: "Pending",
            probability: 0,
            riskLevel: "Medium",
            proposalRequired: false,
        });

        await model.StageHistory.update(
            { isDeleted: true },
            { where: { opportunityId, isDeleted: false } }
        );
        await logHistory(opportunityId, "C1", "Journey reset to Connect");

        return ReS(res, journey.get({ plain: true }), 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.resetJourney = resetJourney;

// ───── Stage History ─────

var getHistory = async function (req, res) {
    try {
        const { opportunityId } = req.params;
        if (!opportunityId) return ReE(res, "opportunityId is required", 400);

        const history = await model.StageHistory.findAll({
            where: { opportunityId, isDeleted: false },
            order: [["createdAt", "ASC"]],
        });
        return ReS(res, { success: true, data: history }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getHistory = getHistory;

var addHistoryEntry = async function (req, res) {
    try {
        const { opportunityId, stage, note } = req.body;
        if (!opportunityId || !stage) return ReE(res, "opportunityId and stage are required", 400);

        const entry = await logHistory(opportunityId, stage, note);
        return ReS(res, entry, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addHistoryEntry = addHistoryEntry;

var clearHistory = async function (req, res) {
    try {
        const { opportunityId } = req.body;
        if (!opportunityId) return ReE(res, "opportunityId is required", 400);

        await model.StageHistory.update(
            { isDeleted: true },
            { where: { opportunityId, isDeleted: false } }
        );
        return ReS(res, { message: "History cleared" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.clearHistory = clearHistory;

// ✅ Delete a journey record entirely (from the table's trash icon)
var deleteJourney = async function (req, res) {
    try {
        const journey = await model.Journey.findByPk(req.params.id);
        if (!journey) return ReE(res, "Journey not found", 404);

        await journey.update({ isDeleted: true });
        return ReS(res, { message: "Journey record deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteJourney = deleteJourney;