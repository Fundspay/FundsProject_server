const express = require("express");
const router = express.Router();
const mapDashboardController = require("../controllers/mapdashboard.controller");

router.get("/company/:companyId", mapDashboardController.getDashboard);

module.exports = router;