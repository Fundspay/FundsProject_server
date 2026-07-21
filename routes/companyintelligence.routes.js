const express = require("express");
const router = express.Router();
const ciController = require("../controllers/companyintelligence.controller");
const upload = require("../middleware/upload.middleware");

router.post("/add", ciController.add);
router.get("/list", ciController.fetchAll);
router.get("/list/:id", ciController.fetchSingle);
router.get("/company/:companyId", ciController.fetchByCompany);
router.put("/update/:id", ciController.updateRecord);
router.delete("/delete/:id", ciController.deleteRecord);
router.post("/logo/upload", upload.single("file"), ciController.uploadLogo);

module.exports = router;