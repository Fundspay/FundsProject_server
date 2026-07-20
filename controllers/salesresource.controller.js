"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Get all resources for a company, grouped by category
var getByCompany = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const items = await model.SalesResourceItem.findAll({
            where: { companyId, isDeleted: false },
            order: [["createdAt", "ASC"]],
        });

        const grouped = {};
        items.forEach((item) => {
            const plain = item.get({ plain: true });
            if (!grouped[plain.category]) grouped[plain.category] = [];
            grouped[plain.category].push(plain);
        });

        return ReS(res, { companyId: parseInt(companyId), resources: grouped }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getByCompany = getByCompany;

// ✅ Add a URL entry
var addUrl = async function (req, res) {
    try {
        const { companyId, category, url } = req.body;
        if (!companyId || !category || !url) {
            return ReE(res, "companyId, category, and url are required", 400);
        }

        const item = await model.SalesResourceItem.create({
            companyId, category, docType: "url", url,
        });
        return ReS(res, item, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.addUrl = addUrl;

// ✅ Upload a file (real S3 upload)
var uploadFile = async function (req, res) {
    try {
        const { companyId, category } = req.body;
        if (!companyId || !category) return ReE(res, "companyId and category are required", 400);
        if (!req.file) return ReE(res, "No file uploaded", 400);

        const item = await model.SalesResourceItem.create({
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

// ✅ Soft delete an item
var deleteItem = async function (req, res) {
    try {
        const item = await model.SalesResourceItem.findByPk(req.params.id);
        if (!item) return ReE(res, "Item not found", 404);

        await item.update({ isDeleted: true });
        return ReS(res, { message: "Item deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteItem = deleteItem;