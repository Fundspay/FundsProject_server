const express = require("express");
const router = express.Router();
const taController = require("../controllers/technicalarchitecture.controller");
const upload = require("../middleware/upload.middleware");

router.post("/add", taController.add);
router.get("/list", taController.fetchAll);
router.get("/list/:id", taController.fetchSingle);
router.get("/company/:companyId", taController.fetchByCompany);
router.put("/update/:id", taController.updateRecord);
router.delete("/delete/:id", taController.deleteRecord);

router.post("/integration/add", taController.addIntegration);
router.put("/integration/update/:id", taController.updateIntegration);
router.delete("/integration/delete/:id", taController.deleteIntegration);

router.post("/risk/add", taController.addRisk);
router.put("/risk/update/:id", taController.updateRisk);
router.delete("/risk/delete/:id", taController.deleteRisk);

router.post("/reference/add-url", taController.addReferenceUrl);
router.post("/reference/upload", upload.single("file"), taController.uploadReferenceFile);
router.delete("/reference/delete/:id", taController.deleteReference);

module.exports = router;