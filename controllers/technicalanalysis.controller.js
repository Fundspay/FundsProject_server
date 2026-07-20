"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Create A2 record for a company
var add = async function (req, res) {
    try {
        const { companyId } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const existing = await model.TechnicalAnalysis.findOne({ where: { companyId, isDeleted: false } });
        if (existing) return ReE(res, "Technical Analysis record already exists for this company", 409);

        const record = await model.TechnicalAnalysis.create(req.body);
        return ReS(res, record, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.add = add;

// ✅ Fetch all (with children)
var fetchAll = async function (req, res) {
    try {
        const records = await model.TechnicalAnalysis.findAll({
            where: { isDeleted: false },
            include: [
                { model: model.BusinessProblem, where: { isDeleted: false }, required: false },
                { model: model.FunctionalRequirement, where: { isDeleted: false }, required: false },
                { model: model.NonFunctionalRequirement, where: { isDeleted: false }, required: false },
                { model: model.RequiredReport, where: { isDeleted: false }, required: false },
                { model: model.TechnicalAttachment, where: { isDeleted: false }, required: false },
            ],
        });
        const plainRecords = records.map((r) => r.get({ plain: true }));
        return ReS(res, { success: true, data: plainRecords }, 200);
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

        const record = await model.TechnicalAnalysis.findByPk(id, {
            include: [
                { model: model.BusinessProblem, where: { isDeleted: false }, required: false },
                { model: model.FunctionalRequirement, where: { isDeleted: false }, required: false },
                { model: model.NonFunctionalRequirement, where: { isDeleted: false }, required: false },
                { model: model.RequiredReport, where: { isDeleted: false }, required: false },
                { model: model.TechnicalAttachment, where: { isDeleted: false }, required: false },
            ],
        });
        if (!record) return ReE(res, "Record not found", 404);

        return ReS(res, record.get({ plain: true }), 200);
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

        const record = await model.TechnicalAnalysis.findOne({
            where: { companyId, isDeleted: false },
            include: [
                { model: model.BusinessProblem, where: { isDeleted: false }, required: false },
                { model: model.FunctionalRequirement, where: { isDeleted: false }, required: false },
                { model: model.NonFunctionalRequirement, where: { isDeleted: false }, required: false },
                { model: model.RequiredReport, where: { isDeleted: false }, required: false },
                { model: model.TechnicalAttachment, where: { isDeleted: false }, required: false },
            ],
        });
        if (!record) return ReE(res, "Record not found for this company", 404);

        return ReS(res, record.get({ plain: true }), 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchByCompany = fetchByCompany;

// ✅ Update main record
var updateRecord = async function (req, res) {
    try {
        const record = await model.TechnicalAnalysis.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update(req.body);
        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateRecord = updateRecord;

// ✅ Soft delete main record
var deleteRecord = async function (req, res) {
    try {
        const record = await model.TechnicalAnalysis.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update({ isDeleted: true });
        return ReS(res, { message: "Record deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteRecord = deleteRecord;

// ───── Helper: find-or-create the parent TechnicalAnalysis record for a company ─────
async function getOrCreateTechnicalAnalysis(companyId) {
    let record = await model.TechnicalAnalysis.findOne({ where: { companyId, isDeleted: false } });
    if (!record) {
        record = await model.TechnicalAnalysis.create({ companyId });
    }
    return record;
}

// ───── Business Problems ─────

var addProblem = async function (req, res) {
    try {
        const { companyId, name } = req.body;
        if (!companyId || !name) return ReE(res, "companyId and name are required", 400);

        const technicalAnalysis = await getOrCreateTechnicalAnalysis(companyId);

        const problemData = { ...req.body, technicalAnalysisId: technicalAnalysis.id };
        delete problemData.companyId; // not a field on BusinessProblem

        const problem = await model.BusinessProblem.create(problemData);
        return ReS(res, problem, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addProblem = addProblem;

var updateProblem = async function (req, res) {
    try {
        const problem = await model.BusinessProblem.findByPk(req.params.id);
        if (!problem) return ReE(res, "Problem not found", 404);

        await problem.update(req.body);
        return ReS(res, problem, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateProblem = updateProblem;

var deleteProblem = async function (req, res) {
    try {
        const problem = await model.BusinessProblem.findByPk(req.params.id);
        if (!problem) return ReE(res, "Problem not found", 404);

        await problem.update({ isDeleted: true });
        return ReS(res, { message: "Problem deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteProblem = deleteProblem;

// ───── Functional Requirements ─────

var addFuncReq = async function (req, res) {
    try {
        const { companyId, name } = req.body;
        if (!companyId || !name) return ReE(res, "companyId and name are required", 400);

        const technicalAnalysis = await getOrCreateTechnicalAnalysis(companyId);

        const reqData = { ...req.body, technicalAnalysisId: technicalAnalysis.id };
        delete reqData.companyId; // not a field on FunctionalRequirement

        const req_ = await model.FunctionalRequirement.create(reqData);
        return ReS(res, req_, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addFuncReq = addFuncReq;

var updateFuncReq = async function (req, res) {
    try {
        const req_ = await model.FunctionalRequirement.findByPk(req.params.id);
        if (!req_) return ReE(res, "Requirement not found", 404);

        await req_.update(req.body);
        return ReS(res, req_, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateFuncReq = updateFuncReq;

var deleteFuncReq = async function (req, res) {
    try {
        const req_ = await model.FunctionalRequirement.findByPk(req.params.id);
        if (!req_) return ReE(res, "Requirement not found", 404);

        await req_.update({ isDeleted: true });
        return ReS(res, { message: "Requirement deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteFuncReq = deleteFuncReq;

// ───── Non-Functional Requirements ─────

var addNonFuncReq = async function (req, res) {
    try {
        const { companyId, name } = req.body;
        if (!companyId || !name) return ReE(res, "companyId and name are required", 400);

        const technicalAnalysis = await getOrCreateTechnicalAnalysis(companyId);

        const reqData = { ...req.body, technicalAnalysisId: technicalAnalysis.id };
        delete reqData.companyId; // not a field on NonFunctionalRequirement

        const req_ = await model.NonFunctionalRequirement.create(reqData);
        return ReS(res, req_, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addNonFuncReq = addNonFuncReq;

var updateNonFuncReq = async function (req, res) {
    try {
        const req_ = await model.NonFunctionalRequirement.findByPk(req.params.id);
        if (!req_) return ReE(res, "Requirement not found", 404);

        await req_.update(req.body);
        return ReS(res, req_, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateNonFuncReq = updateNonFuncReq;

var deleteNonFuncReq = async function (req, res) {
    try {
        const req_ = await model.NonFunctionalRequirement.findByPk(req.params.id);
        if (!req_) return ReE(res, "Requirement not found", 404);

        await req_.update({ isDeleted: true });
        return ReS(res, { message: "Requirement deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteNonFuncReq = deleteNonFuncReq;

// ───── Required Reports ─────

var addReport = async function (req, res) {
    try {
        const { companyId, name } = req.body;
        if (!companyId || !name) return ReE(res, "companyId and name are required", 400);

        const technicalAnalysis = await getOrCreateTechnicalAnalysis(companyId);

        const reportData = { ...req.body, technicalAnalysisId: technicalAnalysis.id };
        delete reportData.companyId; // not a field on RequiredReport

        const report = await model.RequiredReport.create(reportData);
        return ReS(res, report, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addReport = addReport;

var updateReport = async function (req, res) {
    try {
        const report = await model.RequiredReport.findByPk(req.params.id);
        if (!report) return ReE(res, "Report not found", 404);

        await report.update(req.body);
        return ReS(res, report, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateReport = updateReport;

var deleteReport = async function (req, res) {
    try {
        const report = await model.RequiredReport.findByPk(req.params.id);
        if (!report) return ReE(res, "Report not found", 404);

        await report.update({ isDeleted: true });
        return ReS(res, { message: "Report deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteReport = deleteReport;

// ───── Attachments ─────

var uploadAttachment = async function (req, res) {
    try {
        const { companyId } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);
        if (!req.file) return ReE(res, "No file uploaded", 400);

        const technicalAnalysis = await getOrCreateTechnicalAnalysis(companyId);

        const attachment = await model.TechnicalAttachment.create({
            technicalAnalysisId: technicalAnalysis.id,
            fileName: req.file.originalname,
            fileUrl: req.file.location,
            fileSize: req.file.size,
        });

        return ReS(res, attachment, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.uploadAttachment = uploadAttachment;

var deleteAttachment = async function (req, res) {
    try {
        const attachment = await model.TechnicalAttachment.findByPk(req.params.id);
        if (!attachment) return ReE(res, "Attachment not found", 404);

        await attachment.update({ isDeleted: true });
        return ReS(res, { message: "Attachment deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteAttachment = deleteAttachment;