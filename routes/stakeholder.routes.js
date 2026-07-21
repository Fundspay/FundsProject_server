const express = require("express");
const router = express.Router();
const stakeholderController = require("../controllers/stakeholder.controller");
const upload = require("../middleware/upload.middleware");

router.post("/add", stakeholderController.add);
router.get("/list", stakeholderController.fetchAll);
router.get("/list/:id", stakeholderController.fetchSingle);
router.get("/company/:companyId", stakeholderController.fetchByCompany);
router.put("/update/:id", stakeholderController.updateRecord);
router.delete("/delete/:id", stakeholderController.deleteRecord);
router.post("/photo/upload", upload.single("file"), stakeholderController.uploadPhoto);
router.post("/attachment/upload", upload.single("file"), stakeholderController.uploadAttachment);

module.exports = router;