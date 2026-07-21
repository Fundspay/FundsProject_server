const express = require("express");
const router = express.Router();
const clController = require("../controllers/communicationlog.controller");
const upload = require("../middleware/upload.middleware");

router.post("/add", clController.add);
router.get("/list", clController.fetchAll);
router.get("/list/:id", clController.fetchSingle);
router.get("/company/:companyId", clController.fetchByCompany);
router.put("/update/:id", clController.updateRecord);
router.delete("/delete/:id", clController.deleteRecord);
router.post("/duplicate/:id", clController.duplicateRecord);
router.post("/attachment/upload/:id", upload.single("file"), clController.uploadAttachment);

module.exports = router;