const express = require("express");
const router = express.Router();
const omController = require("../controllers/opportunitymaster.controller");

router.get("/dashboard/:companyId", omController.getDashboard);
router.post("/status/update", omController.updateStatus);
router.post("/negotiation/save", omController.saveNegotiation);

module.exports = router;