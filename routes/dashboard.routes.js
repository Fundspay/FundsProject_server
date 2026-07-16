const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

router.get("/company/:companyId", dashboardController.getDashboard);

module.exports = router;