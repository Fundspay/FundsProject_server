"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

async function generateProjectCode() {
    const year = new Date().getFullYear();
    const count = await model.AimProjectStatus.count({ where: {} });
    return `AIM-${year}-${String(count + 1).padStart(3, "0")}`;
}

// ✅ Get full Executive Dashboard for a company
var getDashboard = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const company = await model.Company.findByPk(companyId);
        if (!company) return ReE(res, "Company not found", 404);

        const [
            projectStatusRaw,
            research,
            comms,
            meetings,
            engagement,
            tasks,
            opportunities,
            journeys,
            proposals,
        ] = await Promise.all([
            model.AimProjectStatus.findOne({ where: { companyId, isDeleted: false } }),
            model.CompanyResearch.findOne({ where: { companyId, isDeleted: false } }),
            model.CommunicationLog.findAll({ where: { companyId, isDeleted: false } }),
            model.Meeting.findAll({ where: { companyId, isDeleted: false } }),
            model.EngagementScore.findOne({ where: { companyId, isDeleted: false } }),
            model.PendingTask.findAll({ where: { companyId, isDeleted: false, isCompleted: false } }),
            model.Opportunity.findAll({ where: { companyId, isDeleted: false } }),
            model.Journey.findAll({ where: { companyId, isDeleted: false }, order: [["updatedAt", "DESC"]] }),
            model.Proposal.findAll({ where: { companyId, isDeleted: false }, order: [["updatedAt", "DESC"]] }),
        ]);

        // ── Auto-provision project status on first visit ──
        let projectStatus = projectStatusRaw;
        if (!projectStatus) {
            const projectCode = await generateProjectCode();
            projectStatus = await model.AimProjectStatus.create({ companyId, projectCode });
        }

        // ═══════════════════════════════════════════
        // A – ANALYSIS (real data from A3 CompanyResearch only;
        // A1/A2 models haven't been shared in this build session,
        // so their contribution to progress is left out for now)
        // ═══════════════════════════════════════════
        const researchPlain = research ? research.get({ plain: true }) : null;

        const a3Filled = researchPlain
            ? [
                researchPlain.researchStatus && researchPlain.researchStatus !== "Not Started",
                (researchPlain.businessChallenges || []).length > 0,
                researchPlain.qualificationScore !== null && researchPlain.qualificationScore !== undefined,
                (researchPlain.recommendedSolutions || []).length > 0,
                researchPlain.swotAnalysis && researchPlain.swotAnalysis.trim().length > 0,
              ].filter(Boolean).length
            : 0;
        const a3Progress = Math.round((a3Filled / 5) * 100);

        // Until A1/A2 are shared, Analysis progress = A3 progress directly (not averaged down)
        const analysisProgress = a3Progress;

        const analysisSummary = {
            available: !!researchPlain,
            progress: analysisProgress,
            researchStatus: researchPlain ? researchPlain.researchStatus : "Not Started",
            digitalMaturity: researchPlain ? researchPlain.digitalMaturity : null,
            qualificationScore: researchPlain ? researchPlain.qualificationScore : null,
            leadTemperature: researchPlain ? researchPlain.leadTemperature : null,
            buyingReadiness: researchPlain ? researchPlain.buyingReadiness : null,
            challengesCount: researchPlain ? (researchPlain.businessChallenges || []).length : 0,
            recommendedSolutionsCount: researchPlain ? (researchPlain.recommendedSolutions || []).length : 0,
            competitorsCount: researchPlain ? (researchPlain.competitors || []).length : 0,
            documentsCount: researchPlain ? (researchPlain.researchDocuments || []).length : 0,
            opportunityValue: researchPlain ? researchPlain.opportunityValue : null,
            // Placeholders — real values come from A1 (business process) / A2 (stakeholders/requirements)
            // once those models are shared. Not guessed at here.
            businessProcessScore: null,
            requirementsScore: null,
            technicalAnalysisScore: null,
            departmentsCount: null,
            requirementsCount: null,
        };

        // ═══════════════════════════════════════════
        // I – INTERACTIONS (real data)
        // ═══════════════════════════════════════════
        const commsPlain = comms.map((c) => c.get({ plain: true }));
        const meetingsPlain = meetings.map((m) => m.get({ plain: true }));
        const outboundCount = commsPlain.filter((c) => c.direction === "Outbound").length;
        const inboundCount = commsPlain.filter((c) => c.direction === "Inbound").length;
        const pendingFollowups = meetingsPlain.filter((m) => m.followupDate).length;

        const i1Filled = [
            commsPlain.length > 0,
            outboundCount > 0,
            new Set(commsPlain.map((c) => c.type)).size > 1,
        ].filter(Boolean).length;
        const i2Filled = [
            meetingsPlain.length > 0,
            meetingsPlain.some((m) => m.status === "Completed"),
            meetingsPlain.some((m) => m.minutes && m.minutes.trim().length > 0),
        ].filter(Boolean).length;
        const i1Progress = Math.round((i1Filled / 3) * 100);
        const i2Progress = Math.round((i2Filled / 3) * 100);
        const engagementScore = engagement ? engagement.overallScore : 0;
        const iProgress = Math.round((i1Progress + i2Progress + engagementScore) / 3);

        const interactionSummary = {
            progress: iProgress,
            communicationsCount: commsPlain.length,
            meetingsCount: meetingsPlain.length,
            engagementScore,
            outboundCount,
            inboundCount,
            pendingFollowups,
            pendingTasksCount: tasks.length,
        };

        // ═══════════════════════════════════════════
        // M – OPPORTUNITIES (real data)
        // ═══════════════════════════════════════════
        const oppPlain = opportunities.map((o) => o.get({ plain: true }));
        const journeyPlain = journeys.map((j) => j.get({ plain: true }));
        const proposalPlain = proposals.map((p) => p.get({ plain: true }));

        const wonCount = oppPlain.filter((o) => o.status === "Won").length;
        const activeCount = oppPlain.filter((o) => o.status === "Active").length;
        const totalPipeline = proposalPlain.reduce((s, p) => s + parseFloat(p.finalDealValue || 0), 0);
        const wonRevenue = proposalPlain.filter((p) => p.status === "Won").reduce((s, p) => s + parseFloat(p.finalDealValue || 0), 0);
        const focusedProposal = proposalPlain.length > 0 ? proposalPlain[0] : null;
        const focusedJourney = journeyPlain.length > 0 ? journeyPlain[0] : null;

        const avgProbability = journeyPlain.length > 0
            ? Math.round(journeyPlain.reduce((s, j) => s + (j.probability || 0), 0) / journeyPlain.length)
            : 0;
        const m1Progress = oppPlain.length > 0
            ? Math.round(Math.min(100, (wonCount / oppPlain.length) * 50 + Math.min(oppPlain.length * 5, 50)))
            : 0;
        const m3HealthyCount = proposalPlain.filter((p) => p.status === "Won" || p.status === "On Hold").length;
        const m3Progress = proposalPlain.length > 0 ? Math.round((m3HealthyCount / proposalPlain.length) * 100) : 0;
        const mProgress = Math.round((m1Progress + avgProbability + m3Progress) / 3);

        const opportunitySummary = {
            progress: mProgress,
            opportunitiesCount: oppPlain.length,
            currentStage: focusedJourney ? focusedJourney.stage : null,
            proposalsCount: proposalPlain.length,
            pipelineValue: totalPipeline,
            wonRevenue,
            wonCount,
            activeCount,
            winProbability: avgProbability,
            finalDealValue: focusedProposal ? focusedProposal.finalDealValue : null,
            dealCurrency: focusedProposal ? focusedProposal.dealCurrency : "INR",
        };

        // ═══════════════════════════════════════════
        // BUILD — not shared yet
        // ═══════════════════════════════════════════
        const buildSummary = { available: false };

        // ═══════════════════════════════════════════
        // Executive rollup
        // ═══════════════════════════════════════════
        const overallProgress = Math.round((analysisProgress + iProgress + mProgress) / 3);
        const readinessScore = overallProgress;

        // ── Recent activity timeline (I1 + I2, newest first, top 5) ──
        const commIconMap = { Email: "email", WhatsApp: "whatsapp", "Phone Call": "phone", SMS: "sms", LinkedIn: "linkedin", Teams: "meeting", "Google Meet": "meeting" };
        const commActivities = commsPlain.map((c) => ({
            sourceType: "communication",
            icon: commIconMap[c.type] || "email",
            title: `${c.type} ${c.status}`,
            description: c.subject,
            timestamp: c.createdAt,
        }));
        const meetingActivities = meetingsPlain.map((m) => ({
            sourceType: "meeting",
            icon: "meeting",
            title: `Meeting ${m.status}`,
            description: m.title,
            timestamp: m.date,
        }));
        const recentActivities = [...commActivities, ...meetingActivities]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);

        // ── Upcoming: next meeting ──
        const nextMeeting = meetingsPlain
            .filter((m) => m.status === "Upcoming")
            .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;

        // ── Documents count by top-level module ──
        const documentsSummary = {
            aCount: researchPlain ? (researchPlain.researchDocuments || []).length : 0,
            iCount: /* I3 InteractionAttachment */ 0, // filled below
            mCount: proposalPlain.reduce(
                (s, p) => s + (p.proposalDocs || []).length + (p.quotationDocs || []).length +
                          (p.contractDocs || []).length + (p.ndaDocs || []).length + (p.poDocs || []).length,
                0
            ),
        };
        const i3Attachments = await model.InteractionAttachment.findAll({ where: { companyId, isDeleted: false } });
        documentsSummary.iCount = i3Attachments.length;
        const totalDocuments = documentsSummary.aCount + documentsSummary.iCount + documentsSummary.mCount;
        const totalReferences = researchPlain ? (researchPlain.researchReferences || []).length : 0;

        return ReS(res, {
            companyId: parseInt(companyId),
            company: { id: company.id, name: company.name },
            projectCode: projectStatus.projectCode,
            status: projectStatus.status,
            currentStage: projectStatus.currentStage,
            assignedPM: projectStatus.assignedPM,
            overallProgress,
            readinessScore,
            engagementScore,
            winProbability: avgProbability,
            analysisSummary,
            interactionSummary,
            opportunitySummary,
            buildSummary,
            recentActivities,
            nextActivity: nextMeeting ? { title: nextMeeting.title, date: nextMeeting.date } : null,
            pendingTasks: tasks.map((t) => ({ id: t.id, text: t.text })),
            documentsSummary,
            totalDocuments,
            totalReferences,
        }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getDashboard = getDashboard;

// ✅ Update project status / stage / assigned PM
var updateStatus = async function (req, res) {
    try {
        const { companyId, status, currentStage, assignedPM } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);

        let record = await model.AimProjectStatus.findOne({ where: { companyId, isDeleted: false } });
        if (!record) {
            const projectCode = await generateProjectCode();
            record = await model.AimProjectStatus.create({ companyId, projectCode });
        }

        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (currentStage !== undefined) updateData.currentStage = currentStage;
        if (assignedPM !== undefined) updateData.assignedPM = assignedPM;
        await record.update(updateData);

        return ReS(res, record.get({ plain: true }), 200);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.updateStatus = updateStatus;