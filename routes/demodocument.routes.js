const express = require("express");
const router = express.Router();
const ddController = require("../controllers/demodocument.controller");
const upload = require("../middleware/upload.middleware");

router.get("/resources/company/:companyId", ddController.getByCompany);
router.post("/resources/url/add", ddController.addUrl);
router.post("/resources/file/upload", upload.single("file"), ddController.uploadFile);
router.delete("/resources/delete/:id", ddController.deleteItem);

router.get("/checklist/company/:companyId", ddController.getChecklist);
router.post("/checklist/add", ddController.addChecklistItem);
router.put("/checklist/update/:id", ddController.updateChecklistItem);
router.delete("/checklist/delete/:id", ddController.deleteChecklistItem);

router.get("/knowledge-summary/company/:companyId", ddController.getKnowledgeSummary);
router.post("/knowledge-summary/upsert", ddController.upsertKnowledgeSummary);

module.exports = router;