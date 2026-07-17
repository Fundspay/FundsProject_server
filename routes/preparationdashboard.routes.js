const express = require("express");
const router = express.Router();
const prepDashboardController = require("../controllers/preparationdashboard.controller");

router.get("/company/:companyId", prepDashboardController.getDashboard);

module.exports = router;