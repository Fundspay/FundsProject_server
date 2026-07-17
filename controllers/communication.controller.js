"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ───── Templates (Email, WhatsApp, Calling, Agenda, Pitch, Intro) ─────

// ✅ Get all templates for a company, grouped by category
var getTemplates = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const templates = await model.CommunicationTemplate.findAll({
            where: { companyId, isDeleted: false },
        });

        const grouped = {};
        templates.forEach((t) => {
            if (!grouped[t.category]) grouped[t.category] = {};
            grouped[t.category][t.subtype || "default"] = t;
        });

        return ReS(res, { companyId: parseInt(companyId), templates: grouped }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getTemplates = getTemplates;

// ✅ Create or update a template (upsert by companyId + category + subtype)
var upsertTemplate = async function (req, res) {
    try {
        const { companyId, category, subtype, content } = req.body;
        if (!companyId || !category) return ReE(res, "companyId and category are required", 400);

        const [template, created] = await model.CommunicationTemplate.findOrCreate({
            where: { companyId, category, subtype: subtype || null, isDeleted: false },
            defaults: { content },
        });

        if (!created) {
            await template.update({ content });
        }

        return ReS(res, template, created ? 201 : 200);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.upsertTemplate = upsertTemplate;

// ✅ Delete a template
var deleteTemplate = async function (req, res) {
    try {
        const template = await model.CommunicationTemplate.findByPk(req.params.id);
        if (!template) return ReE(res, "Template not found", 404);

        await template.update({ isDeleted: true });
        return ReS(res, { message: "Template deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteTemplate = deleteTemplate;

// ───── Meeting Checklist ─────

var getChecklist = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const items = await model.MeetingChecklistItem.findAll({
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

        const item = await model.MeetingChecklistItem.create({ companyId, text });
        return ReS(res, item, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addChecklistItem = addChecklistItem;

var updateChecklistItem = async function (req, res) {
    try {
        const item = await model.MeetingChecklistItem.findByPk(req.params.id);
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
        const item = await model.MeetingChecklistItem.findByPk(req.params.id);
        if (!item) return ReE(res, "Item not found", 404);

        await item.update({ isDeleted: true });
        return ReS(res, { message: "Item deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteChecklistItem = deleteChecklistItem;

// ───── Objection Handling ─────

var getObjections = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const items = await model.ObjectionHandling.findAll({
            where: { companyId, isDeleted: false },
            order: [["createdAt", "ASC"]],
        });
        return ReS(res, { success: true, data: items }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getObjections = getObjections;

var addObjection = async function (req, res) {
    try {
        const { companyId, objection, response } = req.body;
        if (!companyId || !objection) return ReE(res, "companyId and objection are required", 400);

        const item = await model.ObjectionHandling.create({ companyId, objection, response });
        return ReS(res, item, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addObjection = addObjection;

var updateObjection = async function (req, res) {
    try {
        const item = await model.ObjectionHandling.findByPk(req.params.id);
        if (!item) return ReE(res, "Objection not found", 404);

        await item.update(req.body);
        return ReS(res, item, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateObjection = updateObjection;

var deleteObjection = async function (req, res) {
    try {
        const item = await model.ObjectionHandling.findByPk(req.params.id);
        if (!item) return ReE(res, "Objection not found", 404);

        await item.update({ isDeleted: true });
        return ReS(res, { message: "Objection deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteObjection = deleteObjection;