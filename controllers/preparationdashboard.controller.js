"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Get full Preparation dashboard for a company
var getDashboard = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const [salesResourcesRaw, communicationTemplatesRaw, checklistRaw, objectionsRaw, demoDocumentsRaw, featureChecklistRaw, knowledgeSummaryRaw] = await Promise.all([
            model.SalesResourceItem.findAll({ where: { companyId, isDeleted: false } }),
            model.CommunicationTemplate.findAll({ where: { companyId, isDeleted: false } }),
            model.MeetingChecklistItem.findAll({ where: { companyId, isDeleted: false } }),
            model.ObjectionHandling.findAll({ where: { companyId, isDeleted: false } }),
            model.DemoDocumentItem.findAll({ where: { companyId, isDeleted: false } }),
            model.FeatureChecklistItem.findAll({ where: { companyId, isDeleted: false } }),
            model.KnowledgeSummary.findOne({ where: { companyId, isDeleted: false } }),
        ]);

        const salesResources = salesResourcesRaw.map((i) => i.get({ plain: true }));
        const communicationTemplates = communicationTemplatesRaw.map((i) => i.get({ plain: true }));
        const checklist = checklistRaw.map((i) => i.get({ plain: true }));
        const objections = objectionsRaw.map((i) => i.get({ plain: true }));
        const demoDocuments = demoDocumentsRaw.map((i) => i.get({ plain: true }));
        const featureChecklist = featureChecklistRaw.map((i) => i.get({ plain: true }));
        const knowledgeSummary = knowledgeSummaryRaw ? knowledgeSummaryRaw.get({ plain: true }) : null;

        // ── P1 completion: categories present out of 9 possible ──
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
            Boolean(knowledgeSummary && knowledgeSummary.content),
        ];
        const p3Filled = p3Fields.filter(Boolean).length;
        const p3Total = 3;

        // ── Overall completion — total filled / total fields, same convention as A-master ──
        const totalFilled = p1Filled + p2Filled + p3Filled;
        const totalFields = p1Total + p2Total + p3Total;
        const completionPercentage = totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0;

        // Keep the per-section percentages too — useful for the UI's individual progress bars
        const p1Pct = Math.round((p1Filled / p1Total) * 100);
        const p2Pct = Math.round((p2Filled / p2Total) * 100);
        const p3Pct = Math.round((p3Filled / p3Total) * 100);

        // ── Documents count (demo docs with a file + attachments) ──
        const documentsUploaded =
            demoDocuments.filter((d) => d.fileUrl || d.url).length +
            (knowledgeSummary?.attachmentUrl ? 1 : 0);

        // ── Last updated — most recent updatedAt across all sources ──
        const allTimestamps = [
            ...salesResources.map((r) => r.updatedAt),
            ...communicationTemplates.map((t) => t.updatedAt),
            ...checklist.map((c) => c.updatedAt),
            ...objections.map((o) => o.updatedAt),
            ...demoDocuments.map((d) => d.updatedAt),
            ...featureChecklist.map((f) => f.updatedAt),
            knowledgeSummary?.updatedAt,
        ].filter(Boolean).map((d) => new Date(d).getTime());
        const lastUpdated = allTimestamps.length ? new Date(Math.max(...allTimestamps)) : null;

        return ReS(res, {
            companyId: parseInt(companyId),
            stats: {
                p1Count: 1,
                p2Count: 1,
                p3Count: 1,
                totalWidgets: 3,
                completionPercentage,
                documentsUploaded,
                lastUpdated,
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