const express = require("express");
const router = express.Router();
const crController = require("../controllers/companyresearch.controller");
const upload = require("../middleware/upload.middleware");

router.post("/add", crController.add);
router.get("/list", crController.fetchAll);
router.get("/list/:id", crController.fetchSingle);
router.get("/company/:companyId", crController.fetchByCompany);
router.put("/update/:id", crController.updateRecord);
router.delete("/delete/:id", crController.deleteRecord);
router.post("/document/upload", upload.single("file"), crController.uploadDocument);

module.exports = router;