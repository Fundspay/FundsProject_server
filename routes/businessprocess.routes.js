const express = require("express");
const router = express.Router();
const bpController = require("../controllers/businessprocess.controller");
const upload = require("../middleware/upload.middleware");

router.post("/add", bpController.add);
router.get("/list", bpController.fetchAll);
router.get("/list/:id", bpController.fetchSingle);
router.get("/company/:companyId", bpController.fetchByCompany);
router.put("/update/:id", bpController.updateRecord);
router.delete("/delete/:id", bpController.deleteRecord);

router.post("/department/add", bpController.addDepartment);
router.put("/department/update/:id", bpController.updateDepartment);
router.delete("/department/delete/:id", bpController.deleteDepartment);

router.post("/activity/add", bpController.addActivity);
router.put("/activity/update/:id", bpController.updateActivity);
router.delete("/activity/delete/:id", bpController.deleteActivity);

router.post("/report/add", bpController.addReport);
router.put("/report/update/:id", bpController.updateReport);
router.delete("/report/delete/:id", bpController.deleteReport);

router.post("/diagram/add", bpController.addDiagramFile);
router.post("/diagram/upload", upload.single("file"), bpController.uploadDiagramFile);
router.delete("/diagram/delete/:id", bpController.deleteDiagramFile);

module.exports = router;