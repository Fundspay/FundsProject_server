"use strict";
const bcrypt = require("bcryptjs");
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Register a new Company
var register = async function (req, res) {
    try {
        const { companyName, email, password, phone, address, city, state, country, pincode, gstNumber, panNumber, website } = req.body;

        if (!companyName || !email || !password || !phone) {
            return ReE(res, "companyName, email, password, and phone are required", 400);
        }

        const existing = await model.Company.findOne({ where: { email, isDeleted: false } });
        if (existing) return ReE(res, "Company with this email already exists", 409);

        const hashedPassword = await bcrypt.hash(password, 10);

        const company = await model.Company.create({
            companyName, email, password: hashedPassword, phone,
            address, city, state, country, pincode, gstNumber, panNumber, website,
        });

        const { password: _, ...companyData } = company.toJSON();
        return ReS(res, companyData, 201);
    } catch (error) {
        return ReE(res, error.message, 422);
    }
};
module.exports.register = register;

// ✅ Login
var login = async function (req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) return ReE(res, "Email and password are required", 400);

        const company = await model.Company.findOne({ where: { email, isDeleted: false } });
        if (!company) return ReE(res, "Company not found", 404);

        const isMatch = await bcrypt.compare(password, company.password);
        if (!isMatch) return ReE(res, "Invalid credentials", 401);

        const { password: _, ...companyData } = company.toJSON();
        return ReS(res, companyData, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.login = login;

// ✅ Fetch all Companies (excluding soft-deleted)
var fetchAll = async function (req, res) {
    try {
        const companies = await model.Company.findAll({
            where: { isDeleted: false },
            attributes: { exclude: ["password"] },
        });
        return ReS(res, { success: true, data: companies }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchAll = fetchAll;

// ✅ Fetch a single Company by ID
var fetchSingle = async function (req, res) {
    try {
        const { id } = req.params;
        if (!id) return ReE(res, "ID is required", 400);

        const company = await model.Company.findByPk(id, {
            attributes: { exclude: ["password"] },
        });
        if (!company) return ReE(res, "Company not found", 404);

        return ReS(res, company, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchSingle = fetchSingle;

// ✅ Update a Company
var updateCompany = async function (req, res) {
    try {
        const company = await model.Company.findByPk(req.params.id);
        if (!company) return ReE(res, "Company not found", 404);

        const updates = { ...req.body };
        delete updates.email; // prevent email change through this route

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        await company.update(updates);

        const { password: _, ...companyData } = company.toJSON();
        return ReS(res, companyData, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.updateCompany = updateCompany;

// ✅ Soft delete a Company
var deleteCompany = async function (req, res) {
    try {
        const company = await model.Company.findByPk(req.params.id);
        if (!company) return ReE(res, "Company not found", 404);

        await company.update({ isDeleted: true });
        return ReS(res, { message: "Company deleted successfully" }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.deleteCompany = deleteCompany;