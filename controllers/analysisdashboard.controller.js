"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Get full Analysis & Knowledge dashboard for a company
var getDashboard = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const [businessProcessRaw, technicalAnalysisRaw, technicalArchitectureRaw] = await Promise.all([
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

        // Convert to plain objects to avoid circular structure (Sequelize's include creates a 'parent' back-reference)
        const businessProcess = businessProcessRaw ? businessProcessRaw.get({ plain: true }) : null;
        const technicalAnalysis = technicalAnalysisRaw ? technicalAnalysisRaw.get({ plain: true }) : null;
        const technicalArchitecture = technicalArchitectureRaw ? technicalArchitectureRaw.get({ plain: true }) : null;

        // ── Completion calculation ──
        // A1 fields considered "filled" based on presence of children
        const a1Fields = businessProcess ? [
            businessProcess.Departments?.length,
            businessProcess.OperationalActivities?.length,
            businessProcess.ExistingReports?.length,
            businessProcess.ProcessDiagramFiles?.length,
        ] : [];
        const a1Filled = a1Fields.filter(Boolean).length;
        const a1Total = 4;

        const a2Fields = technicalAnalysis ? [
            technicalAnalysis.BusinessProblems?.length,
            technicalAnalysis.FunctionalRequirements?.length,
            technicalAnalysis.NonFunctionalRequirements?.length,
            technicalAnalysis.RequiredReports?.length,
            technicalAnalysis.TechnicalAttachments?.length,
        ] : [];
        const a2Filled = a2Fields.filter(Boolean).length;
        const a2Total = 5;

        const a3Fields = technicalArchitecture ? [
            technicalArchitecture.ThirdPartyIntegrations?.length,
            technicalArchitecture.TechnicalRisks?.length,
            technicalArchitecture.ReferenceDocuments?.length,
        ] : [];
        const a3Filled = a3Fields.filter(Boolean).length;
        const a3Total = 3;

        const totalFilled = a1Filled + a2Filled + a3Filled;
        const totalFields = a1Total + a2Total + a3Total;
        const completionPercentage = totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0;

        // ── Documents count (diagram files + reference docs with a file) ──
        const documentsUploaded =
            (businessProcess?.ProcessDiagramFiles || []).filter(f => f.fileUrl).length +
            (technicalArchitecture?.ReferenceDocuments || []).filter(d => d.docType === "file").length +
            (technicalAnalysis?.TechnicalAttachments || []).length;

        // ── Last updated (most recent updatedAt among the three) ──
        const timestamps = [businessProcess?.updatedAt, technicalAnalysis?.updatedAt, technicalArchitecture?.updatedAt]
            .filter(Boolean)
            .map(d => new Date(d).getTime());
        const lastUpdated = timestamps.length ? new Date(Math.max(...timestamps)) : null;

        return ReS(res, {
            companyId: parseInt(companyId),
            stats: {
                a1Count: 4,
                a2Count: 5,
                a3Count: 3,
                totalWidgets: 12,
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