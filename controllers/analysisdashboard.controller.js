"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Get full Analysis & Knowledge dashboard for a company
var getDashboard = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const [businessProcess, technicalAnalysis, technicalArchitecture] = await Promise.all([
            model.BusinessProcess.findOne({
                where: { companyId, isDeleted: false },
                include: [
                    { model: model.Department, where: { isDeleted: false }, required: false },
                    { model: model.OperationalActivity, where: { isDeleted: false }, required: false },
                    { model: model.ExistingReport, where: { isDeleted: false }, required: false },
                    { model: model.ProcessDiagramFile, where: { isDeleted: false }, required: false },
                ],
            }),
            model.TechnicalAnalysis.findOne({
                where: { companyId, isDeleted: false },
                include: [
                    { model: model.BusinessProblem, where: { isDeleted: false }, required: false },
                    { model: model.FunctionalRequirement, where: { isDeleted: false }, required: false },
                    { model: model.NonFunctionalRequirement, where: { isDeleted: false }, required: false },
                    { model: model.RequiredReport, where: { isDeleted: false }, required: false },
                    { model: model.TechnicalAttachment, where: { isDeleted: false }, required: false },
                ],
            }),
            model.TechnicalArchitecture.findOne({
                where: { companyId, isDeleted: false },
                include: [
                    { model: model.ThirdPartyIntegration, where: { isDeleted: false }, required: false },
                    { model: model.TechnicalRisk, where: { isDeleted: false }, required: false },
                    { model: model.ReferenceDocument, where: { isDeleted: false }, required: false },
                ],
            }),
        ]);

        // ── Completion calculation ──
        const a1Fields = businessProcess ? [
            businessProcess.businessWorkflow, businessProcess.currentBusinessProcess,
            businessProcess.Departments?.length, businessProcess.OperationalActivities?.length,
            businessProcess.departmentDependencies, businessProcess.ExistingReports?.length,
            businessProcess.diagramUrls?.length || businessProcess.ProcessDiagramFiles?.length,
        ] : [];
        const a1Filled = a1Fields.filter(Boolean).length;
        const a1Total = 7;

        const a2Fields = technicalAnalysis ? [
            technicalAnalysis.BusinessProblems?.length, technicalAnalysis.FunctionalRequirements?.length,
            technicalAnalysis.NonFunctionalRequirements?.length, technicalAnalysis.existingManualProcess,
            technicalAnalysis.automationOpportunities, technicalAnalysis.RequiredReports?.length,
            technicalAnalysis.approvalWorkflow, technicalAnalysis.businessRules,
        ] : [];
        const a2Filled = a2Fields.filter(Boolean).length;
        const a2Total = 8;

        const a3Fields = technicalArchitecture ? [
            technicalArchitecture.existingSoftware?.length, technicalArchitecture.ThirdPartyIntegrations?.length,
            technicalArchitecture.currentDatabase, technicalArchitecture.currentHosting,
            technicalArchitecture.technicalChallenges, technicalArchitecture.recommendedModules?.length,
            technicalArchitecture.TechnicalRisks?.length,
        ] : [];
        const a3Filled = a3Fields.filter(Boolean).length;
        const a3Total = 7;

        const totalFilled = a1Filled + a2Filled + a3Filled;
        const totalFields = a1Total + a2Total + a3Total;
        const completionPercentage = totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0;

        // ── Documents count (across A1 diagrams, A2 attachments, A3 references) ──
        const documentsUploaded =
            (businessProcess?.ProcessDiagramFiles || []).length +
            (technicalAnalysis?.TechnicalAttachments || []).length +
            (technicalArchitecture?.ReferenceDocuments || []).filter(d => d.docType === "file").length;

        // ── Last updated ──
        const timestamps = [businessProcess?.updatedAt, technicalAnalysis?.updatedAt, technicalArchitecture?.updatedAt]
            .filter(Boolean)
            .map(d => new Date(d).getTime());
        const lastUpdated = timestamps.length ? new Date(Math.max(...timestamps)) : null;

        return ReS(res, {
            companyId: parseInt(companyId),
            stats: {
                a1Count: 4,
                a2Count: 4,
                a3Count: 4,
                totalWidgets: 15,
                completionPercentage,
                documentsUploaded,
                lastUpdated,
            },
            businessProcess: businessProcess || null,
            technicalAnalysis: technicalAnalysis || null,
            technicalArchitecture: technicalArchitecture || null,
        }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getDashboard = getDashboard;