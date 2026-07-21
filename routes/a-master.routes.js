const express = require("express");
const router = express.Router();
const aMasterController = require("../controllers/a-master.controller");

router.get("/dashboard/:companyId", aMasterController.getDashboard);

module.exports = router;