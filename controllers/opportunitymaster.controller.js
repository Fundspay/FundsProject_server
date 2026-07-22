"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Get full M Master dashboard for a company
var getDashboard = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const [
            opportunitiesRaw,
            journeysRaw,
            proposalsRaw,
            statusRaw,
            company,
        ] = await Promise.all([
            model.Opportunity.findAll({ where: { companyId, isDeleted: false } }),
            model.Journey.findAll({ where: { companyId, isDeleted: false }, order: [["updatedAt", "DESC"]] }),
            model.Proposal.findAll({ where: { companyId, isDeleted: false }, order: [["updatedAt", "DESC"]] }),
            model.OpportunityStatus.findOne({ where: { companyId, isDeleted: false } }),
            model.Company.findByPk(companyId),
        ]);

        if (!company) return ReE(res, "Company not found", 404);

        const opportunities = opportunitiesRaw.map((o) => o.get({ plain: true }));
        const journeys = journeysRaw.map((j) => j.get({ plain: true }));
        const proposals = proposalsRaw.map((p) => p.get({ plain: true }));
        const status = statusRaw ? statusRaw.get({ plain: true }) : { status: "Active", assignedPM: null };

        // ── M1 Opportunity Summary ──
        const oppSummary = {
            total: opportunities.length,
            won: opportunities.filter((o) => o.status === "Won").length,
            active: opportunities.filter((o) => o.status === "Active").length,
            onHold: opportunities.filter((o) => o.status === "On Hold").length,
            lost: opportunities.filter((o) => o.status === "Lost").length,
        };
        const i1FilledCriteria = [
            opportunities.length > 0,
            opportunities.some((o) => o.source),
            oppSummary.won > 0,
        ].filter(Boolean).length;
        const m1Progress = Math.round((i1FilledCriteria / 3) * 100);

        // Simple placeholder "opportunity score" out of 100 — weighted mix of win rate and volume
        const winRate = opportunities.length > 0 ? (oppSummary.won / opportunities.length) * 100 : 0;
        const opportunityScore = Math.round(Math.min(100, winRate * 0.6 + Math.min(opportunities.length * 5, 40)));

        // ── M2 Journey Summary ──
        const stageDistribution = { C1: 0, C2: 0, C3: 0, C4: 0 };
        journeys.forEach((j) => { if (stageDistribution[j.stage] !== undefined) stageDistribution[j.stage]++; });
        const avgProbability = journeys.length > 0
            ? Math.round(journeys.reduce((s, j) => s + (j.probability || 0), 0) / journeys.length)
            : 0;
        const m2Progress = avgProbability; // directly reuses avg probability as journey-stage progress

        // Focused journey = most recently updated one (drives the single-value "Current Stage / Risk" tiles)
        const focusedJourney = journeys.length > 0 ? journeys[0] : null;

        // ── M3 Proposal Summary ──
        const proposalSummary = {
            total: proposals.length,
            won: proposals.filter((p) => p.status === "Won").length,
            onHold: proposals.filter((p) => p.status === "On Hold").length,
            lost: proposals.filter((p) => p.status === "Lost").length,
            cancelled: proposals.filter((p) => p.status === "Cancelled").length,
        };
        const healthyProposals = proposals.filter((p) => p.status === "Won" || p.status === "On Hold").length;
        const m3Progress = proposals.length > 0 ? Math.round((healthyProposals / proposals.length) * 100) : 0;

        // Focused proposal = most recently updated one (drives Latest Version / Final Deal Value tiles)
        const focusedProposal = proposals.length > 0 ? proposals[0] : null;

        // ── Commercial / Financial Summary (M3, company-wide) ──
        const totalPipeline = proposals.reduce((s, p) => s + parseFloat(p.finalDealValue || 0), 0);
        const wonRevenue = proposals.filter((p) => p.status === "Won").reduce((s, p) => s + parseFloat(p.finalDealValue || 0), 0);
        const activePipeline = proposals.filter((p) => p.status === "On Hold").reduce((s, p) => s + parseFloat(p.finalDealValue || 0), 0);
        const avgDealSize = proposals.length > 0 ? totalPipeline / proposals.length : 0;
        const avgDiscount = proposals.length > 0
            ? Math.round(proposals.reduce((s, p) => s + (p.discountPercent || 0), 0) / proposals.length)
            : 0;

        // ── Documents Library (aggregated across all proposals) ──
        const documentsLibrary = {
            proposal: proposals.reduce((s, p) => s + (p.proposalDocs || []).length, 0),
            quotation: proposals.reduce((s, p) => s + (p.quotationDocs || []).length, 0),
            contract: proposals.reduce((s, p) => s + (p.contractDocs || []).length, 0),
            nda: proposals.reduce((s, p) => s + (p.ndaDocs || []).length, 0),
            po: proposals.reduce((s, p) => s + (p.poDocs || []).length, 0),
        };

        // ── Overall Progress ──
        const overallProgress = Math.round((m1Progress + m2Progress + m3Progress) / 3);

        return ReS(res, {
            companyId: parseInt(companyId),
            company: { id: company.id, name: company.name },
            status: status.status,
            assignedPM: status.assignedPM,
            progress: { overall: overallProgress, m1: m1Progress, m2: m2Progress, m3: m3Progress },
            opportunitySummary: oppSummary,
            opportunityScore,
            journeySummary: {
                currentStage: focusedJourney ? focusedJourney.stage : null,
                probability: focusedJourney ? focusedJourney.probability : 0,
                riskLevel: focusedJourney ? focusedJourney.riskLevel : null,
                avgProbability,
                stageDistribution,
            },
            proposalSummary: {
                ...proposalSummary,
                latestVersion: focusedProposal ? `V${focusedProposal.version}` : null,
                finalDealValue: focusedProposal ? focusedProposal.finalDealValue : null,
                dealCurrency: focusedProposal ? focusedProposal.dealCurrency : "INR",
                advancePayment: focusedProposal ? focusedProposal.advancePayment : null,
                negotiationNotes: focusedProposal ? focusedProposal.negotiationNotes : null,
                focusedProposalId: focusedProposal ? focusedProposal.id : null,
            },
            commercialSummary: { totalPipeline, wonRevenue, activePipeline, avgDealSize, avgDiscount },
            documentsLibrary,
        }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getDashboard = getDashboard;

// ✅ Update status / assigned PM
var updateStatus = async function (req, res) {
    try {
        const { companyId, status, assignedPM } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const [record] = await model.OpportunityStatus.findOrCreate({
            where: { companyId, isDeleted: false },
            defaults: { status: status || "Active", assignedPM },
        });

        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (assignedPM !== undefined) updateData.assignedPM = assignedPM;
        await record.update(updateData);

        return ReS(res, record.get({ plain: true }), 200);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.updateStatus = updateStatus;

// ✅ Save negotiation notes (writes to the most recently updated Proposal for the company)
var saveNegotiation = async function (req, res) {
    try {
        const { companyId, proposalId, negotiationNotes } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);

        let proposal;
        if (proposalId) {
            proposal = await model.Proposal.findByPk(proposalId);
        } else {
            proposal = await model.Proposal.findOne({
                where: { companyId, isDeleted: false },
                order: [["updatedAt", "DESC"]],
            });
        }

        if (!proposal) return ReE(res, "No proposal found to attach negotiation notes to", 404);

        await proposal.update({ negotiationNotes });
        return ReS(res, proposal.get({ plain: true }), 200);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.saveNegotiation = saveNegotiation;
