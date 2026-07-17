"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Get full Preparation dashboard for a company
var getDashboard = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const [salesResources, communicationTemplates, checklist, objections, demoDocuments, featureChecklist, knowledgeSummary] = await Promise.all([
            model.SalesResourceItem.findAll({ where: { companyId, isDeleted: false } }),
            model.CommunicationTemplate.findAll({ where: { companyId, isDeleted: false } }),
            model.MeetingChecklistItem.findAll({ where: { companyId, isDeleted: false } }),
            model.ObjectionHandling.findAll({ where: { companyId, isDeleted: false } }),
            model.DemoDocumentItem.findAll({ where: { companyId, isDeleted: false } }),
            model.FeatureChecklistItem.findAll({ where: { companyId, isDeleted: false } }),
            model.KnowledgeSummary.findOne({ where: { companyId, isDeleted: false } }),
        ]);

        // ── P1 completion: any items present in at least N of 9 categories ──
        const p1Categories = new Set(salesResources.map((r) => r.category));
        const p1Filled = p1Categories.size;
        const p1Total = 9;

        // ── P2 completion: templates present + checklist + objections ──
        const p2TemplateCategories = new Set(communicationTemplates.map((t) => `${t.category}_${t.subtype}`));
        const p2Fields = [
            p2TemplateCategories.size > 0,
            checklist.length > 0,
            objections.length > 0,
        ];
        const p2Filled = p2Fields.filter(Boolean).length;
        const p2Total = 3;

        // ── P3 completion ──
        const p3DocCategories = new Set(demoDocuments.map((d) => d.category));
        const p3Fields = [
            p3DocCategories.size > 0,
            featureChecklist.length > 0,
            knowledgeSummary && knowledgeSummary.content,
        ];
        const p3Filled = p3Fields.filter(Boolean).length;
        const p3Total = 3;

        const p1Pct = Math.round((p1Filled / p1Total) * 100);
        const p2Pct = Math.round((p2Filled / p2Total) * 100);
        const p3Pct = Math.round((p3Filled / p3Total) * 100);
        const overallPct = Math.round((p1Pct + p2Pct + p3Pct) / 3);

        return ReS(res, {
            companyId: parseInt(companyId),
            stats: {
                p1Count: 1,
                p2Count: 1,
                p3Count: 1,
                totalSubModules: 3,
                overallCompletionPercentage: overallPct,
            },
            p1SalesResources: { completionPercentage: p1Pct, categoriesFilled: p1Filled, totalCategories: p1Total, items: salesResources },
            p2Communication: { completionPercentage: p2Pct, templates: communicationTemplates, checklist, objections },
            p3DemoDocuments: { completionPercentage: p3Pct, documents: demoDocuments, featureChecklist, knowledgeSummary: knowledgeSummary || null },
        }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getDashboard = getDashboard;