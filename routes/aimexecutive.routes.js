const express = require("express");
const router = express.Router();
const aimController = require("../controllers/aimexecutive.controller");

router.get("/dashboard/:companyId", aimController.getDashboard);
router.post("/status/update", aimController.updateStatus);

module.exports = router;