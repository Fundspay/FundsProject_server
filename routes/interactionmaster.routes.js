const express = require("express");
const router = express.Router();
const imController = require("../controllers/interactionmaster.controller");

router.get("/dashboard/:companyId", imController.getDashboard);
router.post("/status/update", imController.updateStatus);

module.exports = router;