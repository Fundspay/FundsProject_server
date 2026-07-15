const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");

router.post("/register", companyController.register);
router.post("/login", companyController.login);
router.get("/list", companyController.fetchAll);
router.get("/list/:id", companyController.fetchSingle);
router.put("/update/:id", companyController.updateCompany);
router.delete("/delete/:id", companyController.deleteCompany);

module.exports = router;