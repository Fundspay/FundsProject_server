"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Create M2 record for a company
var add = async function (req, res) {
    try {
        const { companyId } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const existing = await model.MarketInformation.findOne({ where: { companyId, isDeleted: false } });
        if (existing) return ReE(res, "Market Information already exists for this company", 409);

        const record = await model.MarketInformation.create(req.body);
        return ReS(res, record.toJSON(), 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.add = add;

// ✅ Fetch all (with children)
var fetchAll = async function (req, res) {
    try {
        const records = await model.MarketInformation.findAll({
            where: { isDeleted: false },
            include: [
                { model: model.Competitor, where: { isDeleted: false }, required: false },
                { model: model.IndustryPlayer, where: { isDeleted: false }, required: false },
                { model: model.ResearchReference, where: { isDeleted: false }, required: false },
            ],
        });
        return ReS(res, { success: true, data: records.map(r => r.toJSON()) }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchAll = fetchAll;

// ✅ Fetch single by ID
var fetchSingle = async function (req, res) {
    try {
        const { id } = req.params;
        if (!id) return ReE(res, "ID is required", 400);

        const record = await model.MarketInformation.findByPk(id, {
            include: [
                { model: model.Competitor, where: { isDeleted: false }, required: false },
                { model: model.IndustryPlayer, where: { isDeleted: false }, required: false },
                { model: model.ResearchReference, where: { isDeleted: false }, required: false },
            ],
        });
        if (!record) return ReE(res, "Record not found", 404);

        return ReS(res, record.toJSON(), 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchSingle = fetchSingle;

// ✅ Fetch by companyId
var fetchByCompany = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const record = await model.MarketInformation.findOne({
            where: { companyId, isDeleted: false },
            include: [
                { model: model.Competitor, where: { isDeleted: false }, required: false },
                { model: model.IndustryPlayer, where: { isDeleted: false }, required: false },
                { model: model.ResearchReference, where: { isDeleted: false }, required: false },
            ],
        });
        if (!record) return ReE(res, "Record not found for this company", 404);

        return ReS(res, record.toJSON(), 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchByCompany = fetchByCompany;

// ✅ Update main record (tech, erp, adoption, policies, trends)
var updateRecord = async function (req, res) {
    try {
        const record = await model.MarketInformation.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        if (req.body.digitalAdoptionLevel !== undefined) {
            const level = parseInt(req.body.digitalAdoptionLevel);
            if (isNaN(level) || level < 0 || level > 100) {
                return ReE(res, "digitalAdoptionLevel must be between 0 and 100", 400);
            }
        }

        await record.update(req.body);
        return ReS(res, record.toJSON(), 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateRecord = updateRecord;

// ✅ Soft delete main record
var deleteRecord = async function (req, res) {
    try {
        const record = await model.MarketInformation.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update({ isDeleted: true });
        return ReS(res, { message: "Record deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteRecord = deleteRecord;

// ───── Competitors ─────

var addCompetitor = async function (req, res) {
    try {
        const { marketInformationId, name } = req.body;
        if (!marketInformationId || !name) return ReE(res, "marketInformationId and name are required", 400);

        const competitor = await model.Competitor.create(req.body);
        return ReS(res, competitor.toJSON(), 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addCompetitor = addCompetitor;

var updateCompetitor = async function (req, res) {
    try {
        const competitor = await model.Competitor.findByPk(req.params.id);
        if (!competitor) return ReE(res, "Competitor not found", 404);

        await competitor.update(req.body);
        return ReS(res, competitor.toJSON(), 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateCompetitor = updateCompetitor;

var deleteCompetitor = async function (req, res) {
    try {
        const competitor = await model.Competitor.findByPk(req.params.id);
        if (!competitor) return ReE(res, "Competitor not found", 404);

        await competitor.update({ isDeleted: true });
        return ReS(res, { message: "Competitor deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteCompetitor = deleteCompetitor;

// ───── Industry Players ─────

var addPlayer = async function (req, res) {
    try {
        const { marketInformationId, name } = req.body;
        if (!marketInformationId || !name) return ReE(res, "marketInformationId and name are required", 400);

        const player = await model.IndustryPlayer.create(req.body);
        return ReS(res, player.toJSON(), 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addPlayer = addPlayer;

var updatePlayer = async function (req, res) {
    try {
        const player = await model.IndustryPlayer.findByPk(req.params.id);
        if (!player) return ReE(res, "Player not found", 404);

        await player.update(req.body);
        return ReS(res, player.toJSON(), 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updatePlayer = updatePlayer;

var deletePlayer = async function (req, res) {
    try {
        const player = await model.IndustryPlayer.findByPk(req.params.id);
        if (!player) return ReE(res, "Player not found", 404);

        await player.update({ isDeleted: true });
        return ReS(res, { message: "Player deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deletePlayer = deletePlayer;

// ───── Research References ─────

var addReference = async function (req, res) {
    try {
        const { marketInformationId, title } = req.body;
        if (!marketInformationId || !title) return ReE(res, "marketInformationId and title are required", 400);

        const reference = await model.ResearchReference.create(req.body);
        return ReS(res, reference.toJSON(), 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addReference = addReference;

var updateReference = async function (req, res) {
    try {
        const reference = await model.ResearchReference.findByPk(req.params.id);
        if (!reference) return ReE(res, "Reference not found", 404);

        await reference.update(req.body);
        return ReS(res, reference.toJSON(), 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateReference = updateReference;

var deleteReference = async function (req, res) {
    try {
        const reference = await model.ResearchReference.findByPk(req.params.id);
        if (!reference) return ReE(res, "Reference not found", 404);

        await reference.update({ isDeleted: true });
        return ReS(res, { message: "Reference deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteReference = deleteReference;