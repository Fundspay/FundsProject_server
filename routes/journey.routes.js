const express = require("express");
const router = express.Router();
const journeyController = require("../controllers/journey.controller");

// Journey
router.get("/opportunity/:opportunityId", journeyController.getByOpportunity);
router.get("/company/:companyId", journeyController.fetchByCompany);
router.post("/save", journeyController.saveJourney);
router.post("/next-stage", journeyController.moveToNextStage);
router.post("/previous-stage", journeyController.moveToPreviousStage);
router.post("/reset", journeyController.resetJourney);
router.delete("/delete/:id", journeyController.deleteJourney);

// Stage History
router.get("/history/:opportunityId", journeyController.getHistory);
router.post("/history/add", journeyController.addHistoryEntry);
router.post("/history/clear", journeyController.clearHistory);

module.exports = router;