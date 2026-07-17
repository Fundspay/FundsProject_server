"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

var getDashboard = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        // ── M: reuse same logic as market-intelligence dashboard ──
        const [industryProfile, marketInformation, businessOpportunity] = await Promise.all([
            model.IndustryProfile.findOne({ where: { companyId, isDeleted: false } }),
            model.MarketInformation.findOne({ where: { companyId, isDeleted: false } }),
            model.BusinessOpportunity.findOne({ where: { companyId, isDeleted: false } }),
        ]);
        const mFilled = [industryProfile, marketInformation, businessOpportunity].filter(Boolean).length;
        const mPct = Math.round((mFilled / 3) * 100);

        // ── A: reuse same logic as analysis dashboard ──
        const [businessProcess, technicalAnalysis, technicalArchitecture] = await Promise.all([
            model.BusinessProcess.findOne({ where: { companyId, isDeleted: false } }),
            model.TechnicalAnalysis.findOne({ where: { companyId, isDeleted: false } }),
            model.TechnicalArchitecture.findOne({ where: { companyId, isDeleted: false } }),
        ]);
        const aFilled = [businessProcess, technicalAnalysis, technicalArchitecture].filter(Boolean).length;
        const aPct = Math.round((aFilled / 3) * 100);

        // ── P: reuse same logic as preparation dashboard ──
        const [salesResources, communicationTemplates, demoDocuments] = await Promise.all([
            model.SalesResourceItem.findAll({ where: { companyId, isDeleted: false } }),
            model.CommunicationTemplate.findAll({ where: { companyId, isDeleted: false } }),
            model.DemoDocumentItem.findAll({ where: { companyId, isDeleted: false } }),
        ]);
        const pFilled = [salesResources.length > 0, communicationTemplates.length > 0, demoDocuments.length > 0].filter(Boolean).length;
        const pPct = Math.round((pFilled / 3) * 100);

        const overallPct = Math.round((mPct + aPct + pPct) / 3);

        return ReS(res, {
            companyId: parseInt(companyId),
            stats: {
                totalModules: 3,
                totalSubModules: 9,
                avgCompletionPercentage: overallPct,
            },
            marketIntelligence: {
                moduleCode: "M",
                completionPercentage: mPct,
                subModules: {
                    m1IndustryProfile: { filled: !!industryProfile, data: industryProfile },
                    m2MarketInformation: { filled: !!marketInformation, data: marketInformation },
                    m3BusinessOpportunity: { filled: !!businessOpportunity, data: businessOpportunity },
                },
            },
            analysisKnowledge: {
                moduleCode: "A",
                completionPercentage: aPct,
                subModules: {
                    a1BusinessProcess: { filled: !!businessProcess, data: businessProcess },
                    a2TechnicalAnalysis: { filled: !!technicalAnalysis, data: technicalAnalysis },
                    a3TechnicalArchitecture: { filled: !!technicalArchitecture, data: technicalArchitecture },
                },
            },
            preparation: {
                moduleCode: "P",
                completionPercentage: pPct,
                subModules: {
                    p1SalesResources: { filled: salesResources.length > 0, itemCount: salesResources.length },
                    p2Communication: { filled: communicationTemplates.length > 0, templateCount: communicationTemplates.length },
                    p3DemoDocuments: { filled: demoDocuments.length > 0, documentCount: demoDocuments.length },
                },
            },
        }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getDashboard = getDashboard;