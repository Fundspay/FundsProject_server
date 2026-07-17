const express = require("express");
const router = express.Router();
const analysisDashboardController = require("../controllers/analysisdashboard.controller");

router.get("/company/:companyId", analysisDashboardController.getDashboard);

module.exports = router;