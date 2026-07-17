"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ───── Documents (Upload + URL) ─────

var getByCompany = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const items = await model.DemoDocumentItem.findAll({
            where: { companyId, isDeleted: false },
            order: [["createdAt", "ASC"]],
        });

        const grouped = {};
        items.forEach((item) => {
            if (!grouped[item.category]) grouped[item.category] = [];
            grouped[item.category].push(item);
        });

        return ReS(res, { companyId: parseInt(companyId), resources: grouped }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getByCompany = getByCompany;

var addUrl = async function (req, res) {
    try {
        const { companyId, category, url } = req.body;
        if (!companyId || !category || !url) {
            return ReE(res, "companyId, category, and url are required", 400);
        }

        const item = await model.DemoDocumentItem.create({
            companyId, category, docType: "url", url,
        });
        return ReS(res, item, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addUrl = addUrl;

var uploadFile = async function (req, res) {
    try {
        const { companyId, category } = req.body;
        if (!companyId || !category) return ReE(res, "companyId and category are required", 400);
        if (!req.file) return ReE(res, "No file uploaded", 400);

        const item = await model.DemoDocumentItem.create({
            companyId,
            category,
            docType: "file",
            name: req.file.originalname,
            url: req.file.location,
            fileSize: req.file.size,
        });

        return ReS(res, item, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.uploadFile = uploadFile;

var deleteItem = async function (req, res) {
    try {
        const item = await model.DemoDocumentItem.findByPk(req.params.id);
        if (!item) return ReE(res, "Item not found", 404);

        await item.update({ isDeleted: true });
        return ReS(res, { message: "Item deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteItem = deleteItem;

// ───── Feature Checklist ─────

var getChecklist = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const items = await model.FeatureChecklistItem.findAll({
            where: { companyId, isDeleted: false },
            order: [["createdAt", "ASC"]],
        });
        return ReS(res, { success: true, data: items }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getChecklist = getChecklist;

var addChecklistItem = async function (req, res) {
    try {
        const { companyId, text } = req.body;
        if (!companyId || !text) return ReE(res, "companyId and text are required", 400);

        const item = await model.FeatureChecklistItem.create({ companyId, text });
        return ReS(res, item, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addChecklistItem = addChecklistItem;

var updateChecklistItem = async function (req, res) {
    try {
        const item = await model.FeatureChecklistItem.findByPk(req.params.id);
        if (!item) return ReE(res, "Item not found", 404);

        await item.update(req.body);
        return ReS(res, item, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateChecklistItem = updateChecklistItem;

var deleteChecklistItem = async function (req, res) {
    try {
        const item = await model.FeatureChecklistItem.findByPk(req.params.id);
        if (!item) return ReE(res, "Item not found", 404);

        await item.update({ isDeleted: true });
        return ReS(res, { message: "Item deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteChecklistItem = deleteChecklistItem;

// ───── Knowledge Summary ─────

var getKnowledgeSummary = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const summary = await model.KnowledgeSummary.findOne({
            where: { companyId, isDeleted: false },
        });
        return ReS(res, summary || { companyId: parseInt(companyId), content: null }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getKnowledgeSummary = getKnowledgeSummary;

var upsertKnowledgeSummary = async function (req, res) {
    try {
        const { companyId, content } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const [summary, created] = await model.KnowledgeSummary.findOrCreate({
            where: { companyId, isDeleted: false },
            defaults: { content, isAutoGenerated: false },
        });

        if (!created) {
            await summary.update({ content, isAutoGenerated: false });
        }

        return ReS(res, summary, created ? 201 : 200);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.upsertKnowledgeSummary = upsertKnowledgeSummary;