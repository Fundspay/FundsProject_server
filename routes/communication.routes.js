const express = require("express");
const router = express.Router();
const commController = require("../controllers/communication.controller");

router.get("/templates/company/:companyId", commController.getTemplates);
router.post("/templates/upsert", commController.upsertTemplate);
router.delete("/templates/delete/:id", commController.deleteTemplate);

router.get("/checklist/company/:companyId", commController.getChecklist);
router.post("/checklist/add", commController.addChecklistItem);
router.put("/checklist/update/:id", commController.updateChecklistItem);
router.delete("/checklist/delete/:id", commController.deleteChecklistItem);

router.get("/objections/company/:companyId", commController.getObjections);
router.post("/objections/add", commController.addObjection);
router.put("/objections/update/:id", commController.updateObjection);
router.delete("/objections/delete/:id", commController.deleteObjection);

module.exports = router;