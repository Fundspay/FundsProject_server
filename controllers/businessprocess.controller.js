"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Create A1 record for a company
var add = async function (req, res) {
    try {
        const { companyId } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const existing = await model.BusinessProcess.findOne({ where: { companyId, isDeleted: false } });
        if (existing) return ReE(res, "Business Process record already exists for this company", 409);

        const record = await model.BusinessProcess.create(req.body);
        return ReS(res, record, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.add = add;

// ✅ Fetch all (with children)
var fetchAll = async function (req, res) {
    try {
        const records = await model.BusinessProcess.findAll({
            where: { isDeleted: false },
            include: [
                { model: model.Department, where: { isDeleted: false }, required: false },
                { model: model.OperationalActivity, where: { isDeleted: false }, required: false },
                { model: model.ExistingReport, where: { isDeleted: false }, required: false },
                { model: model.ProcessDiagramFile, where: { isDeleted: false }, required: false },
            ],
        });
        return ReS(res, { success: true, data: records }, 200);
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

        const record = await model.BusinessProcess.findByPk(id, {
            include: [
                { model: model.Department, where: { isDeleted: false }, required: false },
                { model: model.OperationalActivity, where: { isDeleted: false }, required: false },
                { model: model.ExistingReport, where: { isDeleted: false }, required: false },
                { model: model.ProcessDiagramFile, where: { isDeleted: false }, required: false },
            ],
        });
        if (!record) return ReE(res, "Record not found", 404);

        return ReS(res, record, 200);
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

        const record = await model.BusinessProcess.findOne({
            where: { companyId, isDeleted: false },
            include: [
                { model: model.Department, where: { isDeleted: false }, required: false },
                { model: model.OperationalActivity, where: { isDeleted: false }, required: false },
                { model: model.ExistingReport, where: { isDeleted: false }, required: false },
                { model: model.ProcessDiagramFile, where: { isDeleted: false }, required: false },
            ],
        });
        if (!record) return ReE(res, "Record not found for this company", 404);

        return ReS(res, record, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchByCompany = fetchByCompany;

// ✅ Update main record
var updateRecord = async function (req, res) {
    try {
        const record = await model.BusinessProcess.findByPk(req.params.id);
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
        const record = await model.BusinessProcess.findByPk(req.params.id);
        if (!record) return ReE(res, "Record not found", 404);

        await record.update({ isDeleted: true });
        return ReS(res, { message: "Record deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteRecord = deleteRecord;

// ───── Helper: find-or-create the parent BusinessProcess record for a company ─────
async function getOrCreateBusinessProcess(companyId) {
    let record = await model.BusinessProcess.findOne({ where: { companyId, isDeleted: false } });
    if (!record) {
        record = await model.BusinessProcess.create({ companyId });
    }
    return record;
}

// ───── Departments ─────

var addDepartment = async function (req, res) {
    try {
        const { companyId, name } = req.body;
        if (!companyId || !name) return ReE(res, "companyId and name are required", 400);

        const businessProcess = await getOrCreateBusinessProcess(companyId);

        const deptData = { ...req.body, businessProcessId: businessProcess.id };
        delete deptData.companyId; // not a field on Department

        const dept = await model.Department.create(deptData);
        return ReS(res, dept, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addDepartment = addDepartment;

var updateDepartment = async function (req, res) {
    try {
        const dept = await model.Department.findByPk(req.params.id);
        if (!dept) return ReE(res, "Department not found", 404);

        await dept.update(req.body);
        return ReS(res, dept, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateDepartment = updateDepartment;

var deleteDepartment = async function (req, res) {
    try {
        const dept = await model.Department.findByPk(req.params.id);
        if (!dept) return ReE(res, "Department not found", 404);

        await dept.update({ isDeleted: true });
        return ReS(res, { message: "Department deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteDepartment = deleteDepartment;

// ───── Operational Activities ─────

var addActivity = async function (req, res) {
    try {
        const { companyId, name } = req.body;
        if (!companyId || !name) return ReE(res, "companyId and name are required", 400);

        const businessProcess = await getOrCreateBusinessProcess(companyId);

        const activityData = { ...req.body, businessProcessId: businessProcess.id };
        delete activityData.companyId; // not a field on OperationalActivity

        const activity = await model.OperationalActivity.create(activityData);
        return ReS(res, activity, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addActivity = addActivity;

var updateActivity = async function (req, res) {
    try {
        const activity = await model.OperationalActivity.findByPk(req.params.id);
        if (!activity) return ReE(res, "Activity not found", 404);

        await activity.update(req.body);
        return ReS(res, activity, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateActivity = updateActivity;

var deleteActivity = async function (req, res) {
    try {
        const activity = await model.OperationalActivity.findByPk(req.params.id);
        if (!activity) return ReE(res, "Activity not found", 404);

        await activity.update({ isDeleted: true });
        return ReS(res, { message: "Activity deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteActivity = deleteActivity;

// ───── Existing Reports ─────

var addReport = async function (req, res) {
    try {
        const { companyId, name } = req.body;
        if (!companyId || !name) return ReE(res, "companyId and name are required", 400);

        const businessProcess = await getOrCreateBusinessProcess(companyId);

        const reportData = { ...req.body, businessProcessId: businessProcess.id };
        delete reportData.companyId; // not a field on ExistingReport

        const report = await model.ExistingReport.create(reportData);
        return ReS(res, report, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addReport = addReport;

var updateReport = async function (req, res) {
    try {
        const report = await model.ExistingReport.findByPk(req.params.id);
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
        const report = await model.ExistingReport.findByPk(req.params.id);
        if (!report) return ReE(res, "Report not found", 404);

        await report.update({ isDeleted: true });
        return ReS(res, { message: "Report deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteReport = deleteReport;

// ───── Process Diagram Files ─────

// Add via URL (no actual upload)
var addDiagramFile = async function (req, res) {
    try {
        const { companyId, fileName, fileUrl } = req.body;
        if (!companyId || !fileName || !fileUrl) {
            return ReE(res, "companyId, fileName, and fileUrl are required", 400);
        }

        const businessProcess = await getOrCreateBusinessProcess(companyId);

        const fileData = { ...req.body, businessProcessId: businessProcess.id };
        delete fileData.companyId; // not a field on ProcessDiagramFile

        const file = await model.ProcessDiagramFile.create(fileData);
        return ReS(res, file, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addDiagramFile = addDiagramFile;

// Upload real file to S3
var uploadDiagramFile = async function (req, res) {
    try {
        const { companyId } = req.body;
        if (!companyId) return ReE(res, "companyId is required", 400);
        if (!req.file) return ReE(res, "No file uploaded", 400);

        const businessProcess = await getOrCreateBusinessProcess(companyId);

        const file = await model.ProcessDiagramFile.create({
            businessProcessId: businessProcess.id,
            fileName: req.file.originalname,
            fileUrl: req.file.location,
            fileSize: req.file.size,
        });

        return ReS(res, file, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.uploadDiagramFile = uploadDiagramFile;

var deleteDiagramFile = async function (req, res) {
    try {
        const file = await model.ProcessDiagramFile.findByPk(req.params.id);
        if (!file) return ReE(res, "File not found", 404);

        await file.update({ isDeleted: true });
        return ReS(res, { message: "File deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteDiagramFile = deleteDiagramFile;